'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define theme types
type Theme = 'light' | 'dark' | 'system';
type DashboardTheme = {
  mode: Theme;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
};

// Default theme values
const defaultTheme: DashboardTheme = {
  mode: 'dark',
  accentColor: 'from-purple-500 to-pink-500',
  backgroundColor: 'from-gray-900 to-black',
  textColor: 'text-white',
};

// Create context
const ThemeContext = createContext<{
  theme: DashboardTheme;
  setTheme: (theme: DashboardTheme) => void;
  toggleTheme: () => void;
  setAccentColor: (color: string) => void;
} | undefined>(undefined);

// Theme provider component
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<DashboardTheme>(defaultTheme);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('dashboard-theme');
    if (savedTheme) {
      try {
        const parsedTheme = JSON.parse(savedTheme);
        setThemeState(parsedTheme);
      } catch (error) {
        console.error('Failed to parse saved theme:', error);
      }
    }
  }, []);

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('dashboard-theme', JSON.stringify(theme));
  }, [theme]);

  const setTheme = (newTheme: DashboardTheme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    const newMode = theme.mode === 'dark' ? 'light' : 'dark';
    setThemeState(prev => ({
      ...prev,
      mode: newMode
    }));
  };

  const setAccentColor = (color: string) => {
    setThemeState(prev => ({
      ...prev,
      accentColor: color
    }));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = (): {
  theme: DashboardTheme;
  setTheme: (theme: DashboardTheme) => void;
  toggleTheme: () => void;
  setAccentColor: (color: string) => void;
} => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};