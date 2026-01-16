// frontend/components/layout/client-layout.tsx
'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/auth/context';
import { FaInfinity } from 'react-icons/fa6';
import Header from '../ui/header';
import Footer from '../ui/footer';
import Sidebar from './sidebar';
import { ChatBotButton } from '../../src/components/chatbot';

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  // Don't show header/footer on auth pages
  const isAuthPage = pathname?.startsWith('/auth');
  // Don't show sidebar on home page (marketing page) or auth pages
  const isHomePage = pathname === '/' || pathname === '';
  const showSidebar = !isAuthPage && !isHomePage;

  // Don't show header/sidebar on dashboard pages (they have their own)
  const isDashboardPage = pathname?.startsWith('/dashboard');

  if (loading) {
    // Show loading state while checking auth status
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="relative group cursor-pointer mb-4">
            <div className="absolute -inset-3 bg-[#8b5cf6]/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#ec4899] flex items-center justify-center shadow-2xl relative z-10 overflow-hidden">
               <div className="absolute inset-0 bg-white/10 group-hover:translate-y-full transition-transform duration-500"></div>
               <FaInfinity className="text-white w-8 h-8 animate-pulse" />
            </div>
          </div>
          <div className="w-12 h-12 border-2 border-[#8b5cf6]/20 border-t-[#8b5cf6] rounded-full animate-spin mt-4"></div>
          <p className="text-lg text-gray-400 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (showSidebar && isDashboardPage) {
    // For dashboard pages, the dashboard layout handles its own sidebar
    // So we just return the children here to avoid duplicate sidebars
    return <>{children}</>;
  }

  return (
    <>
      {showSidebar && !isDashboardPage && <Sidebar />}
      {!isAuthPage && <Header />}
      <main className={!isAuthPage ? "min-h-screen pb-24" : ""}>
        {children}
        {/* Only show chatbot on dashboard pages, not on home or auth pages */}
        {!isAuthPage && !isHomePage && <ChatBotButton />}
      </main>
      {!isAuthPage && <Footer />}
    </>
  );
};

export default ClientLayout;