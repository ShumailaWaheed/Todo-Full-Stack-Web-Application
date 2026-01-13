// frontend/components/ui/header.tsx
'use client';

import React, { useState } from 'react';
import { useAuth } from '../../lib/auth/context';
import { useTheme } from '../../lib/theme/context';
import { usePathname, useRouter } from 'next/navigation';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  // Only show header on dashboard pages
  if (!pathname?.startsWith('/dashboard')) {
    return null;
  }

  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    if (user) {
      // Call the logout function from the auth context
      logout();
      router.push('/auth/sign-in');
    }
  };

  return (
    <header className="bg-[#0a0a0f] backdrop-blur-3xl border-b border-white/5 px-8 py-6 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-xl font-black text-white uppercase tracking-tighter animate-fade-in">
            Welcome back, <span className="text-[#8b5cf6]">{user ? (user.name || user.email.split('@')[0]?.toUpperCase()) : 'Loading...'}</span> 👋
          </h1>
          <p className="text-[9px] font-bold text-white/30 mt-1 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <span className="font-mono text-[8px]">Status:</span> All systems operational. Ready to manage your tasks.
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <button className="px-6 py-3 bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white text-[10px] font-black rounded-xl hover:from-[#7c3aed] hover:to-[#d946ef] transition-all duration-300 shadow-lg shadow-[#8b5cf6]/30 animate-fade-in uppercase tracking-widest" style={{ animationDelay: '0.3s' }}>
            New Task
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="relative"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#ec4899] flex items-center justify-center text-white font-bold border border-white/20 shadow-lg shadow-[#8b5cf6]/30 overflow-hidden">
                {user?.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user?.email.charAt(0).toUpperCase()
                )}
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#10b981] rounded-full border-2 border-[#0a0a0f] shadow-[0_0_8px_#10b981]"></div>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-[#0a0a0f] backdrop-blur-3xl rounded-2xl border border-white/5 shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                  <p className="text-sm font-black text-white truncate uppercase tracking-tighter">{user?.email}</p>
                  <p className="text-[9px] font-bold text-[#8b5cf6] uppercase tracking-widest">ONLINE - SECURE</p>
                </div>
                <div className="py-2">
                  <button
                    onClick={() => {
                      // Navigate to profile settings
                      router.push('/dashboard/settings');
                      setShowDropdown(false);
                    }}
                    className="block w-full text-left px-5 py-3 text-[10px] font-black text-white/60 hover:text-white hover:bg-white/[0.05] transition-all duration-200 uppercase tracking-widest"
                  >
                    Manage Profile
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowDropdown(false);
                    }}
                    className="block w-full text-left px-5 py-3 text-[10px] font-black text-[#ef4444] hover:text-[#ef4444] hover:bg-[#ef4444]/10 transition-all duration-200 uppercase tracking-widest border-t border-white/5"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
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

        .dropdown-menu {
          animation: fadeIn 0.2s ease-out forwards;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInFromTop {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-in.slide-in-from-top-2.duration-200 {
          animation: slideInFromTop 0.2s ease-out forwards;
        }
      `}</style>
    </header>
  );
};

export default Header;