// frontend/app/dashboard/tasks/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../lib/auth/context';
import { apiService } from '../../../lib/api';
import { Task } from '../../../lib/types/task';
import {
  FaTerminal,
  FaFilter,
  FaSortAmountDownAlt as FaSortAmountDown,
  FaSearch,
  FaCheck,
  FaClock,
  FaExclamationTriangle as FaTriangleExclamation,
  FaCircle,
  FaPlus,
  FaTrash
} from 'react-icons/fa';
import AddTaskSection from '../../../components/dashboard/add-task-section';

const TasksPage: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTasks = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await apiService.getTasks(user.id);
      setTasks(res.tasks || []);
    } catch (err) {
      console.error('Task Hub Sync Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const toggleTask = async (taskId: string, currentStatus: boolean) => {
    if (!user) return;
    try {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !currentStatus } : t));
      await apiService.toggleTaskCompletion(user.id, taskId, { completed: !currentStatus });
    } catch (err) {
      fetchTasks();
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user || !confirm('Confirm objective destruction?')) return;
    try {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      await apiService.deleteTask(user.id, taskId);
    } catch (err) {
      fetchTasks();
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchFilter = filter === 'all' ? true : filter === 'completed' ? t.completed : !t.completed;
      const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [tasks, filter, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto space-y-10 p-4 lg:p-8 animate-in fade-in duration-1000">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <FaTerminal className="text-[#8b5cf6] text-xs" />
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Operations_Grid</span>
           </div>
           <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Objective Hub</h1>
           <p className="text-white/20 text-xs mt-1 font-bold uppercase tracking-widest">Active System Parameters: {tasks.length} Vectors</p>
        </div>

        <div className="flex items-center gap-3">
           <div className="bg-black/40 border border-white/5 px-4 py-2 rounded-2xl flex items-center gap-4">
              {[
                { id: 'all', label: 'All' },
                { id: 'active', label: 'Active' },
                { id: 'completed', label: 'Done' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setFilter(opt.id as any)}
                  className={`text-[9px] font-black uppercase tracking-widest transition-all ${
                    filter === opt.id ? 'text-[#8b5cf6]' : 'text-white/20 hover:text-white/40'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Quick Capture */}
        <div className="lg:col-span-4 space-y-8">
           <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#8b5cf6]/20 to-[#ec4899]/20 rounded-[2.2rem] blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
              <AddTaskSection />
           </div>

           <div className="p-6 rounded-[2rem] border border-white/5 bg-black/20 backdrop-blur-md">
              <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-6">Data_Filter</h4>
              <div className="relative group">
                 <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 text-xs" />
                 <input
                  type="text"
                  placeholder="SEARCH VECTORS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/5 rounded-xl py-3 pl-10 pr-4 text-[10px] font-black text-white placeholder:text-white/10 focus:border-[#8b5cf6]/40 focus:bg-white/[0.04] transition-all outline-none"
                 />
              </div>
           </div>
        </div>

        {/* Right Column: Tactical Grid */}
        <div className="lg:col-span-8 space-y-4">
           {loading ? (
             <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white/5 animate-pulse rounded-[1.5rem]" />)}
             </div>
           ) : filteredTasks.length > 0 ? (
             <div className="space-y-4">
                {filteredTasks.map(task => (
                  <div
                    key={task.id}
                    className={`group relative flex items-center gap-6 p-6 rounded-[2rem] border transition-all duration-500 overflow-hidden ${
                      task.completed ? 'bg-black/40 border-white/5 opacity-40 grayscale' : 'bg-[#0a0a0f] border-white/5 hover:border-[#8b5cf6]/30 hover:-translate-y-1'
                    }`}
                  >
                    {/* Checkbox */}
                    <div
                      onClick={() => toggleTask(task.id, task.completed)}
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center cursor-pointer transition-all duration-500 ${
                        task.completed ? 'bg-[#8b5cf6] border-[#8b5cf6] shadow-[0_0_15px_#8b5cf6]' : 'border-white/10 group-hover:border-[#8b5cf6]/50'
                      }`}
                    >
                      {task.completed && <FaCheck className="text-white text-xs" />}
                    </div>

                    <div className="flex-1 min-w-0">
                       <h3 className={`text-sm font-black tracking-tight uppercase truncate transition-all duration-500 ${
                         task.completed ? 'text-white/20 line-through' : 'text-white/80 group-hover:text-white'
                       }`}>
                         {task.title}
                       </h3>
                       <div className="flex items-center gap-4 mt-1.5 text-[9px] font-black uppercase tracking-widest text-white/20">
                          <span className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#10b981' }} />
                             {task.priority || 'standard'}
                          </span>
                          <span>|</span>
                          <span>{new Date(task.updated_at).toLocaleDateString()}</span>
                       </div>
                    </div>

                    {/* Quick Shred */}
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 p-3 rounded-xl hover:bg-[#ef4444]/10 hover:text-[#ef4444] text-white/10 transition-all duration-500"
                    >
                      <FaTrash className="text-sm" />
                    </button>

                    {/* Status side mark */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-500 ${
                      task.completed ? 'bg-white/5' : 'bg-[#8b5cf6] opacity-0 group-hover:opacity-100 shadow-[0_0_20px_#8b5cf6]'
                    }`} />
                  </div>
                ))}
             </div>
           ) : (
             <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 text-white/10">
                   <FaTriangleExclamation className="text-2xl" />
                </div>
                <h3 className="text-lg font-black text-white/40 uppercase tracking-tighter">No active objectives in current grid</h3>
                <p className="text-[10px] font-bold text-white/10 uppercase tracking-widest mt-2">Adjust filter parameters or initialize new command</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
