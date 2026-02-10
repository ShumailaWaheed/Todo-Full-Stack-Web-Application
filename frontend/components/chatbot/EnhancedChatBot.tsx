'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useAuth } from '../../lib/auth/context';
import {
  FaRobot,
  FaTimes,
  FaPaperPlane,
  FaChevronDown,
  FaChevronUp,
  FaListUl,
  FaPlus,
  FaEdit,
  FaCheck,
  FaTrash,
  FaCalendar,
  FaFlag
} from 'react-icons/fa';
import { formatTaskForEvent } from '../../lib/utils/task-utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  action?: 'create_task' | 'view_tasks' | null;
}

interface ToolCall {
  name: string;
  args: Record<string, unknown>;
  result?: unknown;
}

interface ChatResponse {
  response: string;
  success: boolean;
  conversation_id?: string;
  error?: string | null;
  tool_calls?: ToolCall[];
}

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  user_id: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
  status?: 'pending' | 'completed';
}

// Task Management Service to connect to Phase II backend
class TaskService {
  private userId: number;
  private baseUrl: string;

  constructor(userId: number, apiUrl: string) {
    this.userId = userId;
    this.baseUrl = apiUrl;
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const accessToken = this.getAuthToken();
    if (accessToken) {
      (headers as any)['Authorization'] = `Bearer ${accessToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      return response.json() as Promise<T>;
    } catch (error) {
      console.error(`Network error for request to ${url}:`, error);

      const isNetworkOrCorsError = error instanceof TypeError ||
          (error instanceof Error &&
           (error.message.includes('fetch') ||
            error.message.includes('network') ||
            error.message.includes('load') ||
            error.message.includes('resource') ||
            error.message.includes('CORS') ||
            error.message.includes('cross-origin')));

      if (isNetworkOrCorsError) {
        try {
          const { backendWakeupService } = await import('../../lib/api/backend-wakeup');
          await backendWakeupService.ensureBackendAwake();

          const retryResponse = await fetch(url, config);

          if (!retryResponse.ok) {
            throw new Error(`API request failed: ${retryResponse.statusText}`);
          }

          return retryResponse.json() as Promise<T>;
        } catch (retryError) {
          console.error('Retry after backend wakeup also failed:', retryError);
          throw error;
        }
      } else {
        throw error;
      }
    }
  }

  async getTasks(): Promise<Task[]> {
    try {
      const response = await this.request<any>(`/api/${this.userId}/?limit=50&offset=0`, { method: 'GET' });

      const tasksArray = Array.isArray(response) ? response : (response.tasks || []);

      const formatTaskForEvent = (t: any) => ({
        id: String(t.id),
        title: t.title || '',
        description: t.description || '',
        completed: Boolean(t.completed),
        user_id: String(t.user_id),
        due_date: t.due_date || null,
        priority: t.priority || 'medium',
        created_at: t.created_at || new Date().toISOString(),
        updated_at: t.updated_at || new Date().toISOString(),

      });

      return tasksArray.map((task: any) => formatTaskForEvent(task));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  async createTask(title: string, description?: string, priority: 'low' | 'medium' | 'high' = 'medium', due_date?: string): Promise<Task> {
    try {
      const response = await this.request<any>(`/api/${this.userId}/`, {
        method: 'POST',
        body: JSON.stringify({
          title,
          description: description || '',
          priority,
          due_date: due_date || null,
        }),
      });

      const task = {
        id: String(response.id),
        title: response.title,
        description: response.description,
        completed: response.completed || false,

        user_id: String(response.user_id),
        due_date: response.due_date,
        priority: response.priority as 'low' | 'medium' | 'high',
        created_at: response.created_at,
        updated_at: response.updated_at,
      };

      const formatTaskForEvent = (t: any) => ({
        id: String(t.id),
        title: t.title || '',
        description: t.description || '',
        completed: Boolean(t.completed),
        user_id: String(t.user_id),
        due_date: t.due_date || null,
        priority: t.priority || 'medium',
        created_at: t.created_at || new Date().toISOString(),
        updated_at: t.updated_at || new Date().toISOString(),

      });

      return formatTaskForEvent(task);
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async updateTask(taskId: number | string, updates: Partial<Task>): Promise<Task> {
    try {
      const response = await this.request<any>(`/api/${this.userId}/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      const task = {
        id: String(response.id),
        title: response.title,
        description: response.description,
        completed: response.completed || false,

        user_id: String(response.user_id),
        due_date: response.due_date,
        priority: response.priority as 'low' | 'medium' | 'high',
        created_at: response.created_at,
        updated_at: response.updated_at,
      };

      const formatTaskForEvent = (t: any) => ({
        id: String(t.id),
        title: t.title || '',
        description: t.description || '',
        completed: Boolean(t.completed),
        user_id: String(t.user_id),
        due_date: t.due_date || null,
        priority: t.priority || 'medium',
        created_at: t.created_at || new Date().toISOString(),
        updated_at: t.updated_at || new Date().toISOString(),

      });

      return formatTaskForEvent(task);
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  async toggleTaskCompletion(taskId: number | string, completed: boolean = true): Promise<Task> {
    try {
      const response = await this.request<any>(`/api/${this.userId}/${taskId}/complete`, {
        method: 'PATCH',
        body: JSON.stringify({ completed }),
      });

      const task = {
        id: String(response.id),
        title: response.title,
        description: response.description,
        completed: response.completed || false,

        user_id: String(response.user_id),
        due_date: response.due_date,
        priority: response.priority as 'low' | 'medium' | 'high',
        created_at: response.created_at,
        updated_at: response.updated_at,
      };

      const formatTaskForEvent = (t: any) => ({
        id: String(t.id),
        title: t.title || '',
        description: t.description || '',
        completed: Boolean(t.completed),
        user_id: String(t.user_id),
        due_date: t.due_date || null,
        priority: t.priority || 'medium',
        created_at: t.created_at || new Date().toISOString(),
        updated_at: t.updated_at || new Date().toISOString(),

      });

      return formatTaskForEvent(task);
    } catch (error) {
      console.error('Error toggling task completion:', error);
      throw error;
    }
  }

  async deleteTask(taskId: number | string): Promise<boolean> {
    try {
      await this.request<void>(`/api/${this.userId}/${taskId}`, { method: 'DELETE' });
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }
}

// Task Manager Component
const TaskManager = ({ userId }: { userId: number }) => {
  const formatTaskForEvent = (t: any) => ({
    id: String(t.id),
    title: t.title || '',
    description: t.description || '',
    completed: Boolean(t.completed),
    user_id: String(t.user_id),
    due_date: t.due_date || null,
    priority: t.priority || 'medium',
    created_at: t.created_at || new Date().toISOString(),
    updated_at: t.updated_at || new Date().toISOString(),
    status: t.completed ? 'completed' : 'pending',
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [addingTask, setAddingTask] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState<string>("");
  const [newTaskDescription, setNewTaskDescription] = useState<string>("");
  const [newTaskPriority, setNewTaskPriority] = useState<string>("medium");
  const [newTaskDueDate, setNewTaskDueDate] = useState<string>("");
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [editingTaskId, setEditingTaskId] = useState<string | number | null>(null);
  const [editingTaskData, setEditingTaskData] = useState({
    title: "",
    description: "",
    priority: "",
    due_date: "",
  });

  const taskApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const taskService = new TaskService(userId, taskApiUrl);

  useEffect(() => {
    loadTasks();
  }, [userId]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const tasksData = await taskService.getTasks();
      setTasks(tasksData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load tasks";
      console.error("Load tasks error:", err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTaskTitle.trim()) return;

    try {
      setAddingTask(true);
      setError(null);

      const newTask = await taskService.createTask(
        newTaskTitle,
        newTaskDescription,
        newTaskPriority as 'low' | 'medium' | 'high',
        newTaskDueDate ? newTaskDueDate : undefined
      );

      await loadTasks();

      const formattedTask = formatTaskForEvent(newTask);
      window.dispatchEvent(new CustomEvent('taskCreated', { detail: formattedTask }));

      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskPriority("medium");
      setNewTaskDueDate("");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create task";
      console.error("Create task error:", err);
      setError(errorMessage);
    } finally {
      setAddingTask(false);
    }
  };

  const handleToggleTask = async (taskId: string | number) => {
    try {
      setLoading(true);
      setError(null);

      const currentTask = tasks.find(task => task.id === taskId);
      if (currentTask) {
        const updatedTask = await taskService.toggleTaskCompletion(taskId, !currentTask.completed);
        const formattedTask = formatTaskForEvent(updatedTask);
        window.dispatchEvent(new CustomEvent('taskToggled', { detail: formattedTask }));
      } else {
        const updatedTask = await taskService.toggleTaskCompletion(taskId, true);
        const formattedTask = formatTaskForEvent(updatedTask);
        window.dispatchEvent(new CustomEvent('taskToggled', { detail: formattedTask }));
      }

      await loadTasks();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update task";
      console.error("Toggle task error:", err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string | number) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await taskService.deleteTask(taskId);
      window.dispatchEvent(new CustomEvent('taskDeleted', { detail: { taskId: String(taskId) } }));
      await loadTasks();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete task";
      console.error("Delete task error:", err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const startEditingTask = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTaskData({
      title: task.title,
      description: task.description || "",
      priority: task.priority || "medium",
      due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : "",
    });
  };

  const saveEditedTask = async (taskId: string | number) => {
    if (!taskId) return;

    try {
      setLoading(true);
      setError(null);

      const updatedTask = await taskService.updateTask(taskId, {
        ...editingTaskData,
        priority: editingTaskData.priority as 'low' | 'medium' | 'high' | undefined,
        due_date: editingTaskData.due_date ? editingTaskData.due_date : undefined,
      });

      const formattedTask = formatTaskForEvent(updatedTask);
      window.dispatchEvent(new CustomEvent('taskUpdated', { detail: formattedTask }));
      await loadTasks();
      setEditingTaskId(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update task";
      console.error("Update task error:", err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === "pending") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  return (
    <div className="task-manager bg-white/[0.03] backdrop-blur-md rounded-[2rem] border border-white/10 p-6 mt-6 shadow-[0_0_40px_-10px_rgba(139,92,246,0.1)]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black text-white uppercase tracking-tighter bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] bg-clip-text text-transparent">
          Task Control Center
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
              filter === "all"
                ? "bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                : "bg-white/[0.05] text-white/60 hover:text-white/80 border border-white/10"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
              filter === "pending"
                ? "bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] text-white shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                : "bg-white/[0.05] text-white/60 hover:text-white/80 border border-white/10"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
              filter === "completed"
                ? "bg-gradient-to-r from-[#22c55e] to-[#34d399] text-white shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                : "bg-white/[0.05] text-white/60 hover:text-white/80 border border-white/10"
            }`}
          >
            Done
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-[#dc2626]/20 border border-[#7f1d1d]/50 rounded-lg">
          <p className="text-[#fca5a5] text-sm">{error}</p>
        </div>
      )}

      {/* Add Task Form */}
      <form onSubmit={handleCreateTask} className="mb-6 p-4 bg-[#1e293b] rounded-xl border border-[#334155]/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          <div>
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Task title..."
              className="w-full px-4 py-2 border border-[#334155] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent bg-[#1e293b] text-[#f8fafc] placeholder-[#64748b]"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value)}
              className="col-span-1 px-3 py-2 border border-[#334155] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent bg-[#1e293b] text-[#f8fafc]"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </select>
            <input
              type="date"
              value={newTaskDueDate}
              onChange={(e) => setNewTaskDueDate(e.target.value)}
              className="col-span-1 px-3 py-2 border border-[#334155] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent bg-[#1e293b] text-[#f8fafc]"
            />
          </div>
        </div>
        <div className="mb-3">
          <textarea
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            placeholder="Task description (optional)..."
            className="w-full px-4 py-2 border border-[#334155] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent bg-[#1e293b] text-[#f8fafc] placeholder-[#64748b] resize-none"
            rows={2}
          />
        </div>
        <button
          type="submit"
          disabled={addingTask || !newTaskTitle.trim()}
          className="px-4 py-2 bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white rounded-lg hover:from-[#7c3aed] hover:to-[#db2777] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {addingTask ? "Adding..." : "Add Task"}
        </button>
      </form>

      {/* Tasks List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {loading && tasks.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#8b5cf6]"></div>
            <p className="mt-2 text-[#94a3b8]">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-[#94a3b8]">
            <p>No tasks found. Add a task above!</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-xl border ${
                task.completed
                  ? "bg-[#22c55e]/10 border-[#22c55e]/30"
                  : "bg-[#1e293b] border-[#334155]/50"
              }`}
            >
              {editingTaskId === task.id ? (
                // Edit mode
                <div>
                  <input
                    type="text"
                    value={editingTaskData.title}
                    onChange={(e) => setEditingTaskData({...editingTaskData, title: e.target.value})}
                    className="w-full mb-2 px-3 py-1 border border-[#334155] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent bg-[#1e293b] text-[#f8fafc]"
                  />
                  <textarea
                    value={editingTaskData.description}
                    onChange={(e) => setEditingTaskData({...editingTaskData, description: e.target.value})}
                    className="w-full mb-2 px-3 py-1 border border-[#334155] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent bg-[#1e293b] text-[#f8fafc] resize-none"
                    rows={2}
                  />
                  <div className="flex items-center gap-2 mb-3">
                    <select
                      value={editingTaskData.priority}
                      onChange={(e) => setEditingTaskData({...editingTaskData, priority: e.target.value})}
                      className="px-2 py-1 border border-[#334155] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent bg-[#1e293b] text-[#f8fafc] text-xs"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                    <input
                      type="date"
                      value={editingTaskData.due_date}
                      onChange={(e) => setEditingTaskData({...editingTaskData, due_date: e.target.value})}
                      className="px-2 py-1 border border-[#334155] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent bg-[#1e293b] text-[#f8fafc] text-xs"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => saveEditedTask(task.id)}
                      className="px-3 py-1 rounded text-xs bg-[#8b5cf6]/20 text-[#c4b5fd] hover:bg-[#8b5cf6]/30"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingTaskId(null)}
                      className="px-3 py-1 rounded text-xs bg-[#64748b]/20 text-[#94a3b8] hover:bg-[#64748b]/30"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // Display mode
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3
                      className={`font-medium ${
                        task.completed
                          ? "text-[#86efac] line-through"
                          : "text-[#e2e8f0]"
                      }`}
                    >
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-sm text-[#94a3b8] mt-1">{task.description}</p>
                    )}
                    <div className="flex items-center mt-2 space-x-3 text-xs text-[#94a3b8]">
                      {task.priority && (
                        <span className={`px-2 py-1 rounded flex items-center gap-1 ${
                          task.priority === 'low' ? 'bg-blue-500/20 text-blue-300' :
                          task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                          task.priority === 'high' ? 'bg-orange-500/20 text-orange-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          <FaFlag className="text-xs" />
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                      )}
                      {task.due_date && (
                        <span className="flex items-center gap-1">
                          <FaCalendar className="text-xs" />
                          {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEditingTask(task)}
                      className="px-3 py-1 rounded text-xs bg-[#64748b]/20 text-[#94a3b8] hover:bg-[#64748b]/30 flex items-center gap-1"
                      title="Edit task"
                    >
                      <FaEdit className="text-xs" />
                    </button>
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className={`px-3 py-1 rounded text-xs flex items-center gap-1 ${
                        task.completed
                          ? "bg-[#22c55e]/20 text-[#86efac] hover:bg-[#22c55e]/30"
                          : "bg-[#f59e0b]/20 text-[#fde68a] hover:bg-[#f59e0b]/30"
                      }`}
                      title={task.completed ? "Reopen task" : "Complete task"}
                    >
                      <FaCheck className="text-xs" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="px-3 py-1 rounded text-xs bg-[#dc2626]/20 text-[#fca5a5] hover:bg-[#dc2626]/30 flex items-center gap-1"
                      title="Delete task"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default function EnhancedChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showTaskManager, setShowTaskManager] = useState<boolean>(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuth();
  const userId = typeof user?.id === 'number' ? user.id : 1;

  const chatApiUrl = process.env.NEXT_PUBLIC_CHATBOT_API_URL || 'https://alishanaz029-todo-chatbot.hf.space';
  const taskApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isOpen, isMinimized]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const minimizeChat = () => {
    setIsMinimized(true);
  };

  const expandChat = () => {
    setIsMinimized(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !userId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const lowerInput = input.toLowerCase().trim();
      const taskService = new TaskService(typeof userId === 'number' ? userId : 1, taskApiUrl);

      if (lowerInput.includes('list') && (lowerInput.includes('task') || lowerInput.includes('show'))) {
        try {
          const tasks = await taskService.getTasks();
          let taskListResponse = "Here are your tasks:\n\n";

          if (tasks.length === 0) {
            taskListResponse = "You have no tasks at the moment.";
          } else {
            tasks.forEach((task, index) => {
              const status = task.completed ? 'completed' : 'pending';
              taskListResponse += `${index + 1}. ${task.title}\n   Status: ${status}\n   Priority: ${task.priority}\n   ${task.due_date ? `Due: ${new Date(task.due_date).toLocaleDateString()}\n` : ''}\n`;
            });
          }

          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: taskListResponse,
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, assistantMessage]);
          setIsLoading(false);
          return;
        } catch (taskError) {
          console.error("Error fetching tasks:", taskError);
        }
      } else if (lowerInput.includes('add') || lowerInput.includes('create') || lowerInput.includes('new task')) {
        try {
          let taskTitle = input.replace(/(add|create|make|new task to|task to)/gi, '').trim();
          if (!taskTitle) {
            taskTitle = "Untitled Task";
          }

          const newTask = await taskService.createTask(taskTitle);
          const formattedTask = formatTaskForEvent(newTask);

          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `I've created the task "${newTask.title}" for you. It has been added to your dashboard.`,
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, assistantMessage]);
          window.dispatchEvent(new CustomEvent('taskCreated', { detail: formattedTask }));

          setIsLoading(false);
          return;
        } catch (taskError) {
          console.error("Error creating task:", taskError);
        }
      } else if (lowerInput.includes('update') || lowerInput.includes('edit') || lowerInput.includes('change')) {
        try {
          const parts = input.split('to');
          if (parts.length >= 2) {
            const taskToUpdate = parts[0].replace(/(update|edit|change)/gi, '').trim();
            const updateValue = parts[1].trim();

            const allTasks = await taskService.getTasks();
            const taskToModify = allTasks.find(task =>
              task.title.toLowerCase().includes(taskToUpdate.toLowerCase())
            );

            if (taskToModify) {
              const updatedTask = await taskService.updateTask(taskToModify.id, {
                title: updateValue
              });

              const formattedTask = formatTaskForEvent(updatedTask);

              const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `I've updated the task "${taskToModify.title}" to "${updatedTask.title}". The dashboard has been updated.`,
                timestamp: new Date(),
              };

              setMessages((prev) => [...prev, assistantMessage]);
              window.dispatchEvent(new CustomEvent('taskUpdated', { detail: formattedTask }));

              setIsLoading(false);
              return;
            }
          }
        } catch (taskError) {
          console.error("Error updating task:", taskError);
        }
      } else if (lowerInput.includes('complete') || lowerInput.includes('done') || lowerInput.includes('finish')) {
        try {
          let taskToComplete = input.replace(/(complete|mark as done|finish)/gi, '').trim();

          const allTasks = await taskService.getTasks();
          const taskToToggle = allTasks.find(task =>
            task.title.toLowerCase().includes(taskToComplete.toLowerCase())
          );

          if (taskToToggle) {
            const updatedTask = await taskService.toggleTaskCompletion(taskToToggle.id, true);

            const formattedTask = formatTaskForEvent(updatedTask);

            const assistantMessage: Message = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: `I've marked the task "${taskToToggle.title}" as completed. The dashboard has been updated.`,
              timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
            window.dispatchEvent(new CustomEvent('taskToggled', { detail: formattedTask }));

            setIsLoading(false);
            return;
          }
        } catch (taskError) {
          console.error("Error completing task:", taskError);
        }
      } else if (lowerInput.includes('delete') || lowerInput.includes('remove') || lowerInput.includes('destroy')) {
        try {
          let taskToDelete = input.replace(/(delete|remove|destroy)/gi, '').trim();

          const allTasks = await taskService.getTasks();
          const taskToRemove = allTasks.find(task =>
            task.title.toLowerCase().includes(taskToDelete.toLowerCase())
          );

          if (taskToRemove) {
            await taskService.deleteTask(taskToRemove.id);

            const assistantMessage: Message = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: `I've deleted the task "${taskToRemove.title}". The dashboard has been updated.`,
              timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
            window.dispatchEvent(new CustomEvent('taskDeleted', { detail: { taskId: String(taskToRemove.id) } }));

            setIsLoading(false);
            return;
          }
        } catch (taskError) {
          console.error("Error deleting task:", taskError);
        }
      }

      // For non-task related messages, use the Phase III backend (Hugging Face API)
      const response = await fetch(`${chatApiUrl}/api/${userId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          message: input.trim(),
          conversation_id: conversationId || undefined,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data: ChatResponse = await response.json();

      if (!conversationId && data.conversation_id) {
        setConversationId(data.conversation_id);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      let errorMessage = 'An error occurred while sending the message';

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      console.error("Chat error:", error);

      const errorMessageMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${errorMessage}`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessageMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickActions = [
    { id: 'create_task', label: 'Add a Task', action: () => setInput('Add a new task for me') },
    { id: 'view_tasks', label: 'View Tasks', action: () => setInput('Show me my tasks') },
    { id: 'complete_task', label: 'Complete Task', action: () => setInput('Mark a task as complete') },
  ];

  if (!user) {
    return null;
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg hover:shadow-2xl flex items-center justify-center transition-all duration-500 hover:scale-110 group group/btn"
          aria-label="Open chat"
          style={{
            boxShadow: '0 0 30px rgba(139, 92, 246, 0.6), 0 0 60px rgba(219, 39, 119, 0.4)',
          }}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 animate-pulse opacity-70 group-hover/btn:opacity-100 transition-opacity"></div>
            <div className="relative z-10 flex items-center justify-center w-10 h-10">
              <FaRobot className="text-lg" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center text-[7px] text-white border-2 border-white/30 group-hover/btn:animate-pulse transition-transform group-hover/btn:scale-125">
              <FaPlus className="text-[7px]" />
            </div>
          </div>
        </button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-3 sm:right-6 z-50 w-[calc(100vw-1.5rem)] sm:w-96 flex flex-col border border-white/20 rounded-2xl sm:rounded-[2rem] shadow-2xl bg-gradient-to-br from-[#0a0a0f] to-[#1a1a2e] text-white overflow-hidden transition-all duration-300 transform ${
            isMinimized ? 'h-14' : 'h-[70vh] sm:h-[500px]'
          } backdrop-blur-xl shadow-[0_0_40px_rgba(139,92,246,0.2)]`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#1a1a2e]/30 to-[#2d1b69]/30 border-b border-white/10 backdrop-blur-xl bg-opacity-30 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#8b5cf6]/5 via-transparent to-transparent opacity-30"></div>
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-[#8b5cf6]/40 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <FaRobot className="text-lg" />
                </div>
              </div>
              <div>
                <h3 className="font-black text-white uppercase tracking-tighter text-lg bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                  AI Commander
                </h3>
                <p className="text-[10px] sm:text-xs text-white/60 font-bold uppercase tracking-widest flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                  {isMinimized ? 'CLICK_TO_EXPAND' : 'ONLINE_-_READY_TO_EXECUTE'}
                </p>
              </div>
            </div>
            <div className="relative z-10 flex gap-2">
              {isMinimized ? (
                <button
                  onClick={expandChat}
                  className="text-white/70 hover:text-white/90 transition-all p-2 rounded-xl hover:bg-white/[0.1] backdrop-blur-sm border border-white/10 hover:shadow-lg hover:shadow-[#8b5cf6]/20"
                  aria-label="Expand chat"
                >
                  <FaChevronUp className="text-lg" />
                </button>
              ) : (
                <button
                  onClick={minimizeChat}
                  className="text-white/70 hover:text-white/90 transition-all p-2 rounded-xl hover:bg-white/[0.1] backdrop-blur-sm border border-white/10 hover:shadow-lg hover:shadow-[#8b5cf6]/20"
                  aria-label="Minimize chat"
                >
                  <FaChevronDown className="text-lg" />
                </button>
              )}
              <button
                onClick={toggleChat}
                className="text-white/70 hover:text-white/90 transition-all p-2 rounded-xl hover:bg-[#dc2626]/30 backdrop-blur-sm border border-white/10 hover:shadow-lg hover:shadow-[#dc2626]/20"
                aria-label="Close chat"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          {!isMinimized && (
            <div className="flex border-b border-white/10 bg-white/[0.02]">
              <button
                onClick={() => setShowTaskManager(false)}
                className={`px-6 py-4 text-sm font-black uppercase tracking-widest transition-all duration-300 relative ${
                  !showTaskManager
                    ? "text-[#8b5cf6] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#8b5cf6] after:rounded-full shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                    : "text-white/60 hover:text-white/80"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FaRobot className="text-xs" />
                  Command Center
                </div>
              </button>
              <button
                onClick={() => setShowTaskManager(true)}
                className={`px-6 py-4 text-sm font-black uppercase tracking-widest transition-all duration-300 relative ${
                  showTaskManager
                    ? "text-[#8b5cf6] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#8b5cf6] after:rounded-full shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                    : "text-white/60 hover:text-white/80"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FaListUl className="text-xs" />
                  Operation Hub
                </div>
              </button>
            </div>
          )}

          {/* Content Area */}
          {!isMinimized && (
            <div className="flex-1 overflow-hidden flex flex-col">
              {showTaskManager ? (
                <div className="flex-1 overflow-y-auto p-4">
                  <TaskManager userId={typeof user.id === 'number' ? user.id : 1} />
                </div>
              ) : (
                <>
                  {/* Messages Container */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/[0.01]">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center py-8 relative overflow-hidden">
                        {/* Animated background elements */}
                        <div className="absolute inset-0 overflow-hidden">
                          <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
                          <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-pink-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                          <div className="absolute top-1/2 left-1/2 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                        </div>

                        <div className="relative z-10 flex flex-col items-center">
                          <div className="mb-6 w-24 h-24 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-[#8b5cf6]/40 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-pulse opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
                            <div className="relative z-10">
                              <FaRobot className="text-4xl text-white" />
                            </div>
                          </div>

                          <h4 className="text-2xl font-black mb-2 text-white uppercase tracking-tighter bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                            Command Interface Ready
                          </h4>
                          <p className="text-white/50 text-base mb-8 font-bold uppercase tracking-widest max-w-md">
                            Execute operations through voice or text
                          </p>

                          <div className="grid grid-cols-1 gap-4 w-full max-w-xs">
                            {quickActions.map((action) => (
                              <button
                                key={action.id}
                                onClick={action.action}
                                className="text-left p-5 rounded-2xl bg-gradient-to-r from-white/[0.02] to-white/[0.04] hover:from-white/[0.05] hover:to-white/[0.07] border border-white/10 text-sm transition-all text-white hover:scale-[1.02] active:scale-[0.98] font-bold tracking-wide shadow-lg shadow-[0_0_30px_-15px_rgba(139,92,246,0.2)] group relative overflow-hidden"
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative z-10 flex items-center gap-3">
                                  <div className="w-3 h-3 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full group-hover:animate-pulse"></div>
                                  {action.label}
                                </div>
                              </button>
                            ))}
                          </div>

                          <div className="mt-8 flex items-center gap-2 text-white/40 text-xs font-bold uppercase tracking-widest">
                            <span className="w-2 h-2 bg-[#8b5cf6] rounded-full animate-pulse"></span>
                            AI Assistant Online
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                          >
                            <div
                              className={`max-w-[80%] rounded-2xl px-5 py-4 relative overflow-hidden ${
                                message.role === 'user'
                                  ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-[#8b5cf6]/40'
                                  : 'bg-gradient-to-br from-white/[0.02] to-white/[0.04] border border-white/10 text-white shadow-lg shadow-[0_0_30px_-15px_rgba(139,92,246,0.1)]'
                              }`}
                            >
                              {/* Animated background for messages */}
                              <div className={`absolute inset-0 ${
                                message.role === 'user'
                                  ? 'bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20'
                                  : 'bg-gradient-to-br from-white/5 to-transparent'
                              } opacity-0 hover:opacity-100 transition-opacity duration-300`}></div>

                              <div className="relative z-10">
                                <p className="whitespace-pre-wrap text-sm font-bold tracking-wide">{message.content}</p>
                                <p className={`mt-2 text-xs font-bold uppercase tracking-widest ${
                                  message.role === 'user' ? 'text-white/70' : 'text-white/40'
                                }`}>
                                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                        {isTyping && (
                          <div className="flex justify-start animate-pulse">
                            <div className="bg-gradient-to-br from-white/[0.02] to-white/[0.04] border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-lg shadow-[0_0_30px_-15px_rgba(139,92,246,0.1)]">
                              <span className="text-sm font-bold uppercase tracking-widest text-white/60">Processing</span>
                              <div className="flex gap-2">
                                <div className="w-3 h-3 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full animate-bounce"></div>
                                <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                <div className="w-3 h-3 bg-gradient-to-r from-pink-400 to-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="p-4 border-t border-white/10 bg-gradient-to-r from-[#1a1a2e]/20 to-[#0a0a0f]/20 relative overflow-hidden">
                    {/* Animated background */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#8b5cf6]/5 via-transparent to-transparent opacity-20"></div>
                    <div className="relative z-10 flex gap-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress as any}
                        placeholder="EXECUTE_COMMAND..."
                        className="flex-1 bg-white/[0.05] border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/50 focus:border-[#8b5cf6]/50 text-sm transition-all font-bold tracking-wide backdrop-blur-sm shadow-inner shadow-[#000000]/20"
                        disabled={isLoading}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={isLoading || !input.trim() || !userId}
                        className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 shadow-lg shadow-[#8b5cf6]/30 hover:shadow-2xl hover:shadow-[#8b5cf6]/50 group"
                        aria-label="Send message"
                        style={{
                          boxShadow: '0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(236, 72, 153, 0.3)',
                        }}
                      >
                        {isLoading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <div className="relative flex items-center justify-center">
                            <FaPaperPlane className="text-sm group-hover:scale-110 transition-transform" />
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-ping opacity-0 group-hover:opacity-20 transition-opacity"></div>
                          </div>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-white/50 mt-2 text-center font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                      <span className="inline-flex items-center justify-center w-2 h-2 bg-[#8b5cf6] rounded-full animate-pulse"></span>
                      PRESS ENTER TO EXECUTE
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}