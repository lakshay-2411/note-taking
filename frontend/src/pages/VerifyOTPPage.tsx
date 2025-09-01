import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { otpSchema, type OTPFormData } from '../utils/validation';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from '../components/Logo';
import bgImage from '../assets/bg.png';

const VerifyOTPPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const email = location.state?.email;

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
  });

  const otpValue = watch('otp');

  useEffect(() => {
    if (!email) {
      navigate('/signin');
      return;
    }
  }, [email, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOTPChange = (value: string, index: number) => {
    const newOtp = (otpValue || '').split('');
    newOtp[index] = value;
    const fullOtp = newOtp.join('').slice(0, 6);
    setValue('otp', fullOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !e.currentTarget.value && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const onSubmit = async (data: OTPFormData) => {
    setIsLoading(true);
    try {
      const response = await authAPI.verifyOTP({
        email,
        otp: data.otp,
      });
      
      login(response.data.token, response.data.user);
      toast.success('Verification successful!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setIsResending(true);
    try {
      await authAPI.resendOTP({ email });
      toast.success('New OTP sent to your email');
      setCountdown(60);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setIsResending(false);
    }
  };

  const renderOTPInputs = () => {
    return Array.from({ length: 6 }, (_, index) => (
      <input
        key={index}
        ref={(el) => {
          otpRefs.current[index] = el;
        }}
        type="text"
        maxLength={1}
        className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
        value={(otpValue || '')[index] || ''}
        onChange={(e) => handleOTPChange(e.target.value, index)}
        onKeyDown={(e) => handleKeyDown(e, index)}
      />
    ));
  };

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-8 text-center">
              <Logo className="text-blue-600 mb-6 justify-center" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify OTP</h1>
              <p className="text-gray-600">
                We've sent a 6-digit code to{' '}
                <span className="font-medium text-gray-900">{email}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                  Enter 6-digit code
                </label>
                <div className="flex justify-center gap-3 mb-4">
                  {renderOTPInputs()}
                </div>
                {errors.otp && (
                  <p className="text-sm text-red-600 text-center">{errors.otp.message}</p>
                )}
                
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={countdown > 0 || isResending}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isResending
                      ? 'Resending...'
                      : countdown > 0
                      ? `Resend OTP (${countdown}s)`
                      : 'Resend OTP'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !otpValue || otpValue.length !== 6}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <button
                onClick={() => navigate('/signin')}
                className="text-gray-600 hover:text-gray-700 text-sm"
              >
                ← Back to signin
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <img 
          src={bgImage} 
          alt="Background" 
          className="absolute inset-0 w-full h-full object-cover" 
        />
      </div>
    </div>
  );
};

export default VerifyOTPPage;
