// frontend/app/dashboard/tasks/[id]/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../lib/auth/context';
import { apiService } from '../../../../lib/api';
import { Task } from '../../../../lib/types';
import { useToast } from '../../../../components/ui/toast';
import TaskDetail from '../../../../components/tasks/task-detail';
import TaskEditForm from '../../../../components/tasks/task-edit-form';
import ConfirmationDialog from '../../../../components/common/confirmation-dialog';

const TaskDetailPageContent: React.FC = () => {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && id) {
      loadTask();
    } else if (!id) {
      setError('Task ID not provided.');
      setLoading(false);
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
      addToast({
        type: 'error',
        title: 'Load Failed',
        message: 'Could not retrieve task details. Please try again.'
      });
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

      addToast({
        type: 'success',
        title: 'Task Updated',
        message: 'The task has been successfully updated.'
      });
    } catch (err) {
      console.error('Failed to update task:', err);
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Could not update the task. Please try again.'
      });
    }
  };

  const handleToggleComplete = async (taskToToggle: Task) => {
    if (!user) return;

    try {
      const updatedTask = await apiService.toggleTaskCompletion(user.id, taskToToggle.id, {
        completed: !taskToToggle.completed
      });
      setTask(updatedTask);

      addToast({
        type: 'success',
        title: taskToToggle.completed ? 'Task Reactivated' : 'Task Completed',
        message: taskToToggle.completed
          ? 'The task has been marked as active again.'
          : 'The task has been marked as completed successfully.'
      });
    } catch (err) {
      console.error('Failed to toggle task completion:', err);
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Could not update task status. Please try again.'
      });
    }
  };

  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const initiateDelete = (taskToDelete: Task) => {
    if (!user) return;
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!user || !task) return;

    setIsDeleting(true);
    setShowDeleteConfirm(false);

    try {
      await apiService.deleteTask(user.id, task.id);

      addToast({
        type: 'success',
        title: 'Task Deleted',
        message: 'The task has been successfully deleted.'
      });

      router.push('/dashboard/tasks');
    } catch (err) {
      console.error('Failed to delete task:', err);
      addToast({
        type: 'error',
        title: 'Deletion Failed',
        message: 'Could not delete the task. Please try again.'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-lg text-gray-400 mt-4">Loading task...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="p-4 mb-4 bg-red-500/20 rounded-xl border border-red-500/30">
          <div className="text-sm text-red-300">{error}</div>
        </div>
        <button
          onClick={handleBack}
          className="inline-flex items-center px-4 py-2.5 bg-gray-800 rounded-lg text-white font-medium hover:bg-gray-700 transition-all duration-300 border border-gray-600"
        >
          Back to Tasks
        </button>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center p-8 bg-gray-800/50 rounded-xl border border-gray-700">
          <p className="text-lg text-gray-400">Task not found</p>
          <button
            onClick={handleBack}
            className="mt-4 inline-flex items-center px-4 py-2.5 bg-gray-800 rounded-lg text-white font-medium hover:bg-gray-700 transition-all duration-300 border border-gray-600"
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
          onDelete={initiateDelete}
          onBack={handleBack}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Confirm Deletion"
        message="Are you sure you want to permanently delete this task? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmText="Delete Task"
        cancelText="Cancel"
      />
    </div>
  );
};

const TaskDetailPage: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TaskDetailPageContent />
    </Suspense>
  );
};

export default TaskDetailPage;