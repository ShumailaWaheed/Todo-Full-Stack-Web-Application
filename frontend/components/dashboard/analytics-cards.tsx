// frontend/components/dashboard/analytics-cards.tsx
'use client';

import React from 'react';
import { FaBolt, FaFire, FaRegLightbulb, FaRegStar } from 'react-icons/fa';

interface AnalyticsData {
  productivityScore: number;
  streak: number;
  efficiency: number;
  focusTime: string;
}

const AnalyticsCards: React.FC<{ data: AnalyticsData }> = ({ data }) => {
  const analyticsCards = [
    {
      title: 'Productivity Score',
      value: `${data.productivityScore}/100`,
      description: 'Based on task completion and efficiency',
      icon: <FaBolt className="text-yellow-400" size={24} />,
      color: 'from-yellow-500/20 to-amber-500/20',
      glow: 'shadow-yellow-500/30'
    },
    {
      title: 'Current Streak',
      value: `${data.streak} days`,
      description: 'Consecutive days with task completion',
      icon: <FaFire className="text-orange-400" size={24} />,
      color: 'from-orange-500/20 to-red-500/20',
      glow: 'shadow-orange-500/30'
    },
    {
      title: 'Efficiency Rate',
      value: `${data.efficiency}%`,
      description: 'Tasks completed vs. planned',
      icon: <FaRegLightbulb className="text-blue-400" size={24} />,
      color: 'from-blue-500/20 to-cyan-500/20',
      glow: 'shadow-blue-500/30'
    },
    {
      title: 'Focus Time',
      value: data.focusTime,
      description: 'Time spent on focused work',
      icon: <FaRegStar className="text-purple-400" size={24} />,
      color: 'from-purple-500/20 to-pink-500/20',
      glow: 'shadow-purple-500/30'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {analyticsCards.map((card, index) => (
        <div
          key={index}
          className={`bg-gradient-to-br ${card.color} rounded-2xl p-5 border border-gray-700/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:${card.glow} group`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">{card.title}</p>
              <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
              <p className="text-xs text-gray-500 mt-2">{card.description}</p>
            </div>
            <div className="p-2 rounded-lg bg-gray-800/50 group-hover:scale-110 transition-transform duration-300">
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnalyticsCards;