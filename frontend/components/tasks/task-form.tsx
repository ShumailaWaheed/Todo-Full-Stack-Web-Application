// frontend/components/tasks/task-form.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { TaskCreate, TaskUpdate } from '../../lib/types';
import { useToast } from '../../components/ui/toast';
import {
  FaTimes,
  FaCheck,
  FaArrowRight,
  FaSpinner,
  FaFlag,
  FaCalendar,
  FaAlignLeft,
  FaBolt
} from 'react-icons/fa6';

interface TaskFormProps {
  initialData?: TaskUpdate;
  isEditing?: boolean;
  onSubmit: (taskData: TaskCreate | TaskUpdate) => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({
  initialData,
  isEditing = false,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const { addToast } = useToast();
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [dueDate, setDueDate] = useState(initialData?.due_date || '');
  const [priority, setPriority] = useState(initialData?.priority || 'medium');
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [charCount, setCharCount] = useState(0);
  const [readyToSubmit, setReadyToSubmit] = useState(false);

  useEffect(() => {
    setCharCount(title.length);
  }, [title]);

  const validateForm = () => {
    if (!title.trim()) {
      setError('Task title is required. Please enter a title for your task.');
      return false;
    }

    if (title.length > 200) {
      setError('Task title exceeds the maximum length of 200 characters. Please shorten your title.');
      return false;
    }

    if (description && description.length > 2000) {
      setError('Task description exceeds the maximum length of 2000 characters. Please shorten your description.');
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Only allow submission when explicitly triggered by submit button click
    if (!readyToSubmit) {
      console.log("Form submission blocked - not ready to submit");
      return;
    }

    if (!validateForm()) {
      // Reset the ready flag if validation fails
      setReadyToSubmit(false);
      return;
    }

    const taskData: TaskCreate | TaskUpdate = {
      title: title.trim(),
      description: description.trim() || undefined,
      due_date: dueDate,
      priority
    };

    // Call onSubmit with a wrapper that handles success notifications
    const submitPromise = onSubmit(taskData);

    if (submitPromise instanceof Promise) {
      submitPromise
        .then(() => {
          if (isEditing) {
            addToast({
              type: 'success',
              title: 'Task Updated',
              message: 'Your task has been successfully updated.'
            });
          } else {
            addToast({
              type: 'success',
              title: 'Task Created',
              message: 'Your task has been successfully created.'
            });
          }
        })
        .catch((error) => {
          addToast({
            type: 'error',
            title: 'Operation Failed',
            message: isEditing ? 'Failed to update task. Please try again.' : 'Failed to create task. Please try again.'
          });
        });
    } else {
      // If it's not a promise, handle the synchronous case
      if (isEditing) {
        addToast({
          type: 'success',
          title: 'Task Updated',
          message: 'Your task has been successfully updated.'
        });
      } else {
        addToast({
          type: 'success',
          title: 'Task Created',
          message: 'Your task has been successfully created.'
        });
      }
    }

    // Reset the ready flag after submission
    setReadyToSubmit(false);
  };

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'text-[#10b981]', bg: 'bg-[#10b981]/10 border-[#10b981]/20' },
    { value: 'medium', label: 'Medium', color: 'text-[#f59e0b]', bg: 'bg-[#f59e0b]/10 border-[#f59e0b]/20' },
    { value: 'high', label: 'High', color: 'text-[#ef4444]', bg: 'bg-[#ef4444]/10 border-[#ef4444]/20' }
  ];

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-500 ${
              i <= step ? 'flex-1 bg-[#8b5cf6] shadow-[0_0_10px_#8b5cf6]' : 'w-8 bg-white/10'
            }`}
          />
        ))}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-[10px] font-bold uppercase tracking-widest text-center animate-in shake">
          {error}
        </div>
      )}

      {/* Step 1: Task Name */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
              <FaBolt className="text-[#8b5cf6] text-[10px]" />
              Task Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                // Clear error when user starts typing
                if (error && e.target.value.trim()) {
                  setError(null);
                }
              }}
              onKeyDown={(e) => {
                // Prevent form submission when Enter is pressed in the title field
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-[11px] font-bold text-white placeholder:text-white/10 focus:border-[#8b5cf6]/50 focus:bg-white/[0.06] transition-all outline-none"
              placeholder="ENTER TASK TITLE"
              maxLength={200}
              autoFocus
            />
            <div className="flex justify-between items-center px-1">
              <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">
                {charCount}/200 characters
              </span>
              <span className={`text-[8px] font-bold uppercase tracking-widest transition-colors ${
                charCount > 180 ? 'text-[#ef4444]' : 'text-white/20'
              }`}>
                {200 - charCount} remaining
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
              <FaAlignLeft className="text-[#8b5cf6] text-[10px]" />
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                // Clear error when user starts typing (if it was related to description length)
                if (error && e.target.value.length <= 2000) {
                  setError(null);
                }
              }}
              onKeyDown={(e) => {
                // Prevent form submission when Enter is pressed in the description field
                if (e.key === 'Enter' && !e.shiftKey) { // Allow Shift+Enter for new lines
                  e.preventDefault();
                }
              }}
              rows={3}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-[11px] font-medium text-white placeholder:text-white/10 focus:border-[#8b5cf6]/50 focus:bg-white/[0.06] transition-all outline-none resize-none"
              placeholder="Describe your task in more detail..."
            />
          </div>
        </div>
      )}

      {/* Step 2: Due Date */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
              <FaCalendar className="text-[#8b5cf6] text-[10px]" />
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                // Clear error when user makes a change
                if (error) {
                  setError(null);
                }
              }}
              onKeyDown={(e) => {
                // Prevent form submission when Enter is pressed in the date field
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-[11px] font-bold text-white focus:border-[#8b5cf6]/50 focus:bg-white/[0.06] transition-all outline-none"
            />
            <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest ml-1">
              Set deadline for task completion
            </p>
          </div>
        </div>
      )}

      {/* Step 3: Priority */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <label className="text-[9px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
            <FaFlag className="text-[#8b5cf6] text-[10px]" />
            Priority Level
          </label>
          <div className="grid grid-cols-3 gap-4">
            {priorityOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPriority(opt.value as any)}
                className={`p-4 rounded-2xl border transition-all duration-500 ${
                  priority === opt.value
                    ? `${opt.bg} border-current`
                    : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                }`}
              >
                <div className={`text-center ${opt.color}`}>
                  <FaFlag className="text-sm mx-auto mb-2" />
                  <span className="text-[9px] font-black uppercase tracking-widest">{opt.label}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Summary */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
            <h4 className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-3">Task Summary</h4>
            <div className="space-y-2 text-[10px]">
              <div className="flex justify-between">
                <span className="text-white/40">Task:</span>
                <span className="text-white font-medium truncate max-w-[200px]">{title || 'Untitled'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Due:</span>
                <span className="text-white font-medium">{dueDate || 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Priority:</span>
                <span className={`font-bold uppercase ${
                  priority === 'high' ? 'text-[#ef4444]' :
                  priority === 'medium' ? 'text-[#f59e0b]' : 'text-[#10b981]'
                }`}>
                  {priorityOptions.find(p => p.value === priority)?.label}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Actions */}
      <div className="flex items-center justify-between pt-8 mt-8 border-t border-white/5">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="text-[9px] font-black text-white/30 hover:text-white uppercase tracking-widest transition-colors"
          >
            Back
          </button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={() => {
              // Validate current step before proceeding
              if (step === 1 && !title.trim()) {
                setError('Task title is required. Please enter a title for your task.');
                return;
              }
              setStep(step + 1);
            }}
            disabled={step === 1 && !title.trim()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 text-[#8b5cf6] text-[9px] font-black uppercase tracking-widest hover:bg-[#8b5cf6]/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Continue <FaArrowRight className="text-[10px]" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading}
            onClick={() => setReadyToSubmit(true)}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#8b5cf6]/80 text-white text-[9px] font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all disabled:opacity-50"
          >
            {loading ? (
              <FaSpinner className="text-sm animate-spin" />
            ) : (
              <>
                {isEditing ? 'Update Task' : 'Create Task'} <FaCheck className="text-[10px]" />
              </>
            )}
          </button>
        )}
      </div>
    </form>
  );
};

export default TaskForm;
