// frontend/components/layout/client-layout.tsx
'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/auth/context';
import Header from '../ui/header';
import Footer from '../ui/footer';
import Sidebar from './sidebar';

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  // Don't show header/footer on auth pages
  const isAuthPage = pathname?.startsWith('/auth');
  // Don't show sidebar on auth pages
  const showSidebar = user && !isAuthPage;

  // Don't show header/sidebar on dashboard pages (they have their own)
  const isDashboardPage = pathname?.startsWith('/dashboard');

  if (loading) {
    // Show loading state while checking auth status
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-400">Loading...</p>
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
      {!isAuthPage && <Header />}
      <main className={!isAuthPage ? "min-h-screen" : ""}>
        {children}
      </main>
      {!isAuthPage && <Footer />}
    </>
  );
};

export default ClientLayout;