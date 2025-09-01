import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginSchema, type LoginFormData } from '../utils/validation';
import { authAPI } from '../services/api';
import { Logo } from '../components/Logo';
import { Mail } from 'lucide-react';
import bgImage from '../assets/bg.png';

const SigninPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(data);
      toast.success(response.data.message);
      navigate('/verify-otp', { 
        state: { 
          email: data.email,
          fromSignup: false 
        } 
      });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignin = () => {
    authAPI.googleAuth();
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-8">
              <Logo className="text-blue-600 mb-6" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in</h1>
              <p className="text-gray-600">Please login to continue to your account.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...register('email')}
                    type="email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    placeholder="jonas_kahnwald@gmail.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="keepLoggedIn"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="keepLoggedIn" className="ml-2 text-sm text-gray-700">
                  Keep me logged in
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isLoading ? 'Sending OTP...' : 'Sign in'}
              </button>

              <button
                type="button"
                onClick={handleGoogleSignin}
                className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </form>

            <div className="mt-8 text-center">
              <span className="text-gray-600">Need an account? </span>
              <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                Create one
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-blue-300 bg-opacity-10"></div>
          </div>
          
          <div className="absolute bottom-0 right-0 w-full h-full">
            <div className="relative w-full h-full overflow-hidden">
              <div className="absolute bottom-0 right-0 transform rotate-12 translate-x-1/4 translate-y-1/4">
                <div className="w-96 h-96 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full opacity-80 blur-xl"></div>
              </div>
              <div className="absolute bottom-0 right-0 transform rotate-45 translate-x-1/3 translate-y-1/3">
                <div className="w-80 h-80 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full opacity-60 blur-lg"></div>
              </div>
              <div className="absolute bottom-0 right-0 transform -rotate-12 translate-x-1/5 translate-y-1/5">
                <div className="w-72 h-72 bg-gradient-to-r from-blue-300 to-blue-500 rounded-full opacity-90 blur-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div> */}

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

export default SigninPage;
