// frontend/components/dashboard/recent-activity.tsx
'use client';

import React from 'react';
import { FaCheck, FaRegClock, FaRegFolder, FaRegStar } from 'react-icons/fa';

interface Activity {
  id: string;
  type: 'completed' | 'created' | 'updated' | 'starred';
  title: string;
  time: string;
  project?: string;
}

const RecentActivity: React.FC<{ activities: Activity[] }> = ({ activities }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'completed':
        return <FaCheck className="text-green-400" />;
      case 'created':
        return <FaRegClock className="text-blue-400" />;
      case 'updated':
        return <FaRegFolder className="text-yellow-400" />;
      case 'starred':
        return <FaRegStar className="text-purple-400" />;
      default:
        return <FaRegClock className="text-gray-400" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'completed':
        return 'text-green-400';
      case 'created':
        return 'text-blue-400';
      case 'updated':
        return 'text-yellow-400';
      case 'starred':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
        <FaRegClock className="mr-2 text-blue-400" /> Recent Activity
      </h3>

      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start p-3 rounded-xl bg-gray-700/20 hover:bg-gray-700/30 transition-all duration-200 group"
            >
              <div className={`p-2 rounded-lg bg-gray-800/50 mr-3 ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{activity.title}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {activity.project && (
                    <span className="inline-block bg-gray-700/50 px-2 py-1 rounded text-xs mr-2">
                      {activity.project}
                    </span>
                  )}
                  <span>{activity.time}</span>
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;