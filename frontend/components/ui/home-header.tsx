// frontend/components/ui/home-header.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth/context';
import { useRouter } from 'next/navigation';
import { FaTasks, FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';

const HomeHeader: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => {
    router.push('/auth/sign-up');
  };

  const handleLearnMore = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl scale-100 animate-pulse opacity-80"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl scale-110 animate-ping opacity-20"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl scale-90"></div>
              <div className="relative z-10">
                <FaTasks className="text-white text-lg" />
              </div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_200%]">
              TasklyPro
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {!user ? (
              <>
                <a href="#features" className="text-gray-400 hover:text-white transition-colors text-sm">Features</a>
                <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors text-sm">How It Works</a>
                <button
                  onClick={handleGetStarted}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg shadow-purple-500/25"
                >
                  Get Started
                </button>
              </>
            ) : (
              <button
                onClick={() => router.push('/dashboard')}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg shadow-purple-500/25"
              >
                Go to Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </nav>
  );
};

export default HomeHeader;