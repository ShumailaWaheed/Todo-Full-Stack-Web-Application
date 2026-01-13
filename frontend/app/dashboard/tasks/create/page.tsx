// frontend/app/dashboard/tasks/create/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import TaskForm from '../../../../components/tasks/task-form';
import { apiService } from '../../../../lib/api';
import { useAuth } from '../../../../lib/auth/context';
import { useToast } from '../../../../components/ui/toast';
import { TaskCreate, TaskUpdate } from '../../../../lib/types';
import { FaTerminal, FaArrowLeft, FaArrowRight } from 'react-icons/fa6';

const CreateTaskPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { addToast } = useToast();

  const handleCreateTask = async (taskData: TaskCreate) => {
    if (!user) return;

    try {
      await apiService.createTask(user.id, taskData);

      // Success message is handled by the TaskForm component
      // Only redirect after successful creation
      router.push('/dashboard');
    } catch (err) {
      console.error('Failed to create task:', err);
      addToast({
        type: 'error',
        title: 'Creation Failed',
        message: 'Could not create the task. Please try again.'
      });
    }
  };

  const handleCancel = () => {
    addToast({
      type: 'info',
      title: 'Action Cancelled',
      message: 'Task creation has been cancelled.'
    });
    router.push('/dashboard');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center">
          <p className="text-lg text-white/40">Please log in to create tasks</p>
        </div>
      </div>
    );
  }

  const [showForm, setShowForm] = useState(false);

  const handleShowForm = () => {
    setShowForm(true);
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push('/dashboard')}
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
        >
          <FaArrowLeft className="text-sm" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#8b5cf6]/20 border border-[#8b5cf6]/30 flex items-center justify-center">
            <FaTerminal className="text-[#8b5cf6] text-sm" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white uppercase tracking-tighter">Create New Task</h1>
            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Add a new task to your list</p>
          </div>
        </div>
      </div>

      {!showForm ? (
        // Show Create Task button initially
        <div className="relative group">
          {/* Holographic Border Effect */}
          <div className="absolute -inset-[1px] rounded-[2rem] bg-gradient-to-r from-[#8b5cf6] via-[#ec4899] to-[#8b5cf6] opacity-0 group-hover:opacity-30 transition-opacity duration-700 blur-lg" />

          <div className="relative bg-[#0a0a0f] border border-white/10 rounded-[2rem] p-8 overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-[#8b5cf6]/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="text-center py-12">
              <div className="mb-6">
                <div className="w-16 h-16 rounded-full bg-[#8b5cf6]/10 flex items-center justify-center mx-auto mb-4">
                  <FaTerminal className="text-[#8b5cf6] text-xl" />
                </div>
                <h2 className="text-lg font-black text-white uppercase tracking-tight mb-2">Create New Task</h2>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest max-w-md mx-auto">
                  Add a new task to your to-do list
                </p>
              </div>

              <button
                onClick={handleShowForm}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_40px_rgba(139,92,246,0.4)] transition-all duration-300 transform hover:scale-105"
              >
                Create Task <FaArrowRight className="inline-block ml-2 text-xs" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Show the form when button is clicked
        <div className="relative group">
          {/* Holographic Border Effect */}
          <div className="absolute -inset-[1px] rounded-[2rem] bg-gradient-to-r from-[#8b5cf6] via-[#ec4899] to-[#8b5cf6] opacity-0 group-hover:opacity-30 transition-opacity duration-700 blur-lg" />

          <div className="relative bg-[#0a0a0f] border border-white/10 rounded-[2rem] p-8 overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-[#8b5cf6]/5 blur-[100px] rounded-full pointer-events-none" />

            <TaskForm
              onSubmit={handleCreateTask as (taskData: TaskCreate | TaskUpdate) => Promise<void>}
              onCancel={() => setShowForm(false)} // Allow canceling back to button view
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTaskPage;
