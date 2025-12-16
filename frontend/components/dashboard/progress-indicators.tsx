// frontend/components/dashboard/progress-indicators.tsx
'use client';

import React from 'react';
import { FaTasks, FaCheck, FaExclamationTriangle, FaClock, FaChartLine } from 'react-icons/fa';

interface ProgressData {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
}

const ProgressIndicators: React.FC<{ data: ProgressData }> = ({ data }) => {
  const completionPercentage = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
  const inProgressPercentage = data.total > 0 ? Math.round((data.inProgress / data.total) * 100) : 0;
  const overduePercentage = data.total > 0 ? Math.round((data.overdue / data.total) * 100) : 0;

  const progressBars = [
    {
      label: 'Completed',
      value: completionPercentage,
      color: 'bg-gradient-to-r from-green-500 to-emerald-500',
      icon: <FaCheck className="text-green-400" />
    },
    {
      label: 'In Progress',
      value: inProgressPercentage,
      color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      icon: <FaTasks className="text-blue-400" />
    },
    {
      label: 'Overdue',
      value: overduePercentage,
      color: 'bg-gradient-to-r from-red-500 to-pink-500',
      icon: <FaExclamationTriangle className="text-red-400" />
    }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm mb-6">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
        <FaChartLine className="mr-2 text-purple-400" /> Task Progress
      </h3>

      <div className="space-y-4">
        {progressBars.map((bar, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300 flex items-center">
                {bar.icon}
                <span className="ml-2">{bar.label}</span>
              </span>
              <span className="text-gray-400">{bar.value}%</span>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${bar.color} transition-all duration-500 ease-out`}
                style={{ width: `${bar.value}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Circular Progress Chart */}
      <div className="mt-6 pt-6 border-t border-gray-700/50">
        <div className="flex justify-center">
          <div className="relative w-32 h-32">
            {/* Background circle */}
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#374151"
                strokeWidth="8"
              />
              {/* Completed tasks arc */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#gradient1)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${completionPercentage * 2.83} 283`}
                strokeDashoffset="0"
                transform="rotate(-90 50 50)"
                className="transition-all duration-1000 ease-out"
              />
              {/* In progress tasks arc */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#gradient2)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${inProgressPercentage * 2.83} 283`}
                strokeDashoffset={`${-completionPercentage * 2.83}`}
                transform="rotate(-90 50 50)"
                className="transition-all duration-1000 ease-out"
              />
              {/* Overdue tasks arc */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#gradient3)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${overduePercentage * 2.83} 283`}
                strokeDashoffset={`${-(completionPercentage + inProgressPercentage) * 2.83}`}
                transform="rotate(-90 50 50)"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#0ea5e9" />
                </linearGradient>
                <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-white">{completionPercentage}%</span>
              <span className="text-xs text-gray-400">Complete</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicators;