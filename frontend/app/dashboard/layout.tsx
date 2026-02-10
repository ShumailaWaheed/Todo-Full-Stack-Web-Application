// frontend/app/dashboard/layout.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth/context';
import { useRouter, usePathname } from 'next/navigation';
import { useMediaQuery } from '../../lib/hooks/use-media-query';
import { ToastProvider } from '../../components/ui/toast';
import { TaskProvider } from '../../lib/context/task-context';
import {
  FaHouse as FaHome,
  FaChartLine,
  FaGear as FaCog,
  FaArrowRightFromBracket as FaSignOutAlt,
  FaMagnifyingGlass as FaSearch,
  FaBell,
  FaUser,
  FaBars,
  FaXmark as FaTimes,
  FaPlus,
  FaFire,
  FaMoon,
  FaSun,
  FaTerminal,
  FaInfinity,
  FaShieldHalved,
  FaCubes,
  FaFolder,
  FaCheck,
  FaGauge,
  FaClock,
} from 'react-icons/fa6';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Components
import GlobalSearch from '../../components/dashboard/global-search';
import { EnhancedChatBotButton } from '../../components/chatbot';

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  const navItems = [
    { href: '/', label: 'Home', icon: <FaHome className="w-5 h-5" /> },
    { href: '/dashboard/tasks', label: 'Tasks', icon: <FaTerminal className="w-5 h-5" /> },
    { href: '/dashboard/analytics', label: 'Analytics', icon: <FaChartLine className="w-5 h-5" /> },
    { href: '/dashboard/completed', label: 'Completed', icon: <FaCheck className="w-5 h-5" /> },
    { href: '/dashboard/settings', label: 'Settings', icon: <FaCog className="w-5 h-5" /> },
  ];

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Backend health check
  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const checkBackend = async () => {
      try {
        setBackendStatus('checking');
        const res = await fetch(API_URL, { method: 'GET', signal: AbortSignal.timeout(5000) });
        setBackendStatus(res.ok ? 'online' : 'offline');
      } catch {
        setBackendStatus('offline');
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 30000); // check every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/sign-in');
    } else if (user) {
      const name = user.name || user.email.split('@')[0];
      setUserName(name.charAt(0).toUpperCase() + name.slice(1));
    }
  }, [user, loading, router]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const profileElement = document.getElementById('profile-dropdown');
      if (profileElement && !profileElement.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Get page title from pathname
  const getPageTitle = (): string => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname.includes('/tasks')) return 'Tasks';
    if (pathname.includes('/analytics')) return 'Analytics';
    if (pathname.includes('/completed')) return 'Completed';
    if (pathname.includes('/settings')) return 'Settings';
    if (pathname.includes('/projects')) return 'Projects';
    return 'Dashboard';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/' || pathname === '' || pathname === '/?stayOnHome=true';
    return pathname.startsWith(href);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
      <div className="w-12 h-12 border-2 border-[#8b5cf6]/20 border-t-[#8b5cf6] rounded-full animate-spin"></div>
    </div>
  );

  if (!user) return null;

  return (
    <ToastProvider>
      <TaskProvider>
      <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-[#8b5cf6]/30 overflow-x-hidden">
        {/* Advanced Event Horizon Background FX */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#050508]">
           {/* Noise Base */}
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] brightness-100 contrast-150 mix-blend-overlay"></div>

           {/* 3D Warp Grid (Event Horizon) */}
           <div className="absolute inset-0 flex items-center justify-center">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="absolute inset-0 animate-[event-horizon_15s_linear_infinite]"
                  style={{
                    backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)`,
                    backgroundSize: '80px 80px',
                    backgroundPosition: 'center',
                    animationDelay: `${i * -5}s`
                  }}
                ></div>
              ))}
           </div>

           {/* Vertical Scanline Pulse */}
           <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#8b5cf6]/5 to-transparent h-1/4 w-full animate-[scanline_8s_linear_infinite] opacity-30"></div>

           {/* Ambient Core Glows */}
           <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#8b5cf6]/10 blur-[150px] rounded-full animate-pulse"></div>
           <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#ec4899]/5 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>

           {/* Static Center Point Glow */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#8b5cf6]/40 blur-xl rounded-full"></div>
        </div>

        {/* Sidebar - Floating Glass Rail */}
        <aside
          className={`
            fixed left-0 top-0 h-full z-50
            bg-black/80 backdrop-blur-3xl
            border-r border-white/5
            transition-all duration-700 ease-[cubic-bezier(0.2,1,0.3,1)]
            flex flex-col items-center
            ${isMobile ? (mobileMenuOpen ? 'w-64 translate-x-0' : '-translate-x-full w-64') : 'w-16 translate-x-0'}
          `}
        >
          {/* Logo Section */}
          <div className="h-14 md:h-20 flex items-center justify-center relative w-full border-b border-white/5 shadow-2xl">
            <a href="/dashboard" className="relative group cursor-pointer">
              <div className="absolute -inset-3 bg-[#8b5cf6]/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#ec4899] flex items-center justify-center shadow-2xl relative z-10 overflow-hidden">
                 <div className="absolute inset-0 bg-white/10 group-hover:translate-y-full transition-transform duration-500"></div>
                 <FaInfinity className="text-white text-sm" />
              </div>
            </a>
          </div>

          {/* Mobile Close Button */}
          {isMobile && mobileMenuOpen && (
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all z-[60]"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          )}

          {/* Navigation Rail */}
          <nav className="flex-1 w-full flex flex-col items-center justify-center gap-4 md:gap-8 px-2 relative z-10">
            {navItems.map((item) => (
              <div key={item.href} className="relative group w-full flex justify-center">
                <a
                  href={item.href}
                  onClick={() => isMobile && setMobileMenuOpen(false)}
                  className={`
                    ${isMobile ? 'w-full mx-3 px-4 py-3 flex items-center gap-4' : 'w-12 h-12 flex items-center justify-center'}
                    rounded-2xl transition-all duration-500 relative
                    ${isActive(item.href)
                      ? 'text-[#8b5cf6] bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 shadow-[0_0_20px_rgba(139,92,246,0.3)]'
                      : 'text-white/20 hover:text-white/60 hover:bg-white/5'
                    }
                  `}
                >
                  <div className={`transition-transform duration-500 ${isActive(item.href) ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-6'}`}>
                    {item.icon}
                  </div>

                  {/* Label shown on mobile sidebar */}
                  {isMobile && (
                    <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                  )}

                  {/* Tactical Glass Tooltip - desktop only */}
                  {!isMobile && (
                  <div className="absolute left-16 px-4 py-2 rounded-xl bg-black/90 backdrop-blur-3xl border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500 pointer-events-none whitespace-nowrap z-[100] shadow-[0_0_40px_rgba(0,0,0,0.8)]">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-[#8b5cf6] rounded-full animate-pulse shadow-[0_0_8px_#8b5cf6]"></div>
                      {item.label}
                    </div>
                  </div>
                  )}
                </a>
                {isActive(item.href) && (
                  <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#8b5cf6] rounded-r-full shadow-[0_0_15px_#8b5cf6]"></div>
                )}
              </div>
            ))}
          </nav>

          {/* System Health Module */}
          <div className="mt-auto flex flex-col items-center gap-4 py-8 w-full border-t border-white/5">
             <div className="relative group cursor-help">
                <div className="w-1.5 h-10 rounded-full bg-white/5 overflow-hidden relative shadow-inner">
                   <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#8b5cf6] to-[#ec4899] animate-[height-pulse_4s_infinite] shadow-[0_0_12px_#8b5cf6]"></div>
                </div>
                {/* Tactical Status Tooltip */}
                <div className="absolute left-16 bottom-0 px-4 py-2 rounded-xl bg-black/90 backdrop-blur-3xl border border-[#10b981]/30 text-[9px] font-black uppercase tracking-[0.25em] text-[#10b981] opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500 pointer-events-none whitespace-nowrap z-[100] shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                  <div className="flex items-center gap-3">
                     <div className="w-1.5 h-1.5 bg-[#10b981] rounded-full shadow-[0_0_8px_#10b981]"></div>
                     SYS_ACTIVE: 100%
                  </div>
                </div>
             </div>
          </div>

          {/* Exit Vector */}
          <div className="h-20 flex items-center justify-center w-full bg-black/40 border-t border-white/5">
            <button
              onClick={handleLogout}
              className="w-12 h-12 flex items-center justify-center rounded-2xl text-[#ef4444]/30 hover:text-[#ef4444] hover:bg-[#ef4444]/15 transition-all duration-500 group relative"
            >
              <FaSignOutAlt className="text-xl transition-transform group-hover:-translate-x-1" />
              <div className="absolute left-16 px-4 py-2 rounded-xl bg-black/90 backdrop-blur-3xl border border-[#ef4444]/30 text-[10px] font-black uppercase tracking-[0.2em] text-[#ef4444] opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500 pointer-events-none whitespace-nowrap z-[100] shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                Logout
              </div>
            </button>
          </div>
        </aside>

        {/* Main Vector Surface */}
        <div className={`
          min-h-screen flex flex-col transition-all duration-700 ease-[cubic-bezier(0.2,1,0.3,1)]
          ${isMobile ? '' : 'ml-16'}
        `}>
          {/* Superior Header */}
          <header className="h-14 md:h-16 flex items-center justify-between px-3 md:px-6 fixed top-0 right-0 z-40 border-b border-white/5 bg-black/80 backdrop-blur-xl" style={{ left: isMobile ? '0' : '4rem' }}>
             {/* Left: Menu + Page Title */}
             <div className="flex items-center gap-2 md:gap-4">
                {isMobile && (
                  <button onClick={() => setMobileMenuOpen(true)} className="text-white/60 p-1.5"><FaBars className="w-4 h-4" /></button>
                )}
                <div className="flex flex-col">
                   <h2 className="text-sm md:text-base font-black text-white uppercase tracking-tight leading-none">{getPageTitle()}</h2>
                   <span className="text-[8px] md:text-[9px] font-bold text-white/25 uppercase tracking-widest mt-0.5">{formatDate(currentTime)}</span>
                </div>
             </div>

             {/* Right: Search + Status + Clock + Profile */}
             <div className="flex items-center gap-2 md:gap-4">
                {/* Search - Desktop only */}
                <div className="hidden md:block">
                   <GlobalSearch />
                </div>

                {/* Live Clock - Desktop/Tablet */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5">
                   <FaClock className="text-[#8b5cf6] text-[9px]" />
                   <span className="text-[10px] font-mono font-bold text-white/50 tabular-nums">{formatTime(currentTime)}</span>
                </div>

                {/* Backend Status */}
                <div className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 cursor-default" title={`Backend: ${backendStatus}`}>
                   <div className={`w-1.5 h-1.5 rounded-full ${
                     backendStatus === 'online' ? 'bg-[#10b981] shadow-[0_0_6px_#10b981]' :
                     backendStatus === 'offline' ? 'bg-[#ef4444] shadow-[0_0_6px_#ef4444]' :
                     'bg-[#f59e0b] animate-pulse'
                   }`}></div>
                   <span className="hidden md:inline text-[9px] font-black text-white/30 uppercase tracking-widest">
                     {backendStatus === 'online' ? 'Online' : backendStatus === 'offline' ? 'Offline' : 'Checking'}
                   </span>
                </div>

                {/* Profile Dropdown */}
                <div id="profile-dropdown" className="relative">
                   <div
                     className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/5 cursor-pointer transition-all group"
                     onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                   >
                      <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#ec4899] flex items-center justify-center relative overflow-hidden">
                         <span className="text-[10px] md:text-xs font-black text-white relative z-10">
                           {userName ? userName.charAt(0).toUpperCase() : 'U'}
                         </span>
                      </div>
                      <span className="hidden md:block text-[10px] font-black text-white/60 uppercase tracking-wider group-hover:text-white/80 transition-colors">{userName}</span>
                   </div>

                   {/* Dropdown Menu */}
                   {profileDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-black/95 backdrop-blur-3xl border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                         {/* User Info */}
                         <div className="px-4 py-3 border-b border-white/5">
                            <p className="text-xs font-black text-white uppercase tracking-tight">{userName}</p>
                            <p className="text-[9px] font-medium text-white/30 mt-0.5 truncate">{user?.email}</p>
                         </div>
                         <div className="py-1">
                            <button
                               onClick={() => { router.push('/dashboard'); setProfileDropdownOpen(false); }}
                               className="w-full text-left px-4 py-2.5 text-[10px] font-black text-white/60 hover:text-white hover:bg-white/5 uppercase tracking-widest transition-all flex items-center gap-3"
                            >
                               <FaGauge className="text-[#8b5cf6]" /> Dashboard
                            </button>
                            <button
                               onClick={() => { router.push('/dashboard/tasks'); setProfileDropdownOpen(false); }}
                               className="w-full text-left px-4 py-2.5 text-[10px] font-black text-white/60 hover:text-white hover:bg-white/5 uppercase tracking-widest transition-all flex items-center gap-3"
                            >
                               <FaTerminal className="text-[#3b82f6]" /> My Tasks
                            </button>
                            <button
                               onClick={() => { router.push('/dashboard/settings'); setProfileDropdownOpen(false); }}
                               className="w-full text-left px-4 py-2.5 text-[10px] font-black text-white/60 hover:text-white hover:bg-white/5 uppercase tracking-widest transition-all flex items-center gap-3"
                            >
                               <FaCog className="text-[#f59e0b]" /> Settings
                            </button>
                         </div>
                         <div className="border-t border-white/5 py-1">
                            <button
                               onClick={() => { handleLogout(); setProfileDropdownOpen(false); }}
                               className="w-full text-left px-4 py-2.5 text-[10px] font-black text-[#ef4444]/70 hover:text-[#ef4444] hover:bg-[#ef4444]/5 uppercase tracking-widest transition-all flex items-center gap-3"
                            >
                               <FaSignOutAlt /> Logout
                            </button>
                         </div>
                      </div>
                   )}
                </div>
             </div>
          </header>

          {/* Content Container */}
          <main className="pt-16 px-2 pb-24 md:pt-24 md:px-10 lg:px-12 relative z-10 flex-grow overflow-y-auto">
            {children}
            <EnhancedChatBotButton />
          </main>
        </div>

        {/* Overlay */}
        {isMobile && mobileMenuOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[45]" onClick={() => setMobileMenuOpen(false)} />
        )}
      </div>
      </TaskProvider>
    </ToastProvider>
  );
};

export default DashboardLayout;
