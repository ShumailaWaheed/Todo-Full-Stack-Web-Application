'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Task } from '../types/task';
import { apiService } from '../api';
import { useAuth } from '../auth/context';

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

type TaskAction =
  | { type: 'FETCH_TASKS_START' }
  | { type: 'FETCH_TASKS_SUCCESS'; payload: Task[] }
  | { type: 'FETCH_TASKS_ERROR'; payload: string }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_TASK'; payload: Task };

const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
};

const taskReducer = (state: TaskState, action: TaskAction): TaskState => {
  switch (action.type) {
    case 'FETCH_TASKS_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_TASKS_SUCCESS':
      return { ...state, loading: false, tasks: action.payload };
    case 'FETCH_TASKS_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
      };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        ),
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
      };
    case 'TOGGLE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        ),
      };
    default:
      return state;
  }
};

interface TaskContextType extends TaskState {
  refreshTasks: () => Promise<void>;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  toggleTask: (task: Task) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const { user } = useAuth();

  const refreshTasks = async () => {
    if (!user) return;

    try {
      dispatch({ type: 'FETCH_TASKS_START' });

      // First try to fetch from the backend
      try {
        const response = await apiService.getTasks(user.id);
        dispatch({ type: 'FETCH_TASKS_SUCCESS', payload: response.tasks || [] });

        // Update local storage with the latest successful fetch
        if (response.tasks && Array.isArray(response.tasks)) {
          localStorage.setItem(`tasks_${user.id}`, JSON.stringify(response.tasks));
        }
      } catch (backendError) {
        console.warn('Backend fetch failed, falling back to local storage:', backendError);

        // If backend fails, try to load from local storage
        const storedTasks = localStorage.getItem(`tasks_${user.id}`);
        if (storedTasks) {
          const tasks = JSON.parse(storedTasks);
          dispatch({ type: 'FETCH_TASKS_SUCCESS', payload: tasks });
        } else {
          // If no local storage data, just return empty array
          dispatch({ type: 'FETCH_TASKS_SUCCESS', payload: [] });
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tasks';
      dispatch({ type: 'FETCH_TASKS_ERROR', payload: errorMessage });
    }
  };

  useEffect(() => {
    if (user) {
      refreshTasks();
    }
  }, [user]);

  // Initialize backend wake-up service when component mounts
  useEffect(() => {
    const initializeBackendWakeup = async () => {
      try {
        const { backendWakeupService } = await import('../api/backend-wakeup');

        // Start periodic wake-up to keep backend alive
        backendWakeupService.startPeriodicWakeUp(4); // Wake up every 4 minutes

        // Ensure backend is awake initially
        await backendWakeupService.ensureBackendAwake();
      } catch (error) {
        console.warn('Could not initialize backend wakeup service:', error);
      }
    };

    initializeBackendWakeup();
  }, []);

  // Listen for custom events from the chatbot
  useEffect(() => {
    const handleTaskCreated = (event: Event) => {
      const newTask = (event as CustomEvent).detail;
      dispatch({ type: 'ADD_TASK', payload: newTask });
    };

    const handleTaskUpdated = (event: Event) => {
      const updatedTask = (event as CustomEvent).detail;
      dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
    };

    const handleTaskToggled = (event: Event) => {
      const toggledTask = (event as CustomEvent).detail;
      dispatch({ type: 'TOGGLE_TASK', payload: toggledTask });
    };

    const handleTaskDeleted = (event: Event) => {
      const { taskId } = (event as CustomEvent).detail;
      dispatch({ type: 'DELETE_TASK', payload: taskId });
    };

    window.addEventListener('taskCreated', handleTaskCreated);
    window.addEventListener('taskUpdated', handleTaskUpdated);
    window.addEventListener('taskToggled', handleTaskToggled);
    window.addEventListener('taskDeleted', handleTaskDeleted);

    return () => {
      window.removeEventListener('taskCreated', handleTaskCreated);
      window.removeEventListener('taskUpdated', handleTaskUpdated);
      window.removeEventListener('taskToggled', handleTaskToggled);
      window.removeEventListener('taskDeleted', handleTaskDeleted);
    };
  }, []);

  const addTask = (task: Task) => {
    dispatch({ type: 'ADD_TASK', payload: task });
  };

  const updateTask = (task: Task) => {
    dispatch({ type: 'UPDATE_TASK', payload: task });
  };

  const deleteTask = (taskId: string) => {
    dispatch({ type: 'DELETE_TASK', payload: taskId });
  };

  const toggleTask = (task: Task) => {
    dispatch({ type: 'TOGGLE_TASK', payload: task });
  };

  return (
    <TaskContext.Provider
      value={{
        ...state,
        refreshTasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};