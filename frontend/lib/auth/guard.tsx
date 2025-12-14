// frontend/lib/auth/guard.tsx
'use client';

import React from 'react';
import { useAuth } from './context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean; // If true, requires authentication; if false, redirects away if authenticated
  fallbackPath?: string; // Where to redirect if auth requirement isn't met
}

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
  fallbackPath = '/auth/sign-in'
}) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      // If this route requires authentication but user is not authenticated
      if (requireAuth && !isAuthenticated) {
        // Store the attempted path for redirect after login
        sessionStorage.setItem('redirectAfterLogin', pathname);
        router.push(fallbackPath);
      }
      // If this route should only be accessible when NOT authenticated but user IS authenticated
      else if (!requireAuth && isAuthenticated) {
        router.push('/dashboard/tasks'); // Redirect to dashboard
      }
    }
  }, [isAuthenticated, loading, requireAuth, fallbackPath, router, pathname]);

  // Show loading state while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // If the auth requirement is met, render the children
  const showContent =
    (requireAuth && isAuthenticated) ||
    (!requireAuth && !isAuthenticated);

  return showContent ? <>{children}</> : null;
};

export default AuthGuard;