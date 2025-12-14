// frontend/components/tasks/task-card.tsx
'use client';

import React from 'react';
import { Task } from '../../lib/types';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onEdit,
  onDelete
}) => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggleComplete(task)}
              className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <h3 className={`ml-3 text-lg leading-6 font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {task.title}
            </h3>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(task)}
              className="inline-flex items-center px-2.5 py-0.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(task)}
              className="inline-flex items-center px-2.5 py-0.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        {task.description && (
          <p className={`mt-2 ${task.completed ? 'line-through text-gray-400' : 'text-gray-600'}`}>
            {task.description}
          </p>
        )}
        <div className="mt-4 flex flex-wrap justify-between text-sm text-gray-500">
          <span>Created: {new Date(task.created_at).toLocaleDateString()}</span>
          {task.updated_at !== task.created_at && (
            <span>Updated: {new Date(task.updated_at).toLocaleDateString()}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;