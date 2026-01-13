// frontend/components/dashboard/recent-tasks.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaChevronRight,
  FaCheck,
  FaClock,
  FaLayerGroup,
} from 'react-icons/fa6';
import { apiService } from '../../lib/api';
import { useAuth } from '../../lib/auth/context';
import { Task } from '../../lib/types/task';

const RecentTasks: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      if (!user) return;
      try {
        const response = await apiService.getTasks(user.id);
        const sorted = (response.tasks || [])
          .sort((a: Task, b: Task) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime())
          .slice(0, 4);
        setTasks(sorted);
      } catch (error) {
        console.error('Recent Fetch Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, [user]);

  if (loading) return <div className="h-40 animate-pulse bg-white/5 rounded-3xl" />;

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#3b82f6]/10 flex items-center justify-center text-[#3b82f6]">
            <FaLayerGroup className="text-xs" />
          </div>
          <h3 className="text-sm font-black text-white/80 uppercase tracking-widest">Recent Activity</h3>
        </div>
        <button onClick={() => router.push('/dashboard/tasks')} className="text-[10px] font-bold text-[#8b5cf6] hover:text-white transition-colors uppercase tracking-widest flex items-center gap-1">
          Root <FaChevronRight className="text-[8px]" />
        </button>
      </div>

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="group relative flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all cursor-pointer"
            onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
          >
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
               {task.completed ? <FaCheck className="text-[10px] text-[#10b981]" /> : <FaClock className="text-[10px] text-white/20 animate-pulse" />}
            </div>
            <div className="flex-1 min-w-0">
               <h4 className="text-xs font-bold text-white/70 group-hover:text-white transition-colors truncate uppercase tracking-tight">{task.title}</h4>
               <p className="text-[9px] font-medium text-white/20 uppercase mt-0.5 tracking-wider">{new Date(task.updated_at || '').toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} · SYNCHRONIZED</p>
            </div>
            <FaChevronRight className="text-[10px] text-white/5 group-hover:text-[#8b5cf6] transition-colors" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentTasks;
