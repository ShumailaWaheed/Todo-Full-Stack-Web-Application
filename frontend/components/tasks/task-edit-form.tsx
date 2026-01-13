// frontend/components/tasks/task-edit-form.tsx
// This is actually the same as the task form, so we can use the existing TaskForm component
// But let me create a specific edit form that includes additional functionality

'use client';

import React, { useState } from 'react';
import { Task, TaskUpdate } from '../../lib/types';

interface TaskEditFormProps {
  task: Task;
  onSubmit: (taskId: string, taskData: TaskUpdate) => void;
  onCancel: () => void;
  loading?: boolean;
}

const TaskEditForm: React.FC<TaskEditFormProps> = ({
  task,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
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

    const taskData: TaskUpdate = {
      title: title.trim(),
      description: description.trim() || undefined,
    };

    onSubmit(task.id, taskData);
  };

  return (
    <div className="bg-[#0a0a0f] border border-white/5 rounded-[2rem] p-8 backdrop-blur-sm">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#8b5cf6]/20 border border-[#8b5cf6]/30 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#8b5cf6]" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Neural Task Editor</h3>
            <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Modify operational parameters</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="text-[9px] font-black text-white/50 uppercase tracking-widest flex items-center gap-2 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-[#8b5cf6]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Neural Command
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-[11px] font-bold text-white placeholder:text-white/20 focus:border-[#8b5cf6]/50 focus:bg-white/[0.06] transition-all outline-none"
            placeholder="DEFINE OPERATIONAL OBJECTIVE"
            maxLength={200}
          />
          <p className="mt-2 text-[8px] font-bold text-white/20 uppercase tracking-wider">MAXIMUM 200 CHARACTERS</p>
        </div>

        <div>
          <label htmlFor="description" className="text-[9px] font-black text-white/50 uppercase tracking-widest flex items-center gap-2 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-[#8b5cf6]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Operational Brief
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-[11px] font-medium text-white placeholder:text-white/20 focus:border-[#8b5cf6]/50 focus:bg-white/[0.06] transition-all outline-none resize-none"
            placeholder="DEFINE OPERATIONAL PARAMETERS AND EXECUTION STRATEGY..."
            maxLength={2000}
          />
          <p className="mt-2 text-[8px] font-bold text-white/20 uppercase tracking-wider">MAXIMUM 2000 CHARACTERS</p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30">
            <div className="text-[10px] font-bold text-[#ef4444] uppercase tracking-widest">{error}</div>
          </div>
        )}

        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#8b5cf6]/80 text-white text-[9px] font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-3 h-3 border-t-2 border-white border-r-2 rounded-full animate-spin"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Commit Changes</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-[9px] font-black text-white/60 hover:text-white uppercase tracking-widest transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span>Cancel</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskEditForm;