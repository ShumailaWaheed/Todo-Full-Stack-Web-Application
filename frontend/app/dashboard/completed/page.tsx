// frontend/app/dashboard/completed/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth/context';
import { apiService } from '../../../lib/api';
import { Task } from '../../../lib/types';
import { useToast } from '../../../components/ui/toast';
import { FaCheckCircle, FaFilter, FaSearch, FaCalendarAlt, FaTrash, FaFlag } from 'react-icons/fa';
import ConfirmationDialog from '../../../components/common/confirmation-dialog';

const CompletedTasksPage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await apiService.getTasks(user.id, true); // completed = true
      setTasks(response.tasks);
    } catch (err) {
      console.error('Failed to load completed tasks:', err);
      addToast({
        type: 'error',
        title: 'Load Failed',
        message: 'Could not retrieve completed tasks. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    if (!user) return;

    try {
      const updatedTask = await apiService.toggleTaskCompletion(user.id, task.id, {
        completed: false // Setting to false to move back to pending
      });
      // Remove from completed tasks list
      setTasks(prevTasks => prevTasks.filter(t => t.id !== task.id));

      addToast({
        type: 'success',
        title: 'Task Reactivated',
        message: 'The task has been moved back to your active tasks list.'
      });
    } catch (err) {
      console.error('Failed to toggle task completion:', err);
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Could not reactivate the task. Please try again.'
      });
    }
  };

  const handleUpdateTask = async (taskId: string, taskData: any) => {
    if (!user) return;

    try {
      const updatedTask = await apiService.updateTask(user.id, taskId, taskData);
      setTasks(tasks.map(task => task.id === taskId ? updatedTask : task));

      addToast({
        type: 'success',
        title: 'Task Updated',
        message: 'The task has been successfully updated.'
      });
    } catch (err) {
      console.error('Failed to update task:', err);
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Could not update the task. Please try again.'
      });
    }
  };

  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const initiateDeleteTask = (taskId: string) => {
    if (!user) return;
    setTaskToDelete(taskId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteTask = async () => {
    if (!user || !taskToDelete) return;

    setDeletingTaskId(taskToDelete); // Set the task currently being deleted
    setShowDeleteConfirm(false); // Close the confirmation dialog

    try {
      await apiService.deleteTask(user.id, taskToDelete);
      setTasks(tasks.filter(task => task.id !== taskToDelete));

      addToast({
        type: 'success',
        title: 'Task Deleted',
        message: 'The task has been successfully deleted.'
      });
    } catch (err) {
      console.error('Failed to delete task:', err);
      addToast({
        type: 'error',
        title: 'Deletion Failed',
        message: 'Could not delete the task. Please try again.'
      });
    } finally {
      setDeletingTaskId(null); // Reset the deleting state
      setTaskToDelete(null); // Clear the task to delete
    }
  };

  const cancelDeleteTask = () => {
    setShowDeleteConfirm(false);
    setTaskToDelete(null);
  };

  // Filter tasks based on search and priority
  const filteredTasks = tasks.filter(task => {
    const searchMatch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const priorityMatch = priorityFilter === 'all' || task.priority === priorityFilter;

    return searchMatch && priorityMatch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-400">Loading completed tasks...</p>
      </div>
    );
  }

  return (
    <div className="p-6 animate-in fade-in duration-1000">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#8b5cf6]/20 border border-[#8b5cf6]/30 flex items-center justify-center">
            <FaCheckCircle className="text-[#8b5cf6] text-sm" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Accomplished Operations</h1>
            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Successfully executed mission parameters</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#0a0a0f] border border-white/5 rounded-[2rem] p-6 backdrop-blur-sm mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search completed operations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder:text-white/10 focus:border-[#8b5cf6]/50 focus:bg-white/[0.06] transition-all outline-none"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
          </div>

          <div className="flex items-center space-x-2">
            <FaFilter className="text-white/40" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="rounded-xl bg-white/[0.03] border border-white/10 text-white focus:border-[#8b5cf6]/50 focus:bg-white/[0.06] transition-all outline-none px-4 py-3"
            >
              <option value="all">All Priority Levels</option>
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-[#0a0a0f] border border-white/5 rounded-[2rem] p-6 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Operational Archive</h2>
          <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{filteredTasks.length} completed operations</span>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white/[0.03] rounded-2xl p-8 border border-white/5">
              <div className="w-12 h-12 rounded-full bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 flex items-center justify-center mx-auto mb-4">
                <FaCheckCircle className="text-[#8b5cf6] text-lg" />
              </div>
              <h3 className="text-lg font-black text-white mb-2 uppercase tracking-tighter">No Operations Recorded</h3>
              <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Execute tasks to populate your achievement matrix</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white/[0.03] hover:bg-white/[0.06] rounded-2xl p-5 border border-white/5 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleComplete(task)}
                      className="h-5 w-5 rounded border-white/20 bg-white/[0.03] text-[#8b5cf6] focus:ring-[#8b5cf6]/50 focus:ring-2"
                    />
                    <div className="ml-4">
                      <h3 className="text-base font-bold text-white line-through group-hover:text-[#8b5cf6] transition-colors">{task.title}</h3>
                      {task.description && (
                        <p className="text-[10px] font-medium text-white/60 mt-1 line-through">{task.description}</p>
                      )}
                      <div className="flex items-center mt-3 space-x-4">
                        {task.due_date && (
                          <span className="inline-flex items-center text-[9px] font-bold text-white/40 uppercase tracking-wider">
                            <FaCalendarAlt className="mr-1 text-[8px]" />
                            {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-wider ${
                          task.priority === 'high'
                            ? 'bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30'
                            : task.priority === 'medium'
                              ? 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30'
                              : 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30'
                        }`}>
                          <FaFlag className="mr-1" />
                          {task.priority ? task.priority.toUpperCase() : 'MEDIUM'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className="px-4 py-2 bg-white/[0.05] text-[9px] font-black text-white/60 hover:text-white rounded-xl border border-white/10 uppercase tracking-widest transition-all"
                    >
                      Reactivate
                    </button>
                    <button
                      onClick={() => initiateDeleteTask(task.id)}
                      disabled={deletingTaskId === task.id}
                      className={`p-2 rounded-xl transition-colors duration-200 border ${
                        deletingTaskId === task.id
                          ? 'text-[#ef4444]/50 opacity-50 cursor-not-allowed'
                          : 'text-[#ef4444]/60 hover:text-[#ef4444] hover:bg-[#ef4444]/10 border-[#ef4444]/10'
                      }`}
                    >
                      {deletingTaskId === task.id ? (
                        <div className="w-3 h-3 border-t-2 border-[#ef4444] rounded-full animate-spin"></div>
                      ) : (
                        <FaTrash className="text-[10px]" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex justify-between text-[8px] font-bold text-white/30 uppercase tracking-wider">
                  <span>INITIATED: {new Date(task.created_at).toLocaleDateString()}</span>
                  <span>COMPLETED: {new Date(task.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Confirm Deletion"
        message="Are you sure you want to permanently delete this task? This action cannot be undone."
        onConfirm={confirmDeleteTask}
        onCancel={cancelDeleteTask}
        confirmText="Delete Task"
        cancelText="Cancel"
      />
    </div>
  </div>
);
};

export default CompletedTasksPage;