// frontend/app/dashboard/completed/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../lib/auth/context';
import { apiService } from '../../../lib/api';
import { Task } from '../../../lib/types';
import { useToast } from '../../../components/ui/toast';
import {
  FaCheck,
  FaClock,
  FaTrash,
  FaSearch,
  FaFilter,
  FaSortAmountDown,
  FaFlag,
  FaCalendarAlt,
  FaChevronDown,
  FaUndo,
  FaFire,
  FaTrophy
} from 'react-icons/fa';
import { FaArrowDownWideShort, FaArrowUpWideShort } from 'react-icons/fa6';
import ConfirmationDialog from '../../../components/common/confirmation-dialog';

const CompletedTasksPage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority'>('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  // Listen for chatbot task events to refresh completed tasks
  useEffect(() => {
    const refresh = () => loadTasks();
    window.addEventListener('taskCreated', refresh);
    window.addEventListener('taskUpdated', refresh);
    window.addEventListener('taskToggled', refresh);
    window.addEventListener('taskDeleted', refresh);
    return () => {
      window.removeEventListener('taskCreated', refresh);
      window.removeEventListener('taskUpdated', refresh);
      window.removeEventListener('taskToggled', refresh);
      window.removeEventListener('taskDeleted', refresh);
    };
  }, [user]);

  const loadTasks = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await apiService.getTasks(user.id, true);
      setTasks(response.tasks);
    } catch (err) {
      console.error('Failed to load completed tasks:', err);
      addToast({
        type: 'error',
        title: 'Load Failed',
        message: 'Could not retrieve completed tasks. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    if (!user) return;

    try {
      await apiService.toggleTaskCompletion(user.id, task.id, {
        completed: false
      });
      setTasks(prevTasks => prevTasks.filter(t => t.id !== task.id));

      addToast({
        type: 'success',
        title: 'Task Reactivated',
        message: 'The task has been moved back to your active tasks list.'
      });
    } catch (err) {
      console.error('Failed to toggle task completion:', err);
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Could not reactivate the task. Please try again.'
      });
    }
  };

  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const initiateDeleteTask = (taskId: string) => {
    if (!user) return;
    setTaskToDelete(taskId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteTask = async () => {
    if (!user || !taskToDelete) return;

    setDeletingTaskId(taskToDelete);
    setShowDeleteConfirm(false);

    try {
      await apiService.deleteTask(user.id, taskToDelete);
      setTasks(tasks.filter(task => task.id !== taskToDelete));

      addToast({
        type: 'success',
        title: 'Task Deleted',
        message: 'The task has been successfully deleted.'
      });
    } catch (err) {
      console.error('Failed to delete task:', err);
      addToast({
        type: 'error',
        title: 'Deletion Failed',
        message: 'Could not delete the task. Please try again.'
      });
    } finally {
      setDeletingTaskId(null);
      setTaskToDelete(null);
    }
  };

  const cancelDeleteTask = () => {
    setShowDeleteConfirm(false);
    setTaskToDelete(null);
  };

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let result = tasks.filter(task => {
      const searchMatch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const priorityMatch = priorityFilter === 'all' || task.priority === priorityFilter;
      return searchMatch && priorityMatch;
    });

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      } else {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) -
               (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
      }
    });

    return result;
  }, [tasks, searchQuery, priorityFilter, sortBy]);

  // Stats
  const highCount = tasks.filter(t => t.priority === 'high').length;
  const mediumCount = tasks.filter(t => t.priority === 'medium').length;
  const lowCount = tasks.filter(t => t.priority === 'low').length;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 p-2 sm:p-4 lg:p-8 animate-in fade-in duration-1000">
        {/* Header skeleton */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-white/5 animate-pulse"></div>
          <div>
            <div className="h-6 w-48 bg-white/5 rounded-lg animate-pulse mb-2"></div>
            <div className="h-3 w-64 bg-white/[0.03] rounded animate-pulse"></div>
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-white/[0.03] border border-white/5 rounded-2xl animate-pulse"></div>
          ))}
        </div>

        {/* Tasks skeleton */}
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-white/[0.03] border border-white/5 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 p-2 sm:p-4 lg:p-8 animate-in fade-in duration-1000">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FaCheck className="text-[#10b981] text-xs" />
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">COMPLETED_TASKS</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tighter uppercase">Completed Tasks</h1>
          <p className="text-white/20 text-xs mt-1 font-bold uppercase tracking-widest">
            {tasks.length} tasks accomplished
          </p>
        </div>

        {/* Sort Toggle */}
        <div className="flex items-center gap-3">
          <div className="bg-black/40 border border-white/5 px-4 py-2 rounded-2xl flex items-center gap-4">
            {[
              { id: 'newest', label: 'Latest', icon: FaArrowDownWideShort },
              { id: 'oldest', label: 'Oldest', icon: FaArrowUpWideShort },
              { id: 'priority', label: 'Priority', icon: FaFlag }
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setSortBy(opt.id as any)}
                className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest transition-all ${
                  sortBy === opt.id ? 'text-[#8b5cf6]' : 'text-white/20 hover:text-white/40'
                }`}
              >
                <opt.icon className="text-[8px]" />
                <span className="hidden sm:inline">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="group relative border border-white/5 bg-black/20 p-3 sm:p-5 rounded-xl sm:rounded-2xl transition-all duration-500 hover:bg-[#10b981]/5 hover:border-[#10b981]/20 overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#10b981]/10 flex items-center justify-center">
              <FaTrophy className="text-[#10b981] text-sm" />
            </div>
            <div className="text-right">
              <h4 className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Total</h4>
              <p className="text-xl sm:text-3xl font-black text-white mt-1">{tasks.length}</p>
            </div>
          </div>
        </div>

        <div className="group relative border border-white/5 bg-black/20 p-3 sm:p-5 rounded-xl sm:rounded-2xl transition-all duration-500 hover:bg-[#ef4444]/5 hover:border-[#ef4444]/20 overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#ef4444]/10 flex items-center justify-center">
              <FaFire className="text-[#ef4444] text-sm" />
            </div>
            <div className="text-right">
              <h4 className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">High</h4>
              <p className="text-xl sm:text-3xl font-black text-white mt-1">{highCount}</p>
            </div>
          </div>
        </div>

        <div className="group relative border border-white/5 bg-black/20 p-3 sm:p-5 rounded-xl sm:rounded-2xl transition-all duration-500 hover:bg-[#f59e0b]/5 hover:border-[#f59e0b]/20 overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#f59e0b]/10 flex items-center justify-center">
              <FaFlag className="text-[#f59e0b] text-sm" />
            </div>
            <div className="text-right">
              <h4 className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Medium</h4>
              <p className="text-xl sm:text-3xl font-black text-white mt-1">{mediumCount}</p>
            </div>
          </div>
        </div>

        <div className="group relative border border-white/5 bg-black/20 p-3 sm:p-5 rounded-xl sm:rounded-2xl transition-all duration-500 hover:bg-[#10b981]/5 hover:border-[#10b981]/20 overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#10b981]/10 flex items-center justify-center">
              <FaCheck className="text-[#10b981] text-sm" />
            </div>
            <div className="text-right">
              <h4 className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Low</h4>
              <p className="text-xl sm:text-3xl font-black text-white mt-1">{lowCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-white/5 bg-black/20 backdrop-blur-md space-y-4">
        {/* Search + Filter Toggle Row */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          {/* Search */}
          <div className="relative flex-1 group">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 text-xs transition-colors group-focus-within:text-[#8b5cf6]" />
            <input
              type="text"
              placeholder="SEARCH COMPLETED TASKS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-3 pl-10 pr-4 text-[10px] font-black text-white placeholder:text-white/10 focus:border-[#8b5cf6]/40 focus:bg-white/[0.06] transition-all outline-none uppercase tracking-widest"
            />
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${
              showFilters || priorityFilter !== 'all'
                ? 'bg-[#8b5cf6]/10 border-[#8b5cf6]/30 text-[#8b5cf6]'
                : 'bg-white/[0.03] border-white/5 text-white/30 hover:text-white/50 hover:border-white/10'
            }`}
          >
            <FaFilter className="text-[8px]" />
            Filters
            {priorityFilter !== 'all' && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6] animate-pulse"></span>
            )}
            <FaChevronDown className={`text-[8px] transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Priority Filter Pills */}
        {showFilters && (
          <div className="pt-3 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-300">
            <h4 className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] mb-3">Priority Level</h4>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'All Tasks', count: tasks.length, color: '#8b5cf6' },
                { id: 'high', label: 'High Priority', count: highCount, color: '#ef4444' },
                { id: 'medium', label: 'Medium Priority', count: mediumCount, color: '#f59e0b' },
                { id: 'low', label: 'Low Priority', count: lowCount, color: '#10b981' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setPriorityFilter(opt.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${
                    priorityFilter === opt.id
                      ? 'border-current shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                      : 'bg-white/[0.02] border-white/5 text-white/20 hover:text-white/40 hover:border-white/10'
                  }`}
                  style={priorityFilter === opt.id ? {
                    backgroundColor: `${opt.color}10`,
                    borderColor: `${opt.color}40`,
                    color: opt.color
                  } : {}}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: opt.color }}
                  ></div>
                  {opt.label}
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-md ${
                    priorityFilter === opt.id ? 'bg-white/10' : 'bg-white/5'
                  }`}>
                    {opt.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">
          Showing {filteredTasks.length} of {tasks.length} completed tasks
        </span>
        {(searchQuery || priorityFilter !== 'all') && (
          <button
            onClick={() => { setSearchQuery(''); setPriorityFilter('all'); }}
            className="text-[9px] font-black text-[#8b5cf6]/60 hover:text-[#8b5cf6] uppercase tracking-widest transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2rem] sm:rounded-[3rem]">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 text-white/10">
            <FaCheck className="text-2xl" />
          </div>
          <h3 className="text-lg font-black text-white/40 uppercase tracking-tighter">
            {tasks.length === 0 ? 'No completed tasks yet' : 'No matching tasks found'}
          </h3>
          <p className="text-[10px] font-bold text-white/10 uppercase tracking-widest mt-2">
            {tasks.length === 0
              ? 'Complete tasks from your active list to see them here'
              : 'Try adjusting your search or filters'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl sm:rounded-[2rem] border border-white/5">
          {/* Table Header - Desktop */}
          <div className="bg-[#0a0a0f] border-b border-white/5 px-6 py-4 hidden md:grid grid-cols-12 gap-4 text-[9px] font-black text-white/30 uppercase tracking-widest">
            <div className="col-span-1">Status</div>
            <div className="col-span-4">Task</div>
            <div className="col-span-2">Priority</div>
            <div className="col-span-2">Completed</div>
            <div className="col-span-3 text-right">Actions</div>
          </div>

          {/* Task Rows */}
          <div className="divide-y divide-white/5">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="group relative grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 p-4 sm:p-6 bg-[#0a0a0f] hover:bg-[#11111b] transition-all duration-500 overflow-hidden"
              >
                {/* Status Checkbox */}
                <div className="hidden md:flex md:col-span-1 items-center justify-center">
                  <div
                    onClick={() => handleToggleComplete(task)}
                    className="w-8 h-8 rounded-xl bg-[#10b981] border border-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center cursor-pointer hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all duration-300"
                  >
                    <FaCheck className="text-white text-xs" />
                  </div>
                </div>

                {/* Task Content */}
                <div className="col-span-12 md:col-span-4 flex items-center gap-3">
                  {/* Mobile checkbox */}
                  <div className="md:hidden">
                    <div
                      onClick={() => handleToggleComplete(task)}
                      className="w-7 h-7 rounded-lg bg-[#10b981] border border-[#10b981] shadow-[0_0_10px_rgba(16,185,129,0.3)] flex items-center justify-center cursor-pointer"
                    >
                      <FaCheck className="text-white text-[10px]" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-black tracking-tight uppercase truncate text-white/50 line-through group-hover:text-white/70 transition-all duration-300">
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-[10px] text-white/30 mt-1 line-clamp-1 line-through">{task.description}</p>
                    )}
                  </div>
                </div>

                {/* Priority */}
                <div className="col-span-6 md:col-span-2 flex items-center">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                    task.priority === 'high'
                      ? 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20'
                      : task.priority === 'medium'
                        ? 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20'
                        : 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20'
                  }`}>
                    <FaFlag className="text-[7px]" />
                    {task.priority || 'medium'}
                  </span>
                </div>

                {/* Completed Date */}
                <div className="col-span-6 md:col-span-2 flex items-center">
                  <span className="text-[10px] font-bold text-white/30 flex items-center gap-1.5">
                    <FaCalendarAlt className="text-[8px] text-white/20" />
                    {new Date(task.updated_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-12 md:col-span-3 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleToggleComplete(task)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-[9px] font-black text-white/30 hover:text-[#8b5cf6] hover:border-[#8b5cf6]/30 hover:bg-[#8b5cf6]/5 uppercase tracking-widest transition-all duration-300 sm:opacity-0 group-hover:opacity-100"
                  >
                    <FaUndo className="text-[8px]" />
                    <span className="hidden sm:inline">Restore</span>
                  </button>
                  <button
                    onClick={() => initiateDeleteTask(task.id)}
                    disabled={deletingTaskId === task.id}
                    className={`p-2.5 rounded-xl border transition-all duration-300 sm:opacity-0 group-hover:opacity-100 ${
                      deletingTaskId === task.id
                        ? 'opacity-50 cursor-not-allowed border-white/5'
                        : 'border-white/5 text-white/20 hover:text-[#ef4444] hover:border-[#ef4444]/30 hover:bg-[#ef4444]/5'
                    }`}
                  >
                    {deletingTaskId === task.id ? (
                      <div className="w-3.5 h-3.5 border-t-2 border-[#ef4444] rounded-full animate-spin"></div>
                    ) : (
                      <FaTrash className="text-[10px]" />
                    )}
                  </button>
                </div>

                {/* Left accent bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#10b981]/20 opacity-0 group-hover:opacity-100 transition-all duration-500" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Confirm Deletion"
        message="Are you sure you want to permanently delete this task? This action cannot be undone."
        onConfirm={confirmDeleteTask}
        onCancel={cancelDeleteTask}
        confirmText="Delete Task"
        cancelText="Cancel"
      />
    </div>
  );
};

export default CompletedTasksPage;
