// frontend/lib/api/index.ts
import { Token, LoginRequest, RefreshTokenRequest, Task, TaskCreate, TaskUpdate, TaskToggleComplete, TaskListResponse, User } from '../types';
import { Project, ProjectCreate, ProjectUpdate, ProjectToggleComplete } from '../types/project';

// Analytics types
export interface TaskCompletionTrend {
  week: string;
  completed: number;
}

export interface TaskCompletionTrendsResponse {
  trends: TaskCompletionTrend[];
}

export interface WeeklyTaskActivity {
  week: string;
  created: number;
  completed: number;
}

export interface WeeklyTaskActivityResponse {
  activity: WeeklyTaskActivity[];
}

export interface TaskAnalyticsSummary {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  overdue_tasks: number;
  completion_rate: number;
  tasks_completed_this_week: number;
  tasks_created_this_week: number;
  high_priority_pending: number;
  medium_priority_pending: number;
  low_priority_pending: number;
}

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
            throw new Error(`API request failed with status ${retryResponse.status}`);
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
        throw new Error(`API request failed with status ${response.status}`);
      }

      return response.json() as Promise<T>;
    } catch (error) {
      console.error('API request error:', error);
      // Check if it's a network error (Failed to fetch)
      if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('network'))) {
        throw new Error('Network error: Unable to connect to the server. Please check your connection and try again.');
      }
      throw error;
    }
  }

  private async refreshTokenIfNeeded(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    // Handle mock refresh tokens
    if (refreshToken.startsWith('mock_refresh_token_for_')) {
      // For mock tokens, just return true to indicate the token is still valid
      // In a real app, this would call the refresh endpoint
      return true;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
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
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status} ${response.statusText}`);
    }

    const tokens: Token = await response.json();
    this.setTokens(tokens.access_token, tokens.refresh_token);
    return tokens;
  }

  async logout(): Promise<void> {
    this.clearTokens();
  }

  async checkEmail(email: string): Promise<{ exists: boolean }> {
    return this.request<{ exists: boolean }>('/auth/check-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Task methods
  async getTasks(userId: string, completed?: boolean, search?: string, limit: number = 50, offset: number = 0): Promise<TaskListResponse> {
    let url = `/api/${userId}/?limit=${limit}&offset=${offset}`;
    if (completed !== undefined) {
      url += `&completed=${completed}`;
    }
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    return this.request<TaskListResponse>(url, { method: 'GET' });
  }

  async getTask(userId: string, taskId: string): Promise<Task> {
    return this.request<Task>(`/api/${userId}/${taskId}`, { method: 'GET' });
  }

  async createTask(userId: string, taskData: TaskCreate): Promise<Task> {
    return this.request<Task>(`/api/${userId}/`, {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(userId: string, taskId: string, taskData: TaskUpdate): Promise<Task> {
    return this.request<Task>(`/api/${userId}/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  async deleteTask(userId: string, taskId: string): Promise<void> {
    const url = `${API_BASE_URL}/api/${userId}/${taskId}`;

    const headers = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if we have an access token
    const accessToken = this.getAccessToken();
    if (accessToken) {
      (headers as any)['Authorization'] = `Bearer ${accessToken}`;
    }

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers,
      });

      if (response.status === 401) {
        // Try to refresh the token
        const refreshed = await this.refreshTokenIfNeeded();
        if (refreshed) {
          // Retry the request with the new token
          const newAccessToken = this.getAccessToken();
          if (newAccessToken) {
            (headers as any)['Authorization'] = `Bearer ${newAccessToken}`;
          }
          const retryResponse = await fetch(url, {
            method: 'DELETE',
            headers
          });
          if (!retryResponse.ok && retryResponse.status !== 204) {
            throw new Error(`API request failed with status ${retryResponse.status}`);
          }
          // 204 No Content means success for DELETE
          return;
        } else {
          // Token refresh failed, clear tokens and redirect to login
          this.clearTokens();
          window.location.href = '/auth/sign-in';
          throw new Error('Authentication required');
        }
      }

      if (!response.ok && response.status !== 204) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      // 204 No Content means success for DELETE
      return;
    } catch (error) {
      console.error('API request error:', error);
      // Check if it's a network error (Failed to fetch)
      if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('network'))) {
        throw new Error('Network error: Unable to connect to the server. Please check your connection and try again.');
      }
      throw error;
    }
  }

  async toggleTaskCompletion(userId: string, taskId: string, completionData: TaskToggleComplete): Promise<Task> {
    return this.request<Task>(`/api/${userId}/${taskId}/complete`, {
      method: 'PATCH',
      body: JSON.stringify(completionData),
    });
  }

  // Analytics methods
  async getTaskCompletionTrends(userId: string, weeks: number = 8): Promise<TaskCompletionTrendsResponse> {
    return this.request<TaskCompletionTrendsResponse>(
      `/api/${userId}/analytics/completion-trends?weeks=${weeks}`,
      { method: 'GET' }
    );
  }

  async getWeeklyTaskActivity(userId: string, weeks: number = 8): Promise<WeeklyTaskActivityResponse> {
    return this.request<WeeklyTaskActivityResponse>(
      `/api/${userId}/analytics/weekly-activity?weeks=${weeks}`,
      { method: 'GET' }
    );
  }

  async getTaskAnalyticsSummary(userId: string): Promise<TaskAnalyticsSummary> {
    return this.request<TaskAnalyticsSummary>(
      `/api/${userId}/analytics/summary`,
      { method: 'GET' }
    );
  }

  // Project methods
  async getProjects(userId: string, completed?: boolean, search?: string, limit: number = 50, offset: number = 0): Promise<Project[]> {
    let url = `/api/${userId}/projects?limit=${limit}&offset=${offset}`;
    if (completed !== undefined) {
      url += `&completed=${completed}`;
    }
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    return this.request<Project[]>(url, { method: 'GET' });
  }

  async getProject(userId: string, projectId: string): Promise<Project> {
    return this.request<Project>(`/api/${userId}/projects/${projectId}`, { method: 'GET' });
  }

  async createProject(userId: string, projectData: ProjectCreate): Promise<Project> {
    return this.request<Project>(`/api/${userId}/projects`, {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(userId: string, projectId: string, projectData: ProjectUpdate): Promise<Project> {
    return this.request<Project>(`/api/${userId}/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  async deleteProject(userId: string, projectId: string): Promise<void> {
    await this.request<void>(`/api/${userId}/projects/${projectId}`, { method: 'DELETE' });
  }

  async toggleProjectCompletion(userId: string, projectId: string, completionData: ProjectToggleComplete): Promise<Project> {
    return this.request<Project>(`/api/${userId}/projects/${projectId}/complete`, {
      method: 'PATCH',
      body: JSON.stringify(completionData),
    });
  }

  // User profile methods
  async getUserProfile(userId: string): Promise<User> {
    return this.request<User>(`/api/${userId}/profile`, { method: 'GET' });
  }

  async updateUserProfile(userId: string, userData: Partial<User>): Promise<User> {
    // Only send the fields that are defined in the UserUpdate schema
    const updateData: Partial<User> = {};
    if (userData.email !== undefined) updateData.email = userData.email;
    if (userData.name !== undefined) updateData.name = userData.name;
    if (userData.bio !== undefined) updateData.bio = userData.bio;
    if (userData.location !== undefined) updateData.location = userData.location;
    if (userData.theme_preference !== undefined) updateData.theme_preference = userData.theme_preference;

    return this.request<User>(`/api/${userId}/profile`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async uploadProfileImage(userId: string, imageFile: File): Promise<any> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const accessToken = this.getAccessToken();
    const headers: HeadersInit = {};
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Don't use the request method as it expects JSON
    const response = await fetch(`${API_BASE_URL}/api/${userId}/profile/image`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Try to refresh the token
        const refreshed = await this.refreshTokenIfNeeded();
        if (refreshed) {
          const newAccessToken = this.getAccessToken();
          if (newAccessToken) {
            headers['Authorization'] = `Bearer ${newAccessToken}`;
          }
          const retryResponse = await fetch(`${API_BASE_URL}/api/${userId}/profile/image`, {
            method: 'POST',
            headers,
            body: formData,
          });
          if (!retryResponse.ok) {
            throw new Error(`API request failed with status ${retryResponse.status}`);
          }
          return retryResponse.json();
        } else {
          // Token refresh failed, clear tokens and redirect to login
          this.clearTokens();
          window.location.href = '/auth/sign-in';
          throw new Error('Authentication required');
        }
      }
      throw new Error(`API request failed with status ${response.status}`);
    }

    return response.json();
  }

  // Delete user account
  async deleteUser(userId: string): Promise<void> {
    await this.request<void>(`/api/${userId}/profile`, { method: 'DELETE' });
  }

}

export const apiService = new ApiService();