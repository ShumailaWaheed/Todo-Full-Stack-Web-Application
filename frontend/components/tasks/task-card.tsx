// frontend/components/tasks/task-card.tsx
'use client';

import React from 'react';
import { Task } from '../../lib/types';
import { useTheme } from '../../lib/theme/context';
import { FaCheck, FaEdit, FaTrash, FaCalendarAlt, FaFlag } from 'react-icons/fa';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggleComplete, onEdit, onDelete }) => {
  const { theme } = useTheme();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`rounded-xl p-6 mb-4 border transition-all duration-300 ${
      theme.mode === 'light'
        ? 'bg-white border-gray-200 text-gray-900'
        : 'bg-gray-800 border-gray-600 hover:border-gray-500 hover:shadow-lg hover:shadow-purple-500/5 transition-shadow'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggleComplete(task)}
            className={`mt-1 h-5 w-5 rounded ${
              theme.mode === 'light'
                ? 'border-gray-300 bg-white text-gray-900 focus:ring-gray-900'
                : 'border-gray-600 bg-gray-700 text-purple-500 focus:ring-purple-500'
            } focus:ring-2`}
          />
          <div className="ml-4 flex-1">
            <h3 className={`text-lg font-medium ${task.completed ? 'line-through text-gray-500' : (theme.mode === 'light' ? 'text-gray-900' : 'text-white')}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className={`mt-1 ${theme.mode === 'light' ? 'text-gray-600' : 'text-gray-400'} ${task.completed ? 'line-through' : ''}`}>
                {task.description}
              </p>
            )}

            <div className="flex flex-wrap gap-2 mt-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(task.priority || 'low')}`}>
                <FaFlag className="mr-1" />
                {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Medium'}
              </span>

              {task.due_date && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  theme.mode === 'light'
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  <FaCalendarAlt className="mr-1" />
                  {formatDate(task.due_date)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(task)}
            className={`p-2 ${
              theme.mode === 'light'
                ? 'text-gray-600 hover:text-purple-600 hover:bg-gray-100'
                : 'text-gray-400 hover:text-purple-400 hover:bg-gray-700 rounded-lg transition-colors duration-200'
            } rounded-lg transition-colors duration-200`}
            aria-label="Edit task"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => onDelete(task)}
            className={`p-2 ${
              theme.mode === 'light'
                ? 'text-gray-600 hover:text-red-600 hover:bg-gray-100'
                : 'text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors duration-200'
            } rounded-lg transition-colors duration-200`}
            aria-label="Delete task"
          >
            <FaTrash />
          </button>
          {!task.completed && (
            <button
              onClick={() => onToggleComplete(task)}
              className={`p-2 ${
                theme.mode === 'light'
                  ? 'text-gray-600 hover:text-green-600 hover:bg-gray-100'
                  : 'text-gray-400 hover:text-green-400 hover:bg-gray-700 rounded-lg transition-colors duration-200'
              } rounded-lg transition-colors duration-200`}
              aria-label="Mark as complete"
            >
              <FaCheck />
            </button>
          )}
        </div>
      </div>

      <div className={`mt-4 flex justify-between items-center text-xs ${
        theme.mode === 'light' ? 'text-gray-500' : 'text-gray-500'
      }`}>
        <span>Created: {formatDate(task.created_at)}</span>
        {task.updated_at !== task.created_at && (
          <span>Updated: {formatDate(task.updated_at)}</span>
        )}
      </div>
    </div>
  );
};

export default TaskCard;