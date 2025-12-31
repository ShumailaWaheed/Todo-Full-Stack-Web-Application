// frontend/components/dashboard/task-insights.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  FaChartLine,
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaRedo,
  FaChevronRight,
} from 'react-icons/fa';

interface TaskInsightsProps {
  className?: string;
  data?: {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
  };
}

const TaskInsights: React.FC<TaskInsightsProps> = ({
  className = '',
  data: initialData,
}) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(false);

  // Use initial data or simulate loading
  useEffect(() => {
    if (initialData) {
      setData(initialData);
      setLoading(false);
      return;
    }

    // Simulate data loading
    const timer = setTimeout(() => {
      setData({
        total: 12,
        completed: 8,
        inProgress: 3,
        overdue: 1,
      });
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [initialData]);

  const handleRetry = () => {
    setLoading(true);
    setError(false);

    // Simulate retry
    setTimeout(() => {
      setData({
        total: 12,
        completed: 8,
        inProgress: 3,
        overdue: 1,
      });
      setLoading(false);
    }, 1000);
  };

  const completionRate = data?.total
    ? Math.round((data.completed / data.total) * 100)
    : 0;

  if (loading) {
    return (
      <div className={`outline-card p-5 md:p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg skeleton"></div>
          <div className="flex-1">
            <div className="h-5 w-32 skeleton rounded mb-2"></div>
            <div className="h-4 w-24 skeleton rounded"></div>
          </div>
        </div>

        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <div className="h-4 w-20 skeleton rounded"></div>
                <div className="h-4 w-8 skeleton rounded"></div>
              </div>
              <div className="h-2 w-full skeleton rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`outline-card p-5 md:p-6 ${className}`}>
        <div className="flex items-center justify-center flex-col py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-[#ef4444]/10 flex items-center justify-center mb-4">
            <FaExclamationTriangle className="w-6 h-6 text-[#ef4444]" />
          </div>
          <p className="text-[#f0f2f5] font-medium mb-2">
            Unable to load insights
          </p>
          <p className="text-sm text-[#6b7280] mb-4">
            Please check your connection and try again
          </p>
          <button
            onClick={handleRetry}
            className="btn-outline btn-outline-primary flex items-center gap-2 text-sm"
          >
            <FaRedo className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Tasks',
      value: data?.total || 0,
      icon: FaTasks,
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)',
    },
    {
      label: 'Completed',
      value: data?.completed || 0,
      icon: FaCheckCircle,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
    },
    {
      label: 'In Progress',
      value: data?.inProgress || 0,
      icon: FaClock,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
    },
    {
      label: 'Overdue',
      value: data?.overdue || 0,
      icon: FaExclamationTriangle,
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)',
    },
  ];

  return (
    <div className={`outline-card p-5 md:p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#8b5cf6]/10 flex items-center justify-center">
            <FaChartLine className="w-5 h-5 text-[#8b5cf6]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#f0f2f5]">
              Task Insights
            </h3>
            <p className="text-xs text-[#6b7280]">Your productivity overview</p>
          </div>
        </div>
        <button className="text-xs text-[#8b5cf6] hover:text-[#a78bfa] flex items-center gap-1 transition-colors">
          Details <FaChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Completion Rate Circle */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <svg className="w-24 h-24 transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="48"
              cy="48"
              r="40"
              fill="none"
              stroke="#222630"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="48"
              cy="48"
              r="40"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${completionRate * 2.51} 251`}
              className="transition-all duration-1000 ease-out"
            />
            {/* Gradient definition */}
            <defs>
              <linearGradient
                id="gradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-[#f0f2f5]">
              {completionRate}%
            </span>
            <span className="text-xs text-[#6b7280]">Complete</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-[#1c2029] border border-[rgba(148,163,184,0.12)] rounded-xl p-3 hover:border-[rgba(148,163,184,0.2)] hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#6b7280]">{stat.label}</span>
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: stat.bgColor }}
              >
                <stat.icon className="w-3 h-3" style={{ color: stat.color }} />
              </div>
            </div>
            <p className="text-xl font-bold text-[#f0f2f5]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Progress Bars */}
      <div className="mt-5 space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-[#6b7280]">Weekly Progress</span>
            <span className="text-[#9ca3af]">5/7 days</span>
          </div>
          <div className="h-1.5 bg-[#222630] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] rounded-full transition-all duration-1000"
              style={{ width: '71%' }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-[#6b7280]">Daily Goal</span>
            <span className="text-[#9ca3af]">8/10 tasks</span>
          </div>
          <div className="h-1.5 bg-[#222630] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#10b981] to-[#34d399] rounded-full transition-all duration-1000"
              style={{ width: '80%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskInsights;
