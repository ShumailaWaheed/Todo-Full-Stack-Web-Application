// frontend/app/dashboard/tasks/create/page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import TaskForm from '../../../../components/tasks/task-form';
import { apiService } from '../../../../lib/api';
import { useAuth } from '../../../../lib/auth/context';
import { TaskCreate, TaskUpdate } from '../../../../lib/types';

const CreateTaskPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();

  const handleCreateTask = async (taskData: TaskCreate) => {
    if (!user) return;

    try {
      await apiService.createTask(user.id, taskData);
      // Redirect back to dashboard after successful creation
      // The dashboard will automatically refresh data when page becomes visible
      router.push('/dashboard');
    } catch (err) {
      console.error('Failed to create task:', err);
      // Show user-friendly error message if it's a network error
      if (err instanceof Error && err.message.includes('Network error')) {
        alert('Unable to create task. Please check your network connection and try again.');
      }
    }
  };

  const handleCancel = () => {
    router.push('/dashboard');
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-lg">Please log in to create tasks</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-gray-800 shadow-lg border border-gray-700 px-6 py-8 sm:rounded-xl sm:p-8">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold text-white">Create Task</h3>
            <p className="mt-1 text-sm text-gray-400">
              Fill out the form to create a new task.
            </p>
          </div>
          <div className="mt-5 md:col-span-2 md:mt-0">
            <TaskForm
              onSubmit={handleCreateTask as (taskData: TaskCreate | TaskUpdate) => Promise<void>}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTaskPage;