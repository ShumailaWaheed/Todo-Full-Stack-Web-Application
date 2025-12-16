'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth/context';
import HomeContent from '../components/home/home';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // If authenticated, redirect to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Show loading state while checking auth status
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center">
          <p className="text-lg text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated, redirect will happen via useEffect
  // If not authenticated, show the home content as a marketing page
  if (!user) {
    return <HomeContent />;
  }

  // This will only render briefly before redirect
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-black">
      <div className="text-center">
        <p className="text-lg text-gray-400">Redirecting...</p>
      </div>
    </div>
  );
}
