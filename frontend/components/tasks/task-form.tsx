// frontend/components/tasks/task-form.tsx
'use client';

import React, { useState } from 'react';
import { TaskCreate, TaskUpdate } from '../../lib/types';

interface TaskFormProps {
  initialData?: TaskUpdate;
  isEditing?: boolean;
  onSubmit: (taskData: TaskCreate | TaskUpdate) => void;
  onCancel?: () => void;
  loading?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({
  initialData,
  isEditing = false,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [error, setError] = useState<string | null>(null);

  const validateForm = () => {
    if (!title.trim()) {
      setError('Title is required');
      return false;
    }

    if (title.length > 200) {
      setError('Title must be 200 characters or less');
      return false;
    }

    if (description && description.length > 2000) {
      setError('Description must be 2000 characters or less');
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const taskData: TaskCreate | TaskUpdate = {
      title: title.trim(),
      description: description.trim() || undefined,
    };

    if (isEditing) {
      // For updates, only include fields that have changed
      const updateData: TaskUpdate = {};
      if (title !== (initialData?.title || '')) updateData.title = title.trim();
      if (description !== (initialData?.description || '')) updateData.description = description.trim() || undefined;

      onSubmit(updateData);
    } else {
      onSubmit(taskData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title *
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Task title"
          maxLength={200}
          required
          aria-describedby="title-help-text"
        />
        <p id="title-help-text" className="mt-1 text-xs text-gray-500">Maximum 200 characters</p>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Task description (optional)"
          maxLength={2000}
          aria-describedby="description-help-text"
        />
        <p id="description-help-text" className="mt-1 text-xs text-gray-500">Maximum 2000 characters</p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4" role="alert" aria-live="assertive">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          aria-busy={loading}
        >
          {loading
            ? (isEditing ? 'Updating...' : 'Creating...')
            : (isEditing ? 'Update Task' : 'Create Task')
          }
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default TaskForm;