// frontend/lib/types/user.ts
export interface User {
  id: string;
  email: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

export interface LoginRequest {
  email: string;
  password?: string; // Optional for demo purposes
}

export interface Token {
  access_token: string;
  refresh_token: string;
  token_type?: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}