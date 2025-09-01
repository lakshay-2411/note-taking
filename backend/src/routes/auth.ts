import express from 'express';
import rateLimit from 'express-rate-limit';
import { User } from '../models/User';
import { generateToken } from '../utils/jwt';
import { sendOTPEmail } from '../services/emailService';
import { signupSchema, loginSchema, verifyOTPSchema } from '../utils/validation';
import passport from '../config/passport';

const router = express.Router();

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: { error: 'Too many attempts, please try again later' }
});

const otpLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 3, 
  message: { error: 'Too many OTP requests, please try again later' }
});

const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

router.post('/signup', authLimiter, async (req, res) => {
  try {
    const { error, value } = signupSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details?.[0]?.message || 'Validation error' });
    }

    const { name, email, dateOfBirth } = value;

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    let user = existingUser;
    if (user) {
      user.name = name;
      user.dateOfBirth = new Date(dateOfBirth);
      user.otp = otp;
      user.otpExpiry = otpExpiry;
    } else {
      user = new User({
        name,
        email,
        dateOfBirth: new Date(dateOfBirth),
        otp,
        otpExpiry,
        isVerified: false
      });
    }

    await user.save();

    await sendOTPEmail(email, otp, name);

    res.status(200).json({ 
      message: 'OTP sent to your email address',
      email: email
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', authLimiter, async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details?.[0]?.message || 'Validation error' });
    }

    const { email } = value;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'No account found with this email' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ error: 'Account not verified. Please complete signup first.' });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    await sendOTPEmail(email, otp, user.name);

    res.status(200).json({ 
      message: 'OTP sent to your email address',
      email: email
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/verify-otp', authLimiter, async (req, res) => {
  try {
    const { error, value } = verifyOTPSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details?.[0]?.message || 'Validation error' });
    }

    const { email, otp } = value;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({ error: 'OTP has expired' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = generateToken((user._id as any).toString());

    res.status(200).json({
      message: 'OTP verified successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dateOfBirth: user.dateOfBirth
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/resend-otp', otpLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    await sendOTPEmail(email, otp, user.name);

    res.status(200).json({ message: 'New OTP sent to your email address' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'dummy-client-id') {
    return res.status(400).json({ error: 'Google authentication not configured' });
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'dummy-client-id') {
    return res.redirect(`${process.env.FRONTEND_URL}/signin?error=google_not_configured`);
  }
  
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL}/signin?error=google_auth_failed` 
  })(req, res, async (err?: any) => {
    if (err) {
      console.error('Google callback error:', err);
      return res.redirect(`${process.env.FRONTEND_URL}/signin?error=auth_failed`);
    }
    
    try {
      const user = req.user as any;
      const token = generateToken(user._id.toString());
      
      
      res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
    } catch (error) {
      console.error('Google callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/signin?error=auth_failed`);
    }
  });
});

export default router;
