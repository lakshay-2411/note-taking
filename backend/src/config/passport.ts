import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import { User, IUser } from '../models/User';

export const initializePassport = () => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.log('Google OAuth credentials not found, skipping Google strategy setup');
    return;
  }
  const callbackURL = process.env.NODE_ENV === 'production' 
    ? `${process.env.BACKEND_URL}/api/auth/google/callback`
    : "/api/auth/google/callback";
  console.log("jell", callbackURL);
  
  passport.use('google', new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: callbackURL,
    scope: ['profile', 'email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      
      if (user) {
        return done(null, user);
      }

      user = await User.findOne({ email: profile.emails![0].value });

      if (user) {
        user.googleId = profile.id;
        user.isVerified = true;
        await user.save();
        return done(null, user);
      }

      user = new User({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails![0].value,
        isVerified: true
      });

      await user.save();
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));

  passport.serializeUser((user: any, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).select('-password');
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};

export default passport;
