// frontend/lib/types/task.ts
export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  user_id: string;
  due_date?: string; // ISO date string
  priority?: 'low' | 'medium' | 'high';
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

export interface TaskCreate {
  title: string;
  description?: string;
  completed?: boolean;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  completed?: boolean;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface TaskToggleComplete {
  completed: boolean;
}

export interface TaskListResponse {
  tasks: Task[];
  total: number;
  offset: number;
  limit: number;
}

export interface TaskAPIResponse {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  user_id: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}