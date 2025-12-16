// frontend/lib/auth/context.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Token } from '../types';
import { apiService } from '../api';

// Helper function to decode JWT token
const decodeToken = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<Token>;
  logout: () => void;
  checkAuthStatus: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on initial load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const accessToken = apiService.getAccessToken();
    if (accessToken) {
      // In a real app, we would validate the token with the backend
      // For now, we'll just set the authenticated state based on token presence
      setToken(accessToken);
      setIsAuthenticated(true);

      // Decode the token to get user info
      const tokenPayload = decodeToken(accessToken);
      if (tokenPayload) {
        const userId = tokenPayload.sub;
        const email = tokenPayload.email;

        // Set user info from token
        setUser({
          id: userId,
          email: email || 'unknown@example.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    setLoading(false);
  };

  const login = async (email: string, password: string): Promise<Token> => {
    setLoading(true);
    try {
      // Note: In this implementation, password is not actually used for authentication
      // as the backend handles authentication differently, but we keep the parameter
      // for UI consistency
      const loginData = { email, password };
      const tokens = await apiService.login(loginData);

      // Decode the JWT token to get the user ID
      const tokenPayload = decodeToken(tokens.access_token);
      const userId = tokenPayload?.sub || 'unknown';

      // After successful login, fetch user details
      // Note: In this demo, we don't have an endpoint to fetch user by token
      // so we'll create a minimal user object based on the login response
      setUser({
        id: userId,
        email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      setToken(tokens.access_token);
      setIsAuthenticated(true);

      return tokens;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};