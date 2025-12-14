// frontend/components/tasks/task-detail.tsx
'use client';

import React from 'react';
import { Task } from '../../lib/types';

interface TaskDetailProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onBack: () => void;
}

const TaskDetail: React.FC<TaskDetailProps> = ({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  onBack
}) => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Task Details
        </h3>
        <button
          onClick={onBack}
          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Back
        </button>
      </div>
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-start">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggleComplete(task)}
            className="h-5 w-5 text-indigo-600 mt-1"
          />
          <div className="ml-4 flex-1">
            <h4 className={`text-lg font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {task.title}
            </h4>
            {task.description && (
              <div className={`mt-2 text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-500'}`}>
                <p>{task.description}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="bg-gray-50 p-4 rounded-md">
            <h5 className="text-sm font-medium text-gray-500">Created</h5>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(task.created_at).toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <h5 className="text-sm font-medium text-gray-500">Updated</h5>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(task.updated_at).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-6 flex space-x-3">
          <button
            onClick={() => onEdit(task)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Edit Task
          </button>
          <button
            onClick={() => onDelete(task)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;