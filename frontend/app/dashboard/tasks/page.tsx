// This file exists to satisfy Next.js App Router requirements
// The actual tasks view is handled in the main dashboard/page.tsx file
// based on the current route path.

'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const TasksPage = () => {
  const router = useRouter();

  // Redirect to the main dashboard which will handle the tasks view
  // based on the route path
  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return null;
};

export default TasksPage;