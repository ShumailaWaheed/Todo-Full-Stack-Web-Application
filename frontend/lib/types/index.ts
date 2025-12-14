// frontend/lib/types/index.ts
export * from './user';
export * from './task';

// API response types
export interface APIResponse<T> {
  data: T;
  message?: string;
}

export interface APIError {
  detail: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}