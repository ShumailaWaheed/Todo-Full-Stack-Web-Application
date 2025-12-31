// frontend/components/projects/project-form.tsx
'use client';

import React, { useState } from 'react';
import { ProjectCreate, ProjectUpdate } from '../../lib/types';
import { FaTimes, FaSave } from 'react-icons/fa';

interface ProjectFormProps {
  initialData?: ProjectUpdate;
  isEditing?: boolean;
  onSubmit: (projectData: ProjectCreate | ProjectUpdate) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  initialData,
  isEditing = false,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [dueDate, setDueDate] = useState(initialData?.due_date || '');
  const [priority, setPriority] = useState(initialData?.priority || 'medium');
  const [error, setError] = useState<string | null>(null);

  const validateForm = () => {
    if (!name.trim()) {
      setError('Project name is required');
      return false;
    }

    if (name.length > 100) {
      setError('Project name must be 100 characters or less');
      return false;
    }

    if (!slug.trim()) {
      setError('Project slug is required');
      return false;
    }

    if (slug.length > 100) {
      setError('Project slug must be 100 characters or less');
      return false;
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      setError('Slug can only contain lowercase letters, numbers, and hyphens');
      return false;
    }

    if (description && description.length > 1000) {
      setError('Description must be 1000 characters or less');
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const projectData: ProjectCreate | ProjectUpdate = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || undefined,
      due_date: dueDate,
      priority
    };

    try {
      await onSubmit(projectData);
    } catch (err) {
      console.error('Failed to submit project:', err);
      setError('Failed to save project. Please try again.');
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg border border-gray-600 p-6">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={onCancel}
          className="flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
        >
          ← Back to Projects
        </button>
        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 shadow-lg shadow-purple-500/20">
          {isEditing ? 'Edit Project' : 'Create New Project'}
        </h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-200"
            aria-label="Close form"
          >
            <FaTimes />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 text-red-300 rounded-lg border border-red-500/30">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
            Project Name *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              // Auto-generate slug from name
              if (!isEditing || !initialData?.slug) { // Only auto-generate if not editing or slug wasn't provided
                const autoSlug = e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
                  .replace(/\s+/g, '-') // Replace spaces with hyphens
                  .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
                  .trim();
                setSlug(autoSlug);
              }
            }}
            className="w-full px-4 py-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter project name"
            maxLength={100}
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="slug" className="block text-sm font-medium text-gray-300 mb-1">
            Slug *
          </label>
          <input
            type="text"
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            className="w-full px-4 py-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter project slug (e.g., my-project-name)"
            maxLength={100}
            required
          />
          <p className="text-xs text-gray-500 mt-1">Lowercase letters, numbers, and hyphens only</p>
        </div>

        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter project description"
            maxLength={1000}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-300 mb-1">
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-300 mb-1">
              Priority
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-all duration-200"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30"
          >
            <FaSave className="mr-2" />
            {loading
              ? (isEditing ? 'Updating...' : 'Creating...')
              : (isEditing ? 'Update Project' : 'Create Project')
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;