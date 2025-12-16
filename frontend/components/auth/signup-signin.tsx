// frontend/components/auth/signup-signin.tsx
'use client';

import React, { useState } from 'react';
import { useAuth } from '../../lib/auth/context';
import { useRouter } from 'next/navigation';
import { FaEnvelope, FaPhone, FaUser, FaLock, FaEye, FaEyeSlash, FaGoogle, FaApple, FaFacebookF, FaTimes, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

// SVG Illustration Component
const AuthIllustration = () => (
  <div className="mb-8 flex justify-center">
    <svg width="120" height="120" viewBox="0 0 120 120" className="w-30 h-30">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#a78bfa', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#c084fc', stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#60a5fa', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#38bdf8', stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#34d399', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#6ee7b7', stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      {/* Main circle background */}
      <circle cx="60" cy="60" r="55" fill="url(#grad1)" opacity="0.2" />

      {/* Task list items */}
      <rect x="25" y="30" width="70" height="12" rx="6" fill="url(#grad2)" opacity="0.8" />
      <rect x="25" y="48" width="70" height="12" rx="6" fill="url(#grad2)" opacity="0.6" />
      <rect x="25" y="66" width="70" height="12" rx="6" fill="url(#grad2)" opacity="0.4" />

      {/* Checkmark */}
      <path d="M45 85 L55 95 L75 75" stroke="url(#grad3)" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* Shield */}
      <path d="M85 25 L95 35 L95 55 L85 65 L75 65 L65 75 L55 75 L45 65 L35 65 L25 55 L25 35 L35 25 Z"
            fill="none" stroke="url(#grad1)" strokeWidth="2" opacity="0.7" />

      {/* Glow effect */}
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </svg>
  </div>
);

const SignupSignin = () => {
  const [isSignup, setIsSignup] = useState(true);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isSignup) {
      // Validate sign up fields
      if (authMethod === 'email' && !email) {
        setError('Email is required');
        return;
      }
      if (authMethod === 'phone' && !phone) {
        setError('Phone number is required');
        return;
      }
      if (!password) {
        setError('Password is required');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (isSignup && !fullName) {
        setError('Full name is required');
        return;
      }
    } else {
      // Validate sign in fields
      if (authMethod === 'email' && !email) {
        setError('Email is required');
        return;
      }
      if (authMethod === 'phone' && !phone) {
        setError('Phone number is required');
        return;
      }
      if (!password) {
        setError('Password is required');
        return;
      }
    }

    setLoading(true);

    try {
      // For demo purposes, we'll use email for login
      const loginData = { email, password };
      await login(email, password);
      router.push('/dashboard/tasks');
      router.refresh();
    } catch (err) {
      console.error('Authentication failed:', err);
      setError('Authentication failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Logging in with ${provider}`);
    // In a real app, this would redirect to the OAuth provider
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-700/50 animate-fade-in">
        <AuthIllustration />

        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            {isSignup ? 'Create an account' : 'Welcome back'}
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {isSignup
              ? 'Already have an account? '
              : 'New to TasklyPro? '}
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="font-medium text-purple-400 hover:text-purple-300 transition-colors duration-200"
            >
              {isSignup ? 'Sign in' : 'Create Account'}
            </button>
          </p>
        </div>

        {/* Auth Method Toggle */}
        <div className="flex bg-gray-700/30 rounded-xl p-1 mt-6">
          <button
            onClick={() => setAuthMethod('email')}
            className={`flex-1 flex items-center justify-center py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
              authMethod === 'email'
                ? 'bg-purple-600/30 text-purple-300 shadow-lg shadow-purple-500/20'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <FaEnvelope className="mr-2" size={14} />
            Email
          </button>
          <button
            onClick={() => setAuthMethod('phone')}
            className={`flex-1 flex items-center justify-center py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
              authMethod === 'phone'
                ? 'bg-purple-600/30 text-purple-300 shadow-lg shadow-purple-500/20'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <FaPhone className="mr-2" size={14} />
            Phone
          </button>
        </div>

        {error && (
          <div className="rounded-md bg-red-500/20 p-4 border border-red-500/30 animate-fade-in">
            <div className="flex">
              <FaTimes className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md space-y-4">
            {isSignup && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="appearance-none rounded-xl relative block w-full px-12 py-3.5 bg-gray-700/30 border border-gray-600 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 shadow-sm focus:shadow-lg focus:shadow-purple-500/20"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            )}

            {authMethod === 'email' ? (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none rounded-xl relative block w-full px-12 py-3.5 bg-gray-700/30 border border-gray-600 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 shadow-sm focus:shadow-lg focus:shadow-purple-500/20"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="appearance-none rounded-xl relative block w-full px-12 py-3.5 bg-gray-700/30 border border-gray-600 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 shadow-sm focus:shadow-lg focus:shadow-purple-500/20"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-xl relative block w-full px-12 py-3.5 pr-12 bg-gray-700/30 border border-gray-600 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 shadow-sm focus:shadow-lg focus:shadow-purple-500/20"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-gray-400" />
                  ) : (
                    <FaEye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {isSignup && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none rounded-xl relative block w-full px-12 py-3.5 pr-12 bg-gray-700/30 border border-gray-600 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 shadow-sm focus:shadow-lg focus:shadow-purple-500/20"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-gray-400" />
                    ) : (
                      <FaEye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-purple-400 hover:text-purple-300 transition-colors duration-200">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
            >
              {loading ? (
                <span>Processing...</span>
              ) : (
                <span className="flex items-center">
                  {isSignup ? <FaUserPlus className="mr-2" /> : <FaSignInAlt className="mr-2" />}
                  {isSignup ? 'Sign Up' : 'Sign In'}
                </span>
              )}
            </button>
          </div>
        </form>

        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-transparent text-gray-400">or continue with</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <button
            onClick={() => handleSocialLogin('google')}
            className="w-full inline-flex justify-center py-3 px-4 rounded-xl border border-gray-600 bg-gray-700/30 text-sm font-medium text-gray-300 hover:bg-gray-600/30 transition-all duration-200 shadow-sm hover:shadow-lg hover:shadow-purple-500/10"
          >
            <FcGoogle size={20} />
          </button>
          <button
            onClick={() => handleSocialLogin('apple')}
            className="w-full inline-flex justify-center py-3 px-4 rounded-xl border border-gray-600 bg-gray-700/30 text-sm font-medium text-gray-300 hover:bg-gray-600/30 transition-all duration-200 shadow-sm hover:shadow-lg hover:shadow-purple-500/10"
          >
            <FaApple className="text-white" size={20} />
          </button>
          <button
            onClick={() => handleSocialLogin('facebook')}
            className="w-full inline-flex justify-center py-3 px-4 rounded-xl border border-gray-600 bg-gray-700/30 text-sm font-medium text-gray-300 hover:bg-gray-600/30 transition-all duration-200 shadow-sm hover:shadow-lg hover:shadow-purple-500/10"
          >
            <FaFacebookF className="text-blue-400" size={20} />
          </button>
        </div>

        <div className="text-center mt-8 pt-6 border-t border-gray-700/50">
          <p className="text-sm text-gray-400">
            By continuing, you agree to our{' '}
            <a href="#" className="font-medium text-purple-400 hover:text-purple-300 transition-colors duration-200">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="font-medium text-purple-400 hover:text-purple-300 transition-colors duration-200">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default SignupSignin;