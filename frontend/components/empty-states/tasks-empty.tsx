// frontend/components/empty-states/tasks-empty.tsx
'use client';

import React from 'react';
import { FaTasks, FaPlus } from 'react-icons/fa';

interface TasksEmptyStateProps {
  onCreateTask?: () => void;
}

const TasksEmptyState: React.FC<TasksEmptyStateProps> = ({ onCreateTask }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-6 p-4 bg-gray-800/50 rounded-full border border-gray-700 shadow-lg shadow-purple-500/10">
        <FaTasks className="text-4xl text-purple-400" />
      </div>
      <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2 shadow-lg shadow-purple-500/20">
        No tasks found
      </h3>
      <p className="text-gray-400 mb-6 max-w-md">
        Get started by creating your first task
      </p>
      {onCreateTask && (
        <button
          onClick={onCreateTask}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30"
        >
          <FaPlus className="mr-2" />
          Create Task
        </button>
      )}
    </div>
  );
};

export default TasksEmptyState;