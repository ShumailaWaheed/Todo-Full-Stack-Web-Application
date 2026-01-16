'use client';

import { useState, useRef, useEffect } from 'react';
import TaskCreationModal from '../../components/chat/TaskCreationModal';
import TaskListModal from '../../components/chat/TaskListModal';
import { useAuth } from '../../lib/auth/context';

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
  tool_calls?: ToolCall[];
  conversation_id?: number;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTaskListModal, setShowTaskListModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get authenticated user
  const { user } = useAuth();

  // Get user ID from authenticated user
  const userId = user?.id || '';

  const apiUrl = process.env.NEXT_PUBLIC_PHASE_III_API_URL || 'http://localhost:8000';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    setMounted(true);
    scrollToBottom();
  }, [messages]);

  const handleQuickAction = (action: string) => {
    if (action === 'create_task') {
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I'll open the task creation form for you. Fill in the details and I'll handle the rest!",
        timestamp: new Date(),
        action: 'create_task'
      };
      setMessages(prev => [...prev, aiMessage]);
      setShowTaskModal(true);
    } else if (action === 'view_tasks') {
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Here are all your tasks. You can filter, complete, or delete them from here.",
        timestamp: new Date(),
        action: 'view_tasks'
      };
      setMessages(prev => [...prev, aiMessage]);
      setShowTaskListModal(true);
    }
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
      const response = await fetch(`${apiUrl}/api/${userId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input.trim() }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ChatResponse = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please make sure the backend is running and try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickActions = [
    {
      id: 'create_task',
      label: 'New Task',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      gradient: 'from-violet-600 to-fuchsia-600',
      action: () => handleQuickAction('create_task')
    },
    {
      id: 'view_tasks',
      label: 'View Tasks',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      gradient: 'from-cyan-500 to-blue-600',
      action: () => handleQuickAction('view_tasks')
    },
  ];

  const examplePrompts = [
    { text: "Add a task to buy groceries", icon: "+" },
    { text: "Show all my pending tasks", icon: "list" },
    { text: "Mark task 1 as complete", icon: "check" },
    { text: "Delete completed tasks", icon: "trash" },
  ];

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center">
          <p className="text-lg text-gray-400">Please log in to access the chat</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-screen flex-col relative overflow-hidden">
        {/* Animated Background */}
        <div className="particles-bg" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-2s' }} />
        </div>

        {/* Header */}
        <header className="relative z-20 glass border-b border-white/5">
          <div className="mx-auto max-w-5xl px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <a
                  href="/"
                  className="group flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-violet-500/50 transition-all duration-300"
                >
                  <svg className="w-5 h-5 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </a>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl blur opacity-50" />
                    <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-white">AI Assistant</h1>
                    <p className="text-xs text-gray-400">Task Management</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-medium text-emerald-400">Online</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Quick Actions */}
        <div className="relative z-10 border-b border-white/5 bg-black/20 backdrop-blur-sm">
          <div className="mx-auto max-w-5xl px-4 py-3">
            <div className="flex items-center gap-3">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={action.action}
                  className={`group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r ${action.gradient} text-white font-medium text-sm shadow-lg hover:shadow-xl transition-all duration-300`}
                >
                  {action.icon}
                  <span>{action.label}</span>
                </button>
              ))}
              <div className="hidden sm:block h-8 w-px bg-white/10 mx-2" />
              <p className="hidden sm:block text-xs text-gray-500">
                Or type naturally below
              </p>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className={`relative z-10 flex flex-1 flex-col mx-auto w-full max-w-5xl p-4 transition-all duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto rounded-2xl glass p-4 sm:p-6 mb-4 min-h-[400px] max-h-[calc(100vh-320px)]">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center py-8">
                {/* Welcome Icon */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-3xl blur-xl opacity-40 animate-pulse-glow" />
                  <div className="relative flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 shadow-2xl">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                </div>

                {/* Welcome Text */}
                <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                  <span className="text-gradient">Hello!</span>
                  <span className="text-white"> How can I help?</span>
                </h2>
                <p className="text-gray-400 max-w-md mb-8">
                  I can help you manage tasks using natural language. Try typing or click a suggestion below.
                </p>

                {/* Example Prompts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                  {examplePrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setInput(prompt.text);
                        inputRef.current?.focus();
                      }}
                      className="group flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-violet-500/30 transition-all duration-300 text-left"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-500/20 text-violet-400 group-hover:bg-violet-500/30 transition-colors">
                        {prompt.icon === '+' && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        )}
                        {prompt.icon === 'list' && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                          </svg>
                        )}
                        {prompt.icon === 'check' && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {prompt.icon === 'trash' && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{prompt.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center mr-3 mt-1">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] ${
                        message.role === 'user'
                          ? 'chat-bubble-user'
                          : 'chat-bubble-ai'
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{message.content}</p>
                      <p className={`mt-2 text-xs ${message.role === 'user' ? 'text-white/60' : 'text-gray-500'}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {message.role === 'user' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center ml-3 mt-1">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div className="chat-bubble-ai flex items-center gap-1.5 py-4 px-5">
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="chat-input-container p-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="w-full bg-transparent px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none text-[15px]"
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim() || !userId}
                className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/30 active:scale-95"
              >
                {isLoading ? (
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Keyboard hint */}
          <div className="text-center mt-3">
            <p className="text-xs text-gray-600">
              Press <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400 font-mono text-[10px]">Enter</kbd> to send
            </p>
          </div>
        </div>
      </div>

      {/* Task Creation Modal */}
      {showTaskModal && userId && (
        <TaskCreationModal
          userId={userId}
          onClose={() => setShowTaskModal(false)}
          onSuccess={() => {
            setShowTaskModal(false);
            const successMsg: Message = {
              id: Date.now().toString(),
              role: 'assistant',
              content: 'Task created successfully! You can view it in your task list.',
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, successMsg]);
          }}
        />
      )}

      {/* Task List Modal */}
      {showTaskListModal && userId && (
        <TaskListModal
          userId={userId}
          onClose={() => setShowTaskListModal(false)}
        />
      )}
    </>
  );
}