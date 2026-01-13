// frontend/components/tasks/task-detail.tsx
'use client';

import React from 'react';
import { Task } from '../../lib/types';

interface TaskDetailProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onBack: () => void;
}

const TaskDetail: React.FC<TaskDetailProps> = ({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  onBack
}) => {
  return (
    <div className="bg-[#0a0a0f] border border-white/5 rounded-[2rem] p-8 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-8 pb-8 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#8b5cf6]/20 border border-[#8b5cf6]/30 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#8b5cf6]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Task Details</h3>
            <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Operational parameters overview</p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-[9px] font-black text-white/60 hover:text-white uppercase tracking-widest transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          <span>Return</span>
        </button>
      </div>

      <div className="space-y-8">
        <div className="flex items-start gap-4">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggleComplete(task)}
            className="mt-1 h-5 w-5 rounded border-white/20 bg-white/[0.03] text-[#8b5cf6] focus:ring-[#8b5cf6]/50 focus:ring-2 cursor-pointer"
          />
          <div className="flex-1">
            <h4 className={`text-lg font-bold ${task.completed ? 'line-through text-white/30' : 'text-white/90 group-hover:text-white'}`}>
              {task.title}
            </h4>
            {task.description && (
              <div className={`mt-3 text-[11px] font-medium ${task.completed ? 'line-through text-white/20' : 'text-white/40'}`}>
                <p>{task.description}</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-4">
          <div className="bg-white/[0.03] p-4 rounded-xl border border-white/5">
            <h5 className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-2">INITIATED</h5>
            <p className="text-[10px] font-bold text-white/60">
              {new Date(task.created_at).toLocaleString()}
            </p>
          </div>
          <div className="bg-white/[0.03] p-4 rounded-xl border border-white/5">
            <h5 className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-2">SYNCHRONIZED</h5>
            <p className="text-[10px] font-bold text-white/60">
              {new Date(task.updated_at).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex space-x-4 pt-4">
          <button
            onClick={() => onEdit(task)}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#8b5cf6]/80 text-white text-[9px] font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            <span>Edit</span>
          </button>
          <button
            onClick={() => onDelete(task)}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30 text-[9px] font-black text-[#ef4444] hover:bg-[#ef4444]/20 uppercase tracking-widest transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;