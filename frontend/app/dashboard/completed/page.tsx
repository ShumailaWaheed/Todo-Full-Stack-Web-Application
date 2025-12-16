// frontend/app/dashboard/completed/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth/context';
import { apiService } from '../../../lib/api';
import { Task } from '../../../lib/types';
import { FaCheckCircle, FaFilter, FaSearch, FaCalendarAlt, FaTrash, FaFlag } from 'react-icons/fa';

const CompletedTasksPage: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await apiService.getTasks(user.id, true); // completed = true
      setTasks(response.tasks);
    } catch (err) {
      console.error('Failed to load completed tasks:', err);
      // Show user-friendly error message if it's a network error
      if (err instanceof Error && err.message.includes('Network error')) {
        alert('Unable to connect to the server. Please check your network connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    if (!user) return;

    try {
      const updatedTask = await apiService.toggleTaskCompletion(user.id, task.id, {
        completed: false // Setting to false to move back to pending
      });
      // Remove from completed tasks list
      setTasks(tasks.filter(t => t.id !== task.id));
    } catch (err) {
      console.error('Failed to toggle task completion:', err);
      // Show user-friendly error message if it's a network error
      if (err instanceof Error && err.message.includes('Network error')) {
        alert('Unable to connect to the server. Please check your network connection and try again.');
      }
    }
  };

  const handleUpdateTask = async (taskId: string, taskData: any) => {
    if (!user) return;

    try {
      const updatedTask = await apiService.updateTask(user.id, taskId, taskData);
      setTasks(tasks.map(task => task.id === taskId ? updatedTask : task));
    } catch (err) {
      console.error('Failed to update task:', err);
      // Show user-friendly error message if it's a network error
      if (err instanceof Error && err.message.includes('Network error')) {
        alert('Unable to connect to the server. Please check your network connection and try again.');
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user) return;

    try {
      await apiService.deleteTask(user.id, taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (err) {
      console.error('Failed to delete task:', err);
      // Show user-friendly error message if it's a network error
      if (err instanceof Error && err.message.includes('Network error')) {
        alert('Unable to connect to the server. Please check your network connection and try again.');
      }
    }
  };

  // Filter tasks based on search and priority
  const filteredTasks = tasks.filter(task => {
    const searchMatch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const priorityMatch = priorityFilter === 'all' || task.priority === priorityFilter;

    return searchMatch && priorityMatch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-400">Loading completed tasks...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center">
          <FaCheckCircle className="text-green-400 text-2xl mr-3" />
          <h1 className="text-2xl font-bold text-white">Completed Tasks</h1>
        </div>
        <p className="text-gray-400 mt-2">Your successfully completed tasks</p>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search completed tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          <div className="flex items-center space-x-2">
            <FaFilter className="text-gray-400" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="rounded-xl bg-gray-700/50 border border-gray-600 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Completed Tasks</h2>
          <span className="text-gray-400">{filteredTasks.length} tasks</span>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-700/30 rounded-xl p-8 border border-gray-600/30">
              <FaCheckCircle className="mx-auto text-gray-500 text-4xl mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No completed tasks yet</h3>
              <p className="text-gray-400">Complete some tasks to see them here</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="bg-gray-700/40 hover:bg-gray-700/50 rounded-xl p-4 border border-gray-600/40 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleComplete(task)}
                      className="h-5 w-5 rounded border-gray-600 bg-gray-700 text-purple-500 focus:ring-purple-500 focus:ring-2"
                    />
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-white line-through">{task.title}</h3>
                      {task.description && (
                        <p className="text-gray-400 mt-1 line-through">{task.description}</p>
                      )}
                      <div className="flex items-center mt-2 space-x-4">
                        {task.due_date && (
                          <span className="inline-flex items-center text-sm text-gray-400">
                            <FaCalendarAlt className="mr-1" />
                            {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          task.priority === 'high'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : task.priority === 'medium'
                              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                              : 'bg-green-500/20 text-green-400 border border-green-500/30'
                        }`}>
                          <FaFlag className="mr-1" />
                          {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Medium'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleUpdateTask(task.id, { ...task, completed: false })}
                      className="px-3 py-1 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50 transition-colors duration-200 text-sm"
                    >
                      Move to Pending
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex justify-between text-xs text-gray-500">
                  <span>Created: {new Date(task.created_at).toLocaleDateString()}</span>
                  <span>Completed: {new Date(task.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompletedTasksPage;