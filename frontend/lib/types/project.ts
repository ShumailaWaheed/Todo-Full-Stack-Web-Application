// frontend/lib/types/project.ts
export interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string;
  user_id: string;
  due_date?: string; // ISO date string
  priority?: 'low' | 'medium' | 'high';
  completed: boolean;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  // Analytics/Computed fields
  members?: number;
  progress?: number;
  tasks_completed?: number;
  tasks_total?: number;
}

export interface ProjectCreate {
  name: string;
  slug: string;
  description?: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
  completed?: boolean;
}

export interface ProjectUpdate {
  name?: string;
  slug?: string;
  description?: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
  completed?: boolean;
}

export interface ProjectToggleComplete {
  completed: boolean;
}

export interface ProjectListResponse {
  projects: Project[];
  total: number;
  offset: number;
  limit: number;
}

export interface ProjectAPIResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  user_id: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
  completed: boolean;
  created_at: string;
  updated_at: string;
}