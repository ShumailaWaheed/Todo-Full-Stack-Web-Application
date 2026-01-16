// frontend/app/dashboard/tasks/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../lib/auth/context';
import { apiService } from '../../../lib/api';
import { Task } from '../../../lib/types/task';
import { useToast } from '../../../components/ui/toast';
import {
  FaTerminal,
  FaFilter,
  FaSortAmountDownAlt as FaSortAmountDown,
  FaSearch,
  FaCheck,
  FaClock,
  FaExclamationTriangle as FaTriangleExclamation,
  FaCircle,
  FaPlus,
  FaTrash
} from 'react-icons/fa';
import { FaPen } from 'react-icons/fa6';
import AddTaskSection from '../../../components/dashboard/add-task-section';
import TaskForm from '../../../components/tasks/task-form';
import ConfirmationDialog from '../../../components/common/confirmation-dialog';

const TasksPage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskData, setEditTaskData] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const fetchTasks = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await apiService.getTasks(user.id);
      setTasks(res.tasks || []);
    } catch (err) {
      console.error('Task Hub Sync Error:', err);
      addToast({
        type: 'error',
        title: 'Sync Failed',
        message: 'Could not retrieve tasks. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const toggleTask = async (taskId: string, currentStatus: boolean) => {
    if (!user) return;
    try {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !currentStatus } : t));
      await apiService.toggleTaskCompletion(user.id, taskId, { completed: !currentStatus });

      addToast({
        type: 'success',
        title: currentStatus ? 'Task Unmarked' : 'Task Completed',
        message: currentStatus
          ? 'Task has been marked as active again.'
          : 'Task has been marked as completed successfully.'
      });
    } catch (err) {
      fetchTasks();
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Could not update task status. Please try again.'
      });
    }
  };

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
      // Optimistically remove the task from the UI for better UX
      setTasks(prev => prev.filter(t => t.id !== taskToDelete));

      // Attempt to delete from the server
      await apiService.deleteTask(user.id, taskToDelete);

      // Show success message
      addToast({
        type: 'success',
        title: 'Task Deleted',
        message: 'The task has been successfully deleted.'
      });
    } catch (err) {
      // If deletion fails, restore the task
      fetchTasks();
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

  const startEditingTask = (task: Task) => {
    setEditTaskData(task);
    setEditingTaskId(task.id);
  };

  const handleEditSubmit = async (updatedData: any) => {
    if (!user || !editingTaskId) return;

    try {
      // Update the task in the local state
      setTasks(prev => prev.map(t =>
        t.id === editingTaskId ? { ...t, ...updatedData } : t
      ));

      // Update the task via API
      await apiService.updateTask(user.id, editingTaskId, updatedData);

      // Reset editing state
      setEditingTaskId(null);
      setEditTaskData(null);

      // Success message is handled by the TaskForm component
    } catch (err) {
      console.error('Failed to update task:', err);
      fetchTasks(); // Reload tasks if update failed
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Could not update the task. Please try again.'
      });
    }
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditTaskData(null);
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchFilter = filter === 'all' ? true : filter === 'completed' ? t.completed : !t.completed;
      const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [tasks, filter, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-10 p-4 animate-in fade-in duration-1000">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        <div className="w-full">
           <div className="flex items-center gap-2 mb-2">
              <FaTerminal className="text-[#8b5cf6] text-xs" />
              <span className="text-[8px] sm:text-[10px] font-black text-white/40 uppercase tracking-[0.2em] sm:tracking-[0.4em]">TASK_MANAGEMENT</span>
           </div>
           <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase break-words">
             Tasks Overview
           </h1>
           <p className="text-white/20 text-[9px] sm:text-xs mt-1 font-bold uppercase tracking-wider sm:tracking-widest">Active Items: {tasks.length} Tasks</p>
        </div>

        <div className="w-full sm:w-auto flex items-center gap-3">
           <div className="bg-black/40 border border-white/5 px-3 sm:px-4 py-2 rounded-2xl flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-center">
              {[
                { id: 'all', label: 'All' },
                { id: 'active', label: 'Active' },
                { id: 'completed', label: 'Done' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setFilter(opt.id as any)}
                  className={`text-[8px] sm:text-[9px] font-black uppercase tracking-wider sm:tracking-widest transition-all flex-1 text-center min-w-[40px]`}
                >
                  <span className={filter === opt.id ? 'text-[#8b5cf6]' : 'text-white/20 hover:text-white/40'}>
                    {opt.label}
                  </span>
                </button>
              ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:gap-10">
        {/* Left Column: Quick Capture */}
        <div className="space-y-6 sm:space-y-8">
           <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#8b5cf6]/20 to-[#ec4899]/20 rounded-[1.8rem] sm:rounded-[2.2rem] blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
              <AddTaskSection />
           </div>

           <div className="p-5 sm:p-6 rounded-[1.8rem] sm:rounded-[2rem] border border-white/5 bg-black/20 backdrop-blur-md">
              <h4 className="text-[9px] sm:text-[10px] font-black text-white/40 uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-4 sm:mb-6">Data_Filter</h4>
              <div className="relative group">
                 <FaSearch className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-white/20 text-xs" />
                 <input
                  type="text"
                  placeholder="SEARCH VECTORS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/5 rounded-xl py-3 pl-9 sm:pl-10 pr-4 text-[9px] sm:text-[10px] font-black text-white placeholder:text-white/10 focus:border-[#8b5cf6]/40 focus:bg-white/[0.04] transition-all outline-none"
                 />
              </div>
           </div>
        </div>

        {/* Bottom Column: Tactical Grid - Moved below on mobile */}
        <div className="space-y-4">
           {loading ? (
             <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-20 sm:h-24 bg-white/5 animate-pulse rounded-[1.2rem] sm:rounded-[1.5rem]" />)}
             </div>
           ) : filteredTasks.length > 0 ? (
             <div className="overflow-hidden rounded-[1.8rem] sm:rounded-[2rem] border border-white/5">
               {/* Table Header - Hidden on mobile, shown on tablet and above */}
               <div className="bg-[#0a0a0f] border-b border-white/5 px-4 sm:px-6 py-3 sm:py-4 hidden sm:grid grid-cols-12 gap-3 sm:gap-4 text-[9px] sm:text-[10px] font-black text-white/40 uppercase tracking-wider sm:tracking-widest">
                 <div className="col-span-1">Status</div>
                 <div className="col-span-5">Task</div>
                 <div className="col-span-2">Priority</div>
                 <div className="col-span-2">Due Date</div>
                 <div className="col-span-2">Actions</div>
               </div>

               {/* Task List for Mobile - Stacked Layout */}
               <div className="sm:hidden divide-y divide-white/5">
                 {filteredTasks.map(task => {
                   const isEditing = editingTaskId === task.id;

                   if (isEditing && editTaskData) {
                     return (
                       <div
                         key={`${task.id}-edit`}
                         className="group relative bg-[#0a0a0f] border border-white/5 p-4 sm:p-6 transition-all duration-500 overflow-hidden"
                       >
                         <div className="mb-4 sm:mb-6">
                           <h3 className="text-base font-black text-white uppercase tracking-tighter mb-3 sm:mb-4">Edit Task</h3>
                         </div>
                         <TaskForm
                           initialData={editTaskData}
                           isEditing={true}
                           onSubmit={handleEditSubmit}
                           onCancel={cancelEditing}
                         />
                       </div>
                     );
                   }

                   return (
                     <div
                       key={task.id}
                       className={`group relative p-4 transition-all duration-500 overflow-hidden ${
                         task.completed ? 'bg-black/40 opacity-40 grayscale' : 'bg-[#0a0a0f] hover:bg-[#11111b] hover:border-[#8b5cf6]/30'
                       }`}
                     >
                       {/* Task Header - Mobile View */}
                       <div className="flex items-start justify-between mb-3">
                         <div className="flex items-start gap-3 flex-1 min-w-0">
                           <div
                             onClick={() => toggleTask(task.id, task.completed)}
                             className={`flex-shrink-0 w-7 h-7 rounded-xl border flex items-center justify-center cursor-pointer transition-all duration-500 mt-0.5 ${
                               task.completed ? 'bg-[#8b5cf6] border-[#8b5cf6] shadow-[0_0_15px_#8b5cf6]' : 'border-white/10 group-hover:border-[#8b5cf6]/50'
                             }`}
                           >
                             {task.completed && <FaCheck className="text-white text-xs" />}
                           </div>
                           <div className="flex-1 min-w-0">
                             <h3 className={`text-sm font-black tracking-tight uppercase break-words transition-all duration-500 ${
                               task.completed ? 'text-white/20 line-through' : 'text-white/80 group-hover:text-white'
                             }`}>
                               {task.title}
                             </h3>
                             {task.description && (
                               <p className="text-[9px] sm:text-[10px] text-white/40 mt-1 line-clamp-2">{task.description}</p>
                             )}
                           </div>
                         </div>
                         <div className="flex items-center gap-2 ml-3">
                           <button
                             onClick={() => startEditingTask(task)}
                             className="p-1.5 rounded-xl hover:bg-[#8b5cf6]/10 hover:text-[#8b5cf6] text-white/10 transition-all duration-500"
                           >
                             <FaPen className="text-xs sm:text-sm" />
                           </button>
                           <button
                             onClick={() => initiateDeleteTask(task.id)}
                             disabled={deletingTaskId === task.id}
                             className={`p-1.5 rounded-xl transition-all duration-500 ${
                               deletingTaskId === task.id
                                 ? 'opacity-50 cursor-not-allowed'
                                 : 'hover:bg-[#ef4444]/10 hover:text-[#ef4444] text-white/10'
                             }`}
                           >
                             {deletingTaskId === task.id ? (
                               <div className="w-3 h-3 sm:w-4 sm:h-4 border-t-2 border-[#ef4444] rounded-full animate-spin"></div>
                             ) : (
                               <FaTrash className="text-xs sm:text-sm" />
                             )}
                           </button>
                         </div>
                       </div>

                       {/* Task Details - Mobile View */}
                       <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-white/40 ml-10">
                         <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#10b981' }} />
                           <span>{task.priority || 'standard'}</span>
                         </div>
                         <span>
                           {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'None'}
                         </span>
                       </div>

                       {/* Status side mark */}
                       <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-500 ${
                         task.completed ? 'bg-white/5' : 'bg-[#8b5cf6] opacity-0 group-hover:opacity-100 shadow-[0_0_20px_#8b5cf6]'
                       }`} />
                     </div>
                   );
                 })}
               </div>

               {/* Tablet/Desktop View */}
               <div className="hidden sm:divide-y sm:divide-white/5">
                 {filteredTasks.map(task => {
                   const isEditing = editingTaskId === task.id;

                   if (isEditing && editTaskData) {
                     return (
                       <div
                         key={`${task.id}-edit`}
                         className="group relative bg-[#0a0a0f] border border-white/5 p-6 transition-all duration-500 overflow-hidden"
                       >
                         <div className="mb-6">
                           <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-4">Edit Task</h3>
                         </div>
                         <TaskForm
                           initialData={editTaskData}
                           isEditing={true}
                           onSubmit={handleEditSubmit}
                           onCancel={cancelEditing}
                         />
                       </div>
                     );
                   }

                   return (
                     <div
                       key={task.id}
                       className={`group relative grid grid-cols-1 md:grid-cols-12 gap-4 p-6 transition-all duration-500 overflow-hidden ${
                         task.completed ? 'bg-black/40 opacity-40 grayscale' : 'bg-[#0a0a0f] hover:bg-[#11111b] hover:border-[#8b5cf6]/30 hover:-translate-y-1'
                       }`}
                     >
                       {/* Status (Checkbox) - Hidden on mobile */}
                       <div className="md:col-span-1 flex items-center justify-start md:justify-center">
                         <div
                           onClick={() => toggleTask(task.id, task.completed)}
                           className={`w-8 h-8 rounded-xl border flex items-center justify-center cursor-pointer transition-all duration-500 ${
                             task.completed ? 'bg-[#8b5cf6] border-[#8b5cf6] shadow-[0_0_15px_#8b5cf6]' : 'border-white/10 group-hover:border-[#8b5cf6]/50'
                           }`}
                         >
                           {task.completed && <FaCheck className="text-white text-xs" />}
                         </div>
                       </div>

                       {/* Task Title */}
                       <div className="col-span-12 md:col-span-5 flex items-center">
                         <div className="md:hidden mr-4">
                           <div
                             onClick={() => toggleTask(task.id, task.completed)}
                             className={`w-8 h-8 rounded-xl border flex items-center justify-center cursor-pointer transition-all duration-500 ${
                               task.completed ? 'bg-[#8b5cf6] border-[#8b5cf6] shadow-[0_0_15px_#8b5cf6]' : 'border-white/10 group-hover:border-[#8b5cf6]/50'
                             }`}
                           >
                             {task.completed && <FaCheck className="text-white text-xs" />}
                           </div>
                         </div>
                         <div className="flex-1 min-w-0">
                           <h3 className={`text-sm font-black tracking-tight uppercase truncate transition-all duration-500 ${
                             task.completed ? 'text-white/20 line-through' : 'text-white/80 group-hover:text-white'
                           }`}>
                             {task.title}
                           </h3>
                           {task.description && (
                             <p className="text-[10px] text-white/40 mt-1 line-clamp-2">{task.description}</p>
                           )}
                         </div>
                       </div>

                       {/* Priority */}
                       <div className="col-span-12 md:col-span-2 flex items-center">
                         <span className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#10b981' }} />
                           <span className="hidden md:inline">{task.priority || 'standard'}</span>
                           <span className="md:hidden text-[10px]">{task.priority || 'standard'}</span>
                         </span>
                       </div>

                       {/* Due Date */}
                       <div className="col-span-12 md:col-span-2 flex items-center">
                         <span className="text-[10px] font-bold text-white/40">
                           {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'None'}
                         </span>
                       </div>

                       {/* Actions */}
                       <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-2">
                         <button
                           onClick={() => startEditingTask(task)}
                           className="opacity-0 md:opacity-100 group-hover:opacity-100 p-2 rounded-xl hover:bg-[#8b5cf6]/10 hover:text-[#8b5cf6] text-white/10 transition-all duration-500"
                         >
                           <FaPen className="text-sm" />
                         </button>
                         <button
                           onClick={() => initiateDeleteTask(task.id)}
                           disabled={deletingTaskId === task.id}
                           className={`opacity-0 md:opacity-100 group-hover:opacity-100 p-2 rounded-xl transition-all duration-500 ${
                             deletingTaskId === task.id
                               ? 'opacity-50 cursor-not-allowed'
                               : 'hover:bg-[#ef4444]/10 hover:text-[#ef4444] text-white/10'
                           }`}
                         >
                           {deletingTaskId === task.id ? (
                             <div className="w-4 h-4 border-t-2 border-[#ef4444] rounded-full animate-spin"></div>
                           ) : (
                             <FaTrash className="text-sm" />
                           )}
                         </button>
                       </div>

                       {/* Status side mark */}
                       <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-500 ${
                         task.completed ? 'bg-white/5' : 'bg-[#8b5cf6] opacity-0 group-hover:opacity-100 shadow-[0_0_20px_#8b5cf6]'
                       }`} />
                     </div>
                   );
                 })}
               </div>
             </div>
           ) : (
             <div className="py-12 sm:py-20 text-center border-2 border-dashed border-white/5 rounded-[2.5rem] sm:rounded-[3rem]">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 sm:mb-6 text-white/10">
                   <FaTriangleExclamation className="text-xl sm:text-2xl" />
                </div>
                <h3 className="text-lg font-black text-white/40 uppercase tracking-tighter">No tasks in your list</h3>
                <p className="text-[9px] sm:text-[10px] font-bold text-white/10 uppercase tracking-wider sm:tracking-widest mt-2">Adjust filters or create a new task</p>
             </div>
           )}
        </div>
      </div>

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
  );
};

export default TasksPage;
