// frontend/app/dashboard/tasks/create/page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import TaskForm from '../../../../components/tasks/task-form';
import { apiService } from '../../../../lib/api';
import { useAuth } from '../../../../lib/auth/context';
import { TaskCreate } from '../../../../lib/types';

const CreateTaskPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();

  const handleCreateTask = async (taskData: TaskCreate) => {
    if (!user) return;

    try {
      await apiService.createTask(user.id, taskData);
      // Redirect back to tasks list after successful creation
      router.push('/dashboard/tasks');
      router.refresh();
    } catch (err) {
      console.error('Failed to create task:', err);
      // Error handling would be done in the TaskForm component
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/tasks');
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
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Create Task</h3>
            <p className="mt-1 text-sm text-gray-500">
              Fill out the form to create a new task.
            </p>
          </div>
          <div className="mt-5 md:col-span-2 md:mt-0">
            <TaskForm
              onSubmit={handleCreateTask}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTaskPage;