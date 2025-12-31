'use client';

import React, { useState, useEffect } from 'react';
import { apiService } from '../../lib/api';
import { Task } from '../../lib/types';

interface TaskListModalProps {
  onClose: () => void;
  userId: string;
  onTaskUpdate?: () => void;
}

export default function TaskListModal({ onClose, userId, onTaskUpdate }: TaskListModalProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    loadTasks();
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getTasks(userId);
      setTasks(response.tasks || []);
    } catch (err) {
      console.error('Error loading tasks:', err);
      if (err instanceof Error) {
        if (err.message.includes('Network') || err.message.includes('fetch')) {
          setError('Unable to connect to the server.');
        } else if (err.message.includes('401') || err.message.includes('Authentication')) {
          setError('Session expired. Please log in again.');
        } else {
          setError('Failed to load your tasks.');
        }
      } else {
        setError('Failed to load your tasks.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (taskId: string, currentCompleted: boolean) => {
    try {
      await apiService.toggleTaskCompletion(userId, taskId, { completed: !currentCompleted });
      await loadTasks();
      onTaskUpdate?.();
    } catch (err) {
      console.error('Error toggling task:', err);
      setError('Failed to update task.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await apiService.deleteTask(userId, taskId);
      await loadTasks();
      onTaskUpdate?.();
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task.');
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const getPriorityStyles = (priority: string | undefined) => {
    switch (priority) {
      case 'high':
        return { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30', dot: 'bg-rose-400' };
      case 'medium':
        return { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', dot: 'bg-amber-400' };
      case 'low':
        return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-400' };
      default:
        return { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30', dot: 'bg-gray-400' };
    }
  };

  const filterTabs = [
    { key: 'all', label: 'All', count: tasks.length },
    { key: 'pending', label: 'Pending', count: tasks.filter(t => !t.completed).length },
    { key: 'completed', label: 'Completed', count: tasks.filter(t => t.completed).length },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-gray-700">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Your Tasks</h2>
                <p className="text-xs text-gray-400">{tasks.length} total tasks</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadTasks}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-all"
                title="Refresh"
              >
                <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={onClose}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mt-4">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as typeof filter)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filter === tab.key
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {tab.label}
                <span className={`px-1.5 py-0.5 rounded-md text-xs ${
                  filter === tab.key ? 'bg-white/20' : 'bg-gray-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-purple-500/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin"></div>
              </div>
              <p className="text-gray-400 mt-4">Loading tasks...</p>
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-red-300 font-medium">{error}</p>
                <button onClick={loadTasks} className="text-sm text-red-400 hover:text-red-300 mt-1">
                  Try again
                </button>
              </div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gray-800 flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-300 mb-1">
                No {filter !== 'all' ? filter : ''} tasks
              </h3>
              <p className="text-gray-500 text-sm">
                {filter === 'all' ? "Start by creating your first task!" : `No ${filter} tasks found.`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => {
                const priority = getPriorityStyles(task.priority);
                return (
                  <div
                    key={task.id}
                    className={`group p-4 rounded-2xl bg-gray-800/50 border border-gray-700 hover:border-purple-500/30 transition-all ${
                      task.completed ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <button
                        onClick={() => handleToggleComplete(task.id, task.completed)}
                        className={`flex-shrink-0 mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                          task.completed
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'border-gray-600 hover:border-purple-500'
                        }`}
                      >
                        {task.completed && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h3 className={`font-semibold transition-all ${
                              task.completed ? 'line-through text-gray-500' : 'text-white'
                            }`}>
                              {task.title}
                            </h3>
                            {task.description && (
                              <p className="text-sm text-gray-400 mt-1 line-clamp-2">{task.description}</p>
                            )}
                          </div>

                          {/* Priority Badge */}
                          {task.priority && (
                            <span className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${priority.bg} ${priority.text} border ${priority.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`}></span>
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </span>
                          )}
                        </div>

                        {/* Meta */}
                        <div className="flex items-center gap-4 mt-3">
                          {task.due_date && (
                            <span className="flex items-center gap-1.5 text-xs text-gray-500">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {new Date(task.due_date).toLocaleDateString()}
                            </span>
                          )}
                          {task.created_at && (
                            <span className="flex items-center gap-1.5 text-xs text-gray-500">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Created {new Date(task.created_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="flex-shrink-0 p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Delete task"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-700 bg-gray-800/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              Showing {filteredTasks.length} of {tasks.length} tasks
            </span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-gray-500">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                {tasks.filter(t => t.completed).length} done
              </span>
              <span className="text-gray-700">|</span>
              <span className="flex items-center gap-1.5 text-gray-500">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                {tasks.filter(t => !t.completed).length} pending
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
