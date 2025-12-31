// frontend/app/dashboard/layout.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth/context';
import { useRouter, usePathname } from 'next/navigation';
import { useMediaQuery } from '../../lib/hooks/use-media-query';
import {
  FaHouse as FaHome,
  FaArrowTrendUp as FaChartLine,
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
} from 'react-icons/fa6';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Components
import GlobalSearch from '../../components/dashboard/global-search';

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const isMobile = useMediaQuery('(max-width: 767px)');

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: <FaHome className="w-5 h-5" /> },
    { href: '/dashboard/tasks', label: 'Operations', icon: <FaTerminal className="w-5 h-5" /> },
    { href: '/dashboard/analytics', label: 'Intelligence', icon: <FaChartLine className="w-5 h-5" /> },
    { href: '/dashboard/vault', label: 'The Vault', icon: <FaShieldHalved className="w-5 h-5" /> },
    { href: '/dashboard/settings', label: 'System', icon: <FaCog className="w-5 h-5" /> },
  ];

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/sign-in');
    } else if (user) {
      const name = user.email.split('@')[0];
      setUserName(name.charAt(0).toUpperCase() + name.slice(1));
    }
  }, [user, loading, router]);

  const handleLogout = () => {
    logout();
    router.push('/auth/sign-in');
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/dashboard/';
    return pathname.startsWith(href);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
      <div className="w-12 h-12 border-2 border-[#8b5cf6]/20 border-t-[#8b5cf6] rounded-full animate-spin"></div>
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-[#8b5cf6]/30 overflow-hidden">
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
        <div className="h-20 flex items-center justify-center relative w-full border-b border-white/5 shadow-2xl">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-3 bg-[#8b5cf6]/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#ec4899] flex items-center justify-center shadow-2xl relative z-10 overflow-hidden">
               <div className="absolute inset-0 bg-white/10 group-hover:translate-y-full transition-transform duration-500"></div>
               <FaInfinity className="text-white text-sm" />
            </div>
          </div>
        </div>

        {/* Navigation Rail - Perfectly Centered */}
        <nav className="flex-1 w-full flex flex-col items-center justify-center gap-8 px-2 relative z-10">
          {navItems.map((item) => (
            <div key={item.href} className="relative group">
              <a
                href={item.href}
                className={`
                  w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-500 relative
                  ${isActive(item.href)
                    ? 'text-[#8b5cf6] bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 shadow-[0_0_20px_rgba(139,92,246,0.3)]'
                    : 'text-white/20 hover:text-white/60 hover:bg-white/5'
                  }
                `}
              >
                <div className={`transition-transform duration-500 ${isActive(item.href) ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-6'}`}>
                  {item.icon}
                </div>

                {/* Tactical Glass Tooltip */}
                <div className="absolute left-16 px-4 py-2 rounded-xl bg-black/90 backdrop-blur-3xl border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500 pointer-events-none whitespace-nowrap z-[100] shadow-[0_0_40px_rgba(0,0,0,0.8)]">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-[#8b5cf6] rounded-full animate-pulse shadow-[0_0_8px_#8b5cf6]"></div>
                    {item.label}
                  </div>
                </div>
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
              Terminate
            </div>
          </button>
        </div>
      </aside>

      {/* Main Vector Surface */}
      <div className={`
        min-h-screen transition-all duration-700 ease-[cubic-bezier(0.2,1,0.3,1)]
        ${isMobile ? '' : 'ml-16'}
      `}>
        {/* Superior Header */}
        <header className="h-20 flex items-center justify-between px-8 relative z-40 border-b border-white/5 bg-black/10 backdrop-blur-md">
           <div className="flex items-center gap-6">
              {isMobile && (
                <button onClick={() => setMobileMenuOpen(true)} className="text-white/60"><FaBars /></button>
              )}
              <div className="flex flex-col">
                 <span className="text-[9px] font-black text-[#8b5cf6] uppercase tracking-[0.4em] mb-0.5">Interface_Ver: 2.0.4</span>
                 <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest leading-none">Command Center</h2>
              </div>
           </div>

           <div className="flex items-center gap-6">
              {/* Internal Search Engine */}
              <div className="hidden lg:block">
                 <GlobalSearch />
              </div>

              {/* Status Indicators */}
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]"></div>
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Global_Sync</span>
                 </div>
                 <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center relative overflow-hidden group cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6] to-[#ec4899] opacity-20 group-hover:opacity-100 transition-opacity"></div>
                    <FaUser className="text-[10px] text-white relative z-10" />
                 </div>
              </div>
           </div>
        </header>

        {/* Content Container */}
        <main className="p-6 md:p-10 lg:p-12 relative z-10 overflow-visible h-full">
          {children}
        </main>
      </div>

      {/* Overlay */}
      {isMobile && mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[45]" onClick={() => setMobileMenuOpen(false)} />
      )}
    </div>
  );
};

export default DashboardLayout;
