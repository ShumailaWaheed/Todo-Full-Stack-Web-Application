// frontend/components/dashboard/tasks-overview.tsx
'use client';

import React from 'react';
import { FaCalendarDay, FaRegClock, FaCheckCircle, FaRegFolder, FaChartLine } from 'react-icons/fa';

interface TaskStats {
  today: number;
  upcoming: number;
  completed: number;
  projects: number;
  completedThisWeek: number;
}

const TasksOverview: React.FC<{ stats: TaskStats }> = ({ stats }) => {
  const statCards = [
    {
      title: 'Today',
      value: stats.today,
      icon: <FaCalendarDay className="text-purple-400" size={24} />,
      color: 'from-purple-500/20 to-pink-500/20',
      glow: 'shadow-purple-500/30'
    },
    {
      title: 'Upcoming',
      value: stats.upcoming,
      icon: <FaRegClock className="text-blue-400" size={24} />,
      color: 'from-blue-500/20 to-cyan-500/20',
      glow: 'shadow-blue-500/30'
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: <FaCheckCircle className="text-green-400" size={24} />,
      color: 'from-green-500/20 to-emerald-500/20',
      glow: 'shadow-green-500/30'
    },
    {
      title: 'Projects',
      value: stats.projects,
      icon: <FaRegFolder className="text-yellow-400" size={24} />,
      color: 'from-yellow-500/20 to-amber-500/20',
      glow: 'shadow-yellow-500/30'
    },
    {
      title: 'This Week',
      value: `${stats.completedThisWeek}%`,
      icon: <FaChartLine className="text-pink-400" size={24} />,
      color: 'from-pink-500/20 to-rose-500/20',
      glow: 'shadow-pink-500/30'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className={`bg-gradient-to-br ${stat.color} rounded-2xl p-5 border border-gray-700/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:${stat.glow} group`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
              <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-800/50 group-hover:scale-110 transition-transform duration-300">
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TasksOverview;