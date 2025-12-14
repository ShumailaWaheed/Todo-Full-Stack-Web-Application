// frontend/app/dashboard/tasks/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth/context';
import { apiService } from '../../../lib/api';
import { Task, TaskCreate, TaskUpdate } from '../../../lib/types';
import TaskForm from '../../../components/tasks/task-form';
import TaskList from '../../../components/tasks/task-list';
import TaskDetail from '../../../components/tasks/task-detail';
import TaskEditForm from '../../../components/tasks/task-edit-form';
import TaskDeleteConfirmation from '../../../components/tasks/task-delete-confirmation';
import Notification from '../../../components/ui/notification';

const TasksPage: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load tasks on component mount
  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await apiService.getTasks(user.id);
      setTasks(response.tasks);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      showNotification('Failed to load tasks. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData: TaskCreate) => {
    if (!user) return;

    try {
      const newTask = await apiService.createTask(user.id, taskData);
      setTasks([...tasks, newTask]);
      setShowForm(false);
      showNotification('Task created successfully!', 'success');
    } catch (err) {
      console.error('Failed to create task:', err);
      showNotification('Failed to create task. Please try again.', 'error');
    }
  };

  const handleUpdateTask = async (taskId: string, taskData: TaskUpdate) => {
    if (!user) return;

    try {
      const updatedTask = await apiService.updateTask(user.id, taskId, taskData);
      setTasks(tasks.map(task => task.id === taskId ? updatedTask : task));
      setEditingTask(null);
      showNotification('Task updated successfully!', 'success');
    } catch (err) {
      console.error('Failed to update task:', err);
      showNotification('Failed to update task. Please try again.', 'error');
    }
  };

  const handleToggleComplete = async (task: Task) => {
    if (!user) return;

    // Optimistic update: immediately update UI
    const updatedTasks = tasks.map(t =>
      t.id === task.id ? { ...t, completed: !t.completed } : t
    );
    setTasks(updatedTasks);

    try {
      const updatedTask = await apiService.toggleTaskCompletion(user.id, task.id, {
        completed: !task.completed
      });
      // Update with server response to ensure consistency
      setTasks(tasks.map(t => t.id === task.id ? updatedTask : t));
      showNotification(`Task marked as ${updatedTask.completed ? 'complete' : 'incomplete'}`, 'success');
    } catch (err) {
      // Revert optimistic update on error
      setTasks(tasks);
      console.error('Failed to toggle task completion:', err);
      showNotification('Failed to update task status. Please try again.', 'error');
    }
  };

  const handleDeleteTask = async () => {
    if (!user || !taskToDelete) return;

    setDeleteLoading(true);

    // Optimistic update: immediately remove task from UI
    const updatedTasks = tasks.filter(task => task.id !== taskToDelete.id);
    setTasks(updatedTasks);

    try {
      await apiService.deleteTask(user.id, taskToDelete.id);
      setTaskToDelete(null);
      showNotification('Task deleted successfully!', 'success');
    } catch (err) {
      // Revert optimistic update on error
      setTasks([...tasks]); // Restore original tasks
      console.error('Failed to delete task:', err);
      showNotification('Failed to delete task. Please try again.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setNotification({ message, type });
    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const dismissNotification = () => {
    setNotification(null);
  };

  const startTaskCreation = () => {
    setEditingTask(null);
    setViewingTask(null);
    setShowForm(true);
  };

  const startTaskEdit = (task: Task) => {
    setEditingTask(task);
    setViewingTask(null);
    setShowForm(false);
  };

  const viewTaskDetail = (task: Task) => {
    setViewingTask(task);
    setEditingTask(null);
    setShowForm(false);
  };

  const cancelEdit = () => {
    setEditingTask(null);
  };

  const cancelView = () => {
    setViewingTask(null);
  };

  const confirmDelete = (task: Task) => {
    setTaskToDelete(task);
  };

  const cancelDelete = () => {
    setTaskToDelete(null);
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-lg">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="lg:text-center mb-8">
        <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Tasks</h2>
        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Welcome, {user?.email}!
        </p>
      </div>

      {notification && (
        <div className="mb-4">
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={dismissNotification}
          />
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Your Tasks</h3>
        <button
          onClick={startTaskCreation}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Task
        </button>
      </div>

      {/* Task Creation Form */}
      {showForm && (
        <div className="mb-8">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Create New Task
              </h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <TaskForm
                onSubmit={handleCreateTask}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Task Editing Form */}
      {editingTask && (
        <div className="mb-8">
          <TaskEditForm
            task={editingTask}
            onSubmit={handleUpdateTask}
            onCancel={cancelEdit}
          />
        </div>
      )}

      {/* Task Detail View */}
      {viewingTask && (
        <div className="mb-8">
          <TaskDetail
            task={viewingTask}
            onToggleComplete={handleToggleComplete}
            onEdit={startTaskEdit}
            onDelete={confirmDelete}
            onBack={cancelView}
          />
        </div>
      )}

      {/* Task List */}
      <div>
        <TaskList
          tasks={tasks}
          onToggleComplete={handleToggleComplete}
          onEdit={startTaskEdit}
          onDelete={confirmDelete}
          loading={loading}
        />
      </div>

      {/* Delete Confirmation Modal */}
      {taskToDelete && (
        <TaskDeleteConfirmation
          taskTitle={taskToDelete.title}
          onConfirm={handleDeleteTask}
          onCancel={cancelDelete}
          loading={deleteLoading}
        />
      )}
    </div>
  );
};

export default TasksPage;