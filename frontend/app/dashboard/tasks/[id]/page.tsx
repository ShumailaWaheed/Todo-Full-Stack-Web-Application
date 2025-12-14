// frontend/app/dashboard/tasks/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../lib/auth/context';
import { apiService } from '../../../../lib/api';
import { Task } from '../../../../lib/types';
import TaskDetail from '../../../../components/tasks/task-detail';
import TaskEditForm from '../../../../components/tasks/task-edit-form';

const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && id) {
      loadTask();
    }
  }, [user, id]);

  const loadTask = async () => {
    if (!user || !id) return;

    try {
      setLoading(true);
      const fetchedTask = await apiService.getTask(user.id, id);
      setTask(fetchedTask);
    } catch (err) {
      console.error('Failed to load task:', err);
      setError('Failed to load task. It may not exist or you may not have permission to view it.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async (taskId: string, taskData: any) => {
    if (!user) return;

    try {
      const updatedTask = await apiService.updateTask(user.id, taskId, taskData);
      setTask(updatedTask);
      setEditing(false);
    } catch (err) {
      console.error('Failed to update task:', err);
      setError('Failed to update task. Please try again.');
    }
  };

  const handleToggleComplete = async (taskToToggle: Task) => {
    if (!user) return;

    try {
      const updatedTask = await apiService.toggleTaskCompletion(user.id, taskToToggle.id, {
        completed: !taskToToggle.completed
      });
      setTask(updatedTask);
    } catch (err) {
      console.error('Failed to toggle task completion:', err);
      setError('Failed to update task status. Please try again.');
    }
  };

  const handleDelete = async (taskToDelete: Task) => {
    if (!user) return;

    try {
      await apiService.deleteTask(user.id, taskToDelete.id);
      router.push('/dashboard/tasks');
    } catch (err) {
      console.error('Failed to delete task:', err);
      setError('Failed to delete task. Please try again.');
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setEditing(false);
  };

  const handleBack = () => {
    router.push('/dashboard/tasks');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-lg">Loading task...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-md bg-red-50 p-4 mb-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
        <button
          onClick={handleBack}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Back to Tasks
        </button>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-lg">Task not found</p>
          <button
            onClick={handleBack}
            className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {editing ? (
        <TaskEditForm
          task={task}
          onSubmit={handleUpdateTask}
          onCancel={handleCancelEdit}
        />
      ) : (
        <TaskDetail
          task={task}
          onToggleComplete={handleToggleComplete}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onBack={handleBack}
        />
      )}
    </div>
  );
};

export default TaskDetailPage;