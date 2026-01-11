// frontend/components/auth/signup.tsx
'use client';

import React, { useState } from 'react';
import { useAuth } from '../../lib/auth/context';
import { useRouter } from 'next/navigation';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaTimes, FaCheck, FaGoogle, FaGithub } from 'react-icons/fa';

const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailExists, setEmailExists] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  const validateForm = () => {
    if (!name.trim()) {
      setError('Name is required');
      return false;
    }

    if (!email.trim()) {
      setError('Email is required');
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email address is invalid');
      return false;
    }

    if (emailExists) {
      setError('An account with this email already exists. Please sign in instead.');
      return false;
    }

    if (!password) {
      setError('Password is required');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    setError(null);
    return true;
  };

  // Check if email already exists before submitting
  const checkEmailExists = async () => {
    if (!email) return false;

    try {
      // Make a request to check if user exists
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002'}/auth/check-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setEmailExists(data.exists);

      if (data.exists) {
        setError('An account with this email already exists. Please sign in instead.');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error checking email:', err);
      // If there's an error checking, continue with signup
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if email already exists before submitting
    const emailExists = await checkEmailExists();
    if (emailExists) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      // Redirect to dashboard after successful registration
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      console.error('Registration failed:', err);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle social login (Google)
  const handleGoogleLogin = () => {
    // In a real implementation, this would redirect to Google OAuth
    setError('Google login is not implemented yet in this demo');
  };

  // Handle social login (GitHub)
  const handleGithubLogin = () => {
    // In a real implementation, this would redirect to GitHub OAuth
    setError('GitHub login is not implemented yet in this demo');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-700/50 animate-fade-in">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <a
              href="/auth/sign-in"
              className="font-medium text-purple-400 hover:text-purple-300 transition-colors duration-200"
            >
              Sign in
            </a>
          </p>
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

        {/* Social Login Buttons */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800/50 text-gray-400">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={handleGoogleLogin}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-600 rounded-md shadow-sm bg-gray-700/50 text-sm font-medium text-white hover:bg-gray-600/50 transition-colors duration-200"
            >
              <FaGoogle className="h-5 w-5" />
              <span className="ml-2">Google</span>
            </button>

            <button
              onClick={handleGithubLogin}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-600 rounded-md shadow-sm bg-gray-700/50 text-sm font-medium text-white hover:bg-gray-600/50 transition-colors duration-200"
            >
              <FaGithub className="h-5 w-5" />
              <span className="ml-2">GitHub</span>
            </button>
          </div>
        </div>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
          </div>
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (emailExists) setEmailExists(false);
                  }}
                  className="appearance-none rounded-lg relative block w-full px-12 py-3 bg-gray-700/50 border border-gray-600 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email Address
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
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailExists) setEmailExists(false);
                  }}
                  onBlur={checkEmailExists} // Check email when user leaves the field
                  className={`appearance-none rounded-lg relative block w-full px-12 py-3 bg-gray-700/50 border ${emailExists ? 'border-red-500' : 'border-gray-600'} placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300`}
                  placeholder="Enter your email"
                />
                {emailExists && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <FaTimes className="h-5 w-5 text-red-400" />
                  </div>
                )}
              </div>
              {emailExists && (
                <p className="mt-1 text-sm text-red-400">An account with this email already exists</p>
              )}
            </div>

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
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full px-12 py-3 pr-12 bg-gray-700/50 border border-gray-600 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  placeholder="Create a password"
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
              <p className="mt-1 text-xs text-gray-400">Use at least 6 characters</p>
            </div>

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
                  className="appearance-none rounded-lg relative block w-full px-12 py-3 pr-12 bg-gray-700/50 border border-gray-600 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
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
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-300">
              I agree to the <a href="#" className="text-purple-400 hover:text-purple-300">Terms of Service</a> and <a href="#" className="text-purple-400 hover:text-purple-300">Privacy Policy</a>
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-all duration-200 transform hover:scale-[1.02] shadow-lg shadow-purple-500/20"
            >
              {loading ? (
                <span>Creating account...</span>
              ) : (
                <span className="flex items-center">
                  <FaCheck className="mr-2" />
                  Create Account
                </span>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default Signup;