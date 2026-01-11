// frontend/app/dashboard/tasks/create/page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import TaskForm from '../../../../components/tasks/task-form';
import { apiService } from '../../../../lib/api';
import { useAuth } from '../../../../lib/auth/context';
import { TaskCreate, TaskUpdate } from '../../../../lib/types';
import { FaTerminal, FaArrowLeft } from 'react-icons/fa6';

const CreateTaskPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();

  const handleCreateTask = async (taskData: TaskCreate) => {
    if (!user) return;

    try {
      await apiService.createTask(user.id, taskData);
      router.push('/dashboard');
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleCancel = () => {
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
            <h1 className="text-xl font-black text-white uppercase tracking-tighter">Deploy Objective</h1>
            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Initialize new operation vector</p>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="relative group">
        {/* Holographic Border Effect */}
        <div className="absolute -inset-[1px] rounded-[2rem] bg-gradient-to-r from-[#8b5cf6] via-[#ec4899] to-[#8b5cf6] opacity-0 group-hover:opacity-30 transition-opacity duration-700 blur-lg" />

        <div className="relative bg-[#0a0a0f] border border-white/10 rounded-[2rem] p-8 overflow-hidden">
          {/* Background Glow */}
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-[#8b5cf6]/5 blur-[100px] rounded-full pointer-events-none" />

          <TaskForm
            onSubmit={handleCreateTask as (taskData: TaskCreate | TaskUpdate) => Promise<void>}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateTaskPage;
