// frontend/lib/utils/task-utils.ts
import { Task } from '../types/task';

/**
 * Ensures consistent formatting of task objects for event dispatching
 */
export const formatTaskForEvent = (task: any): Task => {
  return {
    id: String(task.id),
    title: task.title || '',
    description: task.description || '',
    completed: Boolean(task.completed),
    user_id: String(task.user_id),
    due_date: task.due_date || null,
    priority: task.priority || 'medium',
    created_at: task.created_at || new Date().toISOString(),
    updated_at: task.updated_at || new Date().toISOString(),
  };
};

/**
 * Validates that a task object has the required properties
 */
export const isValidTask = (task: any): task is Task => {
  return (
    task &&
    typeof task.id === 'string' &&
    typeof task.title === 'string' &&
    typeof task.completed === 'boolean' &&
    typeof task.user_id === 'string'
  );
};