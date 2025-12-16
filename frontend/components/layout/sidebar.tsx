// frontend/components/layout/sidebar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaTasks, FaFolder, FaChartBar, FaCheckCircle, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../lib/auth/context';
import { useTheme } from '../../lib/theme/context';

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { theme } = useTheme();

  const navItems = [
    { href: '/dashboard', label: 'Home', icon: <FaHome /> },
    { href: '/dashboard/tasks', label: 'Tasks', icon: <FaTasks /> },
    { href: '/dashboard/projects', label: 'Projects', icon: <FaFolder /> },
    { href: '/dashboard/analytics', label: 'Analytics', icon: <FaChartBar /> },
    { href: '/dashboard/completed', label: 'Completed', icon: <FaCheckCircle /> },
    { href: '/dashboard/settings', label: 'Settings', icon: <FaCog /> },
  ];

  return (
    <aside className="w-20 fixed left-0 top-0 h-screen bg-gradient-to-b from-gray-800/50 to-gray-900/50 border-r border-gray-700/50 flex flex-col shadow-2xl backdrop-blur-sm z-40">
      <nav className="flex-1 py-6 flex flex-col items-center justify-between">
        <ul className="space-y-2 flex flex-col items-center">
          {navItems.map((item) => (
            <li key={item.href} className="w-full flex justify-center">
              <Link
                href={item.href}
                className={`flex flex-col items-center py-3 px-2 rounded-xl transition-all duration-300 group relative ${
                  pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                    ? `text-${theme.accentColor.split(' ')[0].replace('from-', '').replace('500', '400')}`
                    : 'text-gray-400 hover:text-white'
                } ${theme.mode === 'light' ? 'hover:text-gray-900' : ''}`}
              >
                {/* Active indicator - pastel glow capsule */}
                {pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)) && (
                  <div className={`absolute left-0 w-1 h-12 bg-gradient-to-b ${theme.accentColor} rounded-full shadow-lg shadow-purple-500/50 ${theme.mode === 'light' ? 'shadow-gray-500/50' : ''}`}></div>
                )}

                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                    ? `bg-gradient-to-r ${theme.accentColor.replace('500', '500/20')} shadow-lg shadow-${theme.accentColor.split(' ')[0].replace('from-', '').replace('500', '500')}/30`
                    : 'hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 hover:shadow-md hover:shadow-purple-500/20'
                } ${theme.mode === 'light' ? 'hover:shadow-gray-500/10' : ''}`}>
                  <span className="text-lg group-hover:scale-110 transition-transform duration-200">
                    {item.icon}
                  </span>
                </div>
                <span className={`text-xs mt-1 font-medium transition-opacity duration-300 ${
                  pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                    ? 'opacity-100'
                    : 'opacity-0 absolute'
                }`}>
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex flex-col items-center">
          <div className="p-3 border-t border-gray-700/50 flex justify-center">
            <button
              onClick={logout}
              className="flex flex-col items-center py-3 px-2 rounded-xl transition-all duration-300 group relative text-gray-400 hover:text-white"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-gradient-to-r hover:from-pink-500/10 hover:to-red-500/10 hover:shadow-md hover:shadow-pink-500/20 transition-all duration-300">
                <FaSignOutAlt className="text-lg group-hover:scale-110 transition-transform duration-200" />
              </div>
            </button>
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;