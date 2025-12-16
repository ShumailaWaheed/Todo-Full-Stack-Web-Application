// frontend/components/ui/header.tsx
'use client';

import React from 'react';
import { useAuth } from '../../lib/auth/context';
import { useTheme } from '../../lib/theme/context';
import { usePathname } from 'next/navigation';

const Header: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const pathname = usePathname();

  // Only show header on dashboard pages
  if (!pathname?.startsWith('/dashboard')) {
    return null;
  }

  return (
    <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 px-6 py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className={`text-2xl font-bold ${theme.mode === 'light' ? 'text-gray-900' : 'text-white'} animate-fade-in`}>
            Welcome back, <span className={`text-transparent bg-clip-text bg-gradient-to-r ${theme.accentColor}`}>{user?.email.split('@')[0]}</span> 👋
          </h1>
          <p className={`text-sm ${theme.mode === 'light' ? 'text-gray-600' : 'text-gray-400'} mt-1 animate-fade-in`} style={{ animationDelay: '0.2s' }}>
            <span className="font-mono text-xs">System:</span> Ready to boost your productivity. All systems operational.
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <button className={`px-6 py-2.5 bg-gradient-to-r ${theme.accentColor} text-white font-medium rounded-lg hover:opacity-90 transition-all duration-300 shadow-lg shadow-purple-500/20 animate-fade-in ${theme.mode === 'light' ? 'shadow-gray-500/20' : ''}`} style={{ animationDelay: '0.3s' }}>
            New Task
          </button>
          <div className="relative">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${theme.accentColor} flex items-center justify-center ${theme.mode === 'light' ? 'text-gray-900' : 'text-white'} font-bold`}>
              {user?.email.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-800"></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
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
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </header>
  );
};

export default Header;