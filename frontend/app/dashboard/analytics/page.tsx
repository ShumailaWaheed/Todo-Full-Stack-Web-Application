// frontend/app/dashboard/analytics/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth/context';
import { apiService } from '../../../lib/api';
import { Task } from '../../../lib/types';
import { FaChartBar, FaCalendarAlt, FaClock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await apiService.getTasks(user.id);
      setTasks(response.tasks);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      // Show user-friendly error message if it's a network error
      if (err instanceof Error && err.message.includes('Network error')) {
        alert('Unable to connect to the server. Please check your network connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate analytics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const overdueTasks = tasks.filter(task => !task.completed && task.due_date && new Date(task.due_date) < new Date()).length;
  const completedPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate weekly completion rate
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Sunday of current week
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6); // Saturday of current week

  const tasksThisWeek = tasks.filter(task => {
    const taskDate = new Date(task.created_at);
    return taskDate >= weekStart && taskDate <= weekEnd;
  });

  const completedThisWeek = tasksThisWeek.filter(task => task.completed).length;
  const weeklyCompletionRate = tasksThisWeek.length > 0 ? Math.round((completedThisWeek / tasksThisWeek.length) * 100) : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-400">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center">
          <FaChartBar className="text-purple-400 text-2xl mr-3" />
          <h1 className="text-2xl font-bold text-white">Analytics & Insights</h1>
        </div>
        <p className="text-gray-400 mt-2">Track your productivity and task completion trends</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500/20 to-pink-500/20 mr-4">
              <FaChartBar className="text-orange-400 text-xl" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Tasks</p>
              <p className="text-2xl font-bold text-white">{totalTasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-gradient-to-r from-green-500/20 to-teal-500/20 mr-4">
              <FaCheckCircle className="text-green-400 text-xl" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Completed</p>
              <p className="text-2xl font-bold text-white">{completedTasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500/20 to-yellow-500/20 mr-4">
              <FaClock className="text-orange-400 text-xl" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-2xl font-bold text-white">{pendingTasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-gradient-to-r from-red-500/20 to-pink-500/20 mr-4">
              <FaExclamationTriangle className="text-red-400 text-xl" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Overdue</p>
              <p className="text-2xl font-bold text-white">{overdueTasks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6">Overall Completion Rate</h2>
          <div className="flex justify-center">
            <div className="relative w-48 h-48">
              <div className="absolute w-full h-full rounded-full border-8 border-gray-700/50"></div>
              <div
                className="absolute w-full h-full rounded-full border-8 border-transparent border-l-green-500 border-t-green-500"
                style={{
                  transform: `rotate(${(completedPercentage / 100) * 360}deg)`,
                  clipPath: `conic-gradient(transparent 0% ${completedPercentage}%/, #22c55e ${completedPercentage}% 100%)`
                }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-3xl font-bold text-white">{completedPercentage}%</span>
                  <p className="text-gray-400">Completed</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6">Weekly Completion Rate</h2>
          <div className="flex justify-center">
            <div className="relative w-48 h-48">
              <div className="absolute w-full h-full rounded-full border-8 border-gray-700/50"></div>
              <div
                className="absolute w-full h-full rounded-full border-8 border-transparent border-l-purple-500 border-t-purple-500"
                style={{
                  transform: `rotate(${(weeklyCompletionRate / 100) * 360}deg)`,
                  clipPath: `conic-gradient(transparent 0% ${weeklyCompletionRate}%/, #a855f7 ${weeklyCompletionRate}% 100%)`
                }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-3xl font-bold text-white">{weeklyCompletionRate}%</span>
                  <p className="text-gray-400">This Week</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-6">Task Distribution by Priority</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-700/30 p-4 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-red-400 font-medium">High Priority</span>
              <span className="text-white font-bold">{tasks.filter(t => t.priority === 'high').length}</span>
            </div>
            <div className="w-full bg-gray-600/50 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full"
                style={{ width: `${tasks.length ? (tasks.filter(t => t.priority === 'high').length / tasks.length) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-gray-700/30 p-4 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-yellow-400 font-medium">Medium Priority</span>
              <span className="text-white font-bold">{tasks.filter(t => t.priority === 'medium').length}</span>
            </div>
            <div className="w-full bg-gray-600/50 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-yellow-500 to-amber-500 h-2 rounded-full"
                style={{ width: `${tasks.length ? (tasks.filter(t => t.priority === 'medium').length / tasks.length) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-gray-700/30 p-4 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-green-400 font-medium">Low Priority</span>
              <span className="text-white font-bold">{tasks.filter(t => t.priority === 'low').length}</span>
            </div>
            <div className="w-full bg-gray-600/50 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                style={{ width: `${tasks.length ? (tasks.filter(t => t.priority === 'low').length / tasks.length) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;