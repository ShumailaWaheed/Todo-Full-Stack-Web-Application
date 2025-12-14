// frontend/app/dashboard/layout.tsx
'use client';

import React from 'react';
import { useAuth } from '../../lib/auth/context';
import AuthGuard from '../../lib/auth/guard';
import Navbar from '../../components/ui/navbar';

// Dashboard layout that requires authentication
const DashboardLayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthGuard requireAuth={true} fallbackPath="/auth/sign-in">
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </AuthGuard>
  );
};

// Actual dashboard layout with navigation
const DashboardLayoutContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayoutWrapper;