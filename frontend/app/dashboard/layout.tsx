// frontend/app/dashboard/layout.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth/context';
import { useRouter, usePathname } from 'next/navigation';
import { FaTasks, FaFolder, FaChartLine, FaCog, FaUser, FaBell, FaSearch, FaEllipsisV, FaTh, FaList, FaColumns, FaHome, FaSignOutAlt } from 'react-icons/fa';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState<string>('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/sign-in');
    } else if (user) {
      // Extract first name from user email or use a default
      const name = user.email.split('@')[0];
      setUserName(name.charAt(0).toUpperCase() + name.slice(1));
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <p className="text-lg text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirect will happen via useEffect
  }

  // Navigation items for sidebar
  const navItems = [
    { href: '/dashboard', label: 'HOME', icon: <FaHome className="text-gray-400" /> },
    { href: '/dashboard/tasks', label: 'TASKS', icon: <FaTasks className="text-gray-400" /> },
    { href: '/dashboard/projects', label: 'PROJECTS', icon: <FaFolder className="text-gray-400" /> },
    { href: '/dashboard/analytics', label: 'ANALYTICS', icon: <FaChartLine className="text-gray-400" /> },
    { href: '/dashboard/settings', label: 'SETTINGS', icon: <FaCog className="text-gray-400" /> },
  ];

  // Right sidebar content - varies by page
  const renderRightSidebar = () => {
    if (pathname === '/dashboard' || pathname === '/dashboard/') {
      // Dashboard specific widgets
      return (
        <div className="w-80 bg-gray-800 border-l border-gray-700 p-6 overflow-auto">
          {/* Project Widgets */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Project Widgets</h3>
            <div className="space-y-4">
              <div className="bg-gray-750 rounded-xl p-4 border border-gray-600">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-white">Focus Time</h4>
                  <FaBell className="text-gray-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">3h 42m</div>
                <p className="text-sm text-gray-400">Time spent in focused work today</p>
                <p className="text-xs text-gray-500 mt-1">+12% from yesterday</p>
              </div>

              <div className="bg-gray-750 rounded-xl p-4 border border-gray-600">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-white">Productivity Score</h4>
                  <FaChartLine className="text-gray-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">85%</div>
                <p className="text-sm text-gray-400">Based on your task completion patterns</p>
              </div>

              <div className="bg-gray-750 rounded-xl p-4 border border-gray-600">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-white">Current Streak</h4>
                  <FaBell className="text-gray-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">7 days</div>
                <p className="text-sm text-gray-400">Keep up the great work!</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-750 transition-colors">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-white">Completed task</p>
                  <p className="text-xs text-gray-400">"Complete project proposal" - 2 minutes ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-750 transition-colors">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-white">Created task</p>
                  <p className="text-xs text-gray-400">"Schedule team meeting" - 1 hour ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-750 transition-colors">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-white">Updated project</p>
                  <p className="text-xs text-gray-400">"Review quarterly reports" - 3 hours ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-750 transition-colors">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-white">Starred task</p>
                  <p className="text-xs text-gray-400">"Prepare presentation slides" - Yesterday</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (pathname.startsWith('/dashboard/tasks')) {
      // Tasks specific widgets
      return (
        <div className="w-80 bg-gray-800 border-l border-gray-700 p-6 overflow-auto">
          {/* Task Widgets */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Task Insights</h3>
            <div className="space-y-4">
              <div className="bg-gray-750 rounded-xl p-4 border border-gray-600">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-white">Focus Time</h4>
                  <FaBell className="text-gray-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">2h 15m</div>
                <p className="text-sm text-gray-400">Time spent on tasks today</p>
                <p className="text-xs text-gray-500 mt-1">+5% from yesterday</p>
              </div>

              <div className="bg-gray-750 rounded-xl p-4 border border-gray-600">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-white">Completion Rate</h4>
                  <FaChartLine className="text-gray-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">78%</div>
                <p className="text-sm text-gray-400">Tasks completed this week</p>
              </div>

              <div className="bg-gray-750 rounded-xl p-4 border border-gray-600">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-white">Current Streak</h4>
                  <FaBell className="text-gray-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">5 days</div>
                <p className="text-sm text-gray-400">Task completion streak</p>
              </div>
            </div>
          </div>

          {/* Task Activity */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Recent Tasks</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-750 transition-colors">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-white">Completed task</p>
                  <p className="text-xs text-gray-400">"Update documentation" - 10 minutes ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-750 transition-colors">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-white">Created task</p>
                  <p className="text-xs text-gray-400">"Review PR #123" - 45 minutes ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-750 transition-colors">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-white">Updated task</p>
                  <p className="text-xs text-gray-400">"Fix bug in login" - 2 hours ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-750 transition-colors">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-white">Reopened task</p>
                  <p className="text-xs text-gray-400">"Improve UI" - 3 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null; // No right sidebar for other pages
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Fixed Left Sidebar */}
      <div className="w-16 bg-gray-800 border-r border-gray-700 transition-all duration-300 flex flex-col">
        <div className="p-2 flex justify-center">
          {/* Removed logo/top icon */}
        </div>

        <nav className="flex-1 py-6 space-y-4 flex flex-col items-center">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`w-12 h-12 rounded-xl flex items-center justify-center relative group ${
                pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                  ? 'text-purple-400'
                  : 'text-gray-400 hover:text-white'
              } transition-colors`}
            >
              {/* Active indicator - soft glow using existing accent color */}
              {pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href)) && (
                <div className="absolute inset-0 rounded-xl bg-purple-500/10 shadow-lg shadow-purple-500/20"></div>
              )}

              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                  ? 'bg-purple-500/10 shadow-lg shadow-purple-500/20'
                  : 'hover:bg-gray-700 hover:shadow-md hover:shadow-gray-500/10'
              }`}>
                <span className="text-lg group-hover:scale-110 transition-transform duration-200">
                  {item.icon}
                </span>
              </div>
              <span className="absolute left-14 bg-gray-700 text-white text-sm font-medium py-1 px-2 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                {item.label}
              </span>
            </a>
          ))}
        </nav>

        <div className="p-2 flex flex-col items-center">
          <button
            onClick={logout}
            className="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-red-500/20 hover:shadow-md hover:shadow-red-500/20 transition-all duration-300 group relative"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300">
              <span className="text-lg text-red-400 group-hover:text-red-300 group-hover:scale-110 transition-transform duration-200">
                <FaSignOutAlt className="text-lg" />
              </span>
            </div>
            <span className="absolute left-14 bg-gray-700 text-red-400 text-sm font-medium py-1 px-2 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
              Logout
            </span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-lg hover:bg-gray-700 transition-colors">
              <FaSearch className="text-gray-400" />
            </button>
            <div className="relative">
              <input
                type="text"
                placeholder="Search tasks, projects..."
                className="bg-gray-700 text-white rounded-lg px-4 py-2 pl-10 w-64 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-lg hover:bg-gray-700 transition-colors relative">
              <FaBell className="text-gray-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <FaUser className="text-white text-sm" />
              </div>
              <span className="text-sm">{userName}</span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>

      {/* Right Content - Varies by page */}
      {renderRightSidebar()}
    </div>
  );
};

export default DashboardLayout;