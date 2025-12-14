// frontend/lib/api/index.ts
import { Token, LoginRequest, RefreshTokenRequest, Task, TaskCreate, TaskUpdate, TaskToggleComplete, TaskListResponse } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    // Store in localStorage or secure storage
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  getAccessToken(): string | null {
    if (!this.accessToken) {
      this.accessToken = localStorage.getItem('access_token');
    }
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    if (!this.refreshToken) {
      this.refreshToken = localStorage.getItem('refresh_token');
    }
    return this.refreshToken;
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authorization header if we have an access token
    const accessToken = this.getAccessToken();
    if (accessToken) {
      (headers as any)['Authorization'] = `Bearer ${accessToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        // Try to refresh the token
        const refreshed = await this.refreshTokenIfNeeded();
        if (refreshed) {
          // Retry the request with the new token
          const newAccessToken = this.getAccessToken();
          if (newAccessToken) {
            (headers as any)['Authorization'] = `Bearer ${newAccessToken}`;
          }
          const retryResponse = await fetch(url, { ...config, headers });
          if (!retryResponse.ok) {
            throw new Error(`API request failed: ${retryResponse.statusText}`);
          }
          return retryResponse.json() as Promise<T>;
        } else {
          // Token refresh failed, clear tokens and redirect to login
          this.clearTokens();
          window.location.href = '/auth/sign-in';
          throw new Error('Authentication required');
        }
      }

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      return response.json() as Promise<T>;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  private async refreshTokenIfNeeded(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const data: Token = await response.json();
        this.setTokens(data.access_token, data.refresh_token);
        return true;
      } else {
        // Refresh token failed, clear existing tokens
        this.clearTokens();
        return false;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearTokens();
      return false;
    }
  }

  // Authentication methods
  async login(loginData: LoginRequest): Promise<Token> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const tokens: Token = await response.json();
    this.setTokens(tokens.access_token, tokens.refresh_token);
    return tokens;
  }

  async logout(): Promise<void> {
    this.clearTokens();
  }

  // Task methods
  async getTasks(userId: string, completed?: boolean, limit: number = 50, offset: number = 0): Promise<TaskListResponse> {
    let url = `/api/users/${userId}/tasks?limit=${limit}&offset=${offset}`;
    if (completed !== undefined) {
      url += `&completed=${completed}`;
    }
    return this.request<TaskListResponse>(url, { method: 'GET' });
  }

  async getTask(userId: string, taskId: string): Promise<Task> {
    return this.request<Task>(`/api/users/${userId}/tasks/${taskId}`, { method: 'GET' });
  }

  async createTask(userId: string, taskData: TaskCreate): Promise<Task> {
    return this.request<Task>(`/api/users/${userId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(userId: string, taskId: string, taskData: TaskUpdate): Promise<Task> {
    return this.request<Task>(`/api/users/${userId}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  async deleteTask(userId: string, taskId: string): Promise<void> {
    await this.request<void>(`/api/users/${userId}/tasks/${taskId}`, { method: 'DELETE' });
  }

  async toggleTaskCompletion(userId: string, taskId: string, completionData: TaskToggleComplete): Promise<Task> {
    return this.request<Task>(`/api/users/${userId}/tasks/${taskId}/complete`, {
      method: 'PATCH',
      body: JSON.stringify(completionData),
    });
  }
}

export const apiService = new ApiService();