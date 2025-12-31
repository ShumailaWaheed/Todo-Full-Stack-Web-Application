'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface TaskUpdateContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const TaskUpdateContext = createContext<TaskUpdateContextType | null>(null);

export const useTaskUpdate = () => {
  const context = useContext(TaskUpdateContext);
  if (!context) {
    // Return a no-op if not within provider (for safety)
    return {
      refreshTrigger: 0,
      triggerRefresh: () => {},
    };
  }
  return context;
};

export const TaskUpdateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <TaskUpdateContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </TaskUpdateContext.Provider>
  );
};

export default TaskUpdateProvider;
