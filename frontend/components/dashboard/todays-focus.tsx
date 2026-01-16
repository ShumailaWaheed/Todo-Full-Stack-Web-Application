// frontend/components/dashboard/todays-focus.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  FaPlus,
  FaCheck,
  FaStar,
  FaCalendarAlt,
  FaBolt,
  FaArrowUp,
} from 'react-icons/fa';
import { apiService } from '../../lib/api';
import { useAuth } from '../../lib/auth/context';
import { Task } from '../../lib/types/task';

interface TodaysFocusProps {
  className?: string;
}

const TodaysFocus: React.FC<TodaysFocusProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTodayTasks = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await apiService.getTasks(user.id);
      // Filter for today if date logic exists, otherwise show active tasks
      const allTasks = response.tasks || [];
      const active = allTasks.filter((t: Task) => !t.completed).slice(0, 5);
      const completed = allTasks.filter((t: Task) => t.completed).slice(0, 2);
      setTasks([...active, ...completed]);
    } catch (error) {
      console.error('Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayTasks();
  }, [user]);

  const handleToggle = async (taskId: string, currentStatus: boolean) => {
    if (!user) return;
    try {
      // Optimistic update
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !currentStatus } : t));
      await apiService.toggleTaskCompletion(user.id, taskId, { completed: !currentStatus });
    } catch (error) {
      console.error('Toggle Error:', error);
      fetchTodayTasks(); // Revert on failure
    }
  };

  if (loading) return <div className="h-60 animate-pulse bg-white/5 rounded-[2rem]" />;

  return (
    <div className={`relative ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-[#8b5cf6]/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <FaBolt className="w-4 h-4 text-[#8b5cf6] relative z-10" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white tracking-tighter uppercase">Focus Stack</h3>
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Operational Objectives</p>
          </div>
        </div>
        <div className="text-[10px] font-black text-[#8b5cf6] bg-[#8b5cf6]/10 px-3 py-1 rounded-full border border-[#8b5cf6]/20 uppercase tracking-widest animate-pulse">
          {tasks.filter(t => !t.completed).length} Pending
        </div>
      </div>

      {/* Real Task Interaction Stack */}
      <div className="space-y-2.5">
        {tasks.length > 0 ? tasks.map((task) => {
          const priorityColor = task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#10b981';

          return (
            <div
              key={task.id}
              onClick={() => handleToggle(task.id, task.completed)}
              className={`group relative flex items-center gap-5 p-5 rounded-[1.5rem] border transition-all duration-500 cursor-pointer overflow-hidden
                ${task.completed
                  ? 'bg-black/40 border-white/5 opacity-40 grayscale-[0.5]'
                  : 'bg-white/[0.02] border-white/10 hover:border-[#8b5cf6]/40 hover:bg-white/[0.04] hover:-translate-y-1'
                }`}
            >
              {/* Checkbox */}
              <div className={`relative w-6 h-6 rounded-lg border-2 transition-all duration-500 flex items-center justify-center flex-shrink-0
                ${task.completed ? 'bg-[#8b5cf6] border-[#8b5cf6] shadow-[0_0_15px_#8b5cf6]' : 'border-white/10 group-hover:border-[#8b5cf6]/50'}`}>
                {task.completed && <FaCheck className="text-[10px] text-white" />}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-0.5">
                   <h4 className={`text-sm font-bold tracking-tight transition-all duration-500 truncate ${task.completed ? 'text-white/20 line-through' : 'text-white/90 group-hover:text-white'}`}>
                    {task.title}
                  </h4>
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: priorityColor, boxShadow: `0 0 8px ${priorityColor}` }}></div>
                </div>
                <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-white/20">
                  <span className="flex items-center gap-1.5">ID: {String(task.id).slice(0, 4)}</span>
                  <span>/</span>
                  <span className={`${task.completed ? '' : 'group-hover:text-[#8b5cf6]'} transition-colors font-mono`}>SYNC_READY</span>
                </div>
              </div>

              {/* Status Indicator */}
              {!task.completed && (
                <div className="opacity-0 group-hover:opacity-100 transition-all text-[8px] font-black text-[#8b5cf6] flex items-center gap-1">
                   EXECUTE <FaArrowUp className="animate-bounce" style={{ animationDuration: '2s' }} />
                </div>
              )}

              {/* Side Strip */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-500 ${task.completed ? 'bg-white/5 shadow-none' : 'bg-[#8b5cf6] opacity-0 group-hover:opacity-100 shadow-[0_0_15px_#8b5cf6]'}`}></div>
            </div>
          );
        }) : (
          <div className="py-12 text-center rounded-[2rem] border border-white/5 border-dashed">
             <p className="text-xs text-white/20 uppercase font-black tracking-widest">No objectives assigned for this phase</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodaysFocus;
