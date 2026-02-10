'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  FaTimes,
  FaExpand,
  FaCompress,
  FaTrash,
  FaPlus,
  FaList,
} from 'react-icons/fa';
import {
  HiSparkles,
  HiChip,
} from 'react-icons/hi';
import { IoMdClose } from 'react-icons/io';
import { BsStars } from 'react-icons/bs';
import { RiRobot2Fill, RiSendPlaneFill, RiSparklingFill } from 'react-icons/ri';
import TaskCreationModal from './TaskCreationModal';
import TaskListModal from './TaskListModal';
import { useAuth } from '../../lib/auth/context';
import { useTaskUpdate } from '../../lib/context/task-update-context';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface ChatResponse {
  response: string;
  success: boolean;
  conversation_id?: string;
  error?: string | null;
  tool_calls?: Array<{
    name: string;
    args: Record<string, unknown>;
    result?: unknown;
  }>;
}

// Animated background particles component
const ParticleField = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-purple-500/30 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
          }}
        />
      ))}
    </div>
  );
};

// Animated gradient orb
const GradientOrb = ({ className = '' }: { className?: string }) => (
  <div className={`absolute rounded-full blur-3xl opacity-20 animate-pulse-slow ${className}`} />
);

// Typing indicator with modern animation
const TypingIndicator = () => (
  <div className="flex items-center gap-1 px-4 py-3">
    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce-dot" style={{ animationDelay: '0ms' }} />
      <span className="w-2 h-2 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full animate-bounce-dot" style={{ animationDelay: '150ms' }} />
      <span className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce-dot" style={{ animationDelay: '300ms' }} />
    </div>
    <span className="ml-2 text-xs text-gray-400 animate-pulse">AI is thinking...</span>
  </div>
);

// Message bubble component with enhanced styling
const MessageBubble = ({ message, isLatest }: { message: Message; isLatest: boolean }) => {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${isLatest ? 'animate-slide-up' : ''}`}
    >
      {!isUser && (
        <div className="flex-shrink-0 mr-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/20 animate-glow">
            <RiRobot2Fill className="text-white text-sm" />
          </div>
        </div>
      )}

      <div className={`max-w-[80%] group relative`}>
        <div
          className={`rounded-2xl px-4 py-3 relative overflow-hidden ${
            isUser
              ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white shadow-lg shadow-purple-500/25 bg-[length:200%_100%] animate-gradient-x'
              : 'bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 text-gray-100 shadow-xl'
          }`}
        >
          {/* Shimmer effect for assistant messages */}
          {!isUser && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          )}

          <p className="text-sm leading-relaxed whitespace-pre-wrap relative z-10">{message.content}</p>

          <div className={`flex items-center gap-2 mt-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <p className={`text-[10px] ${isUser ? 'text-white/60' : 'text-gray-500'}`}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            {isUser && (
              <span className="text-[10px] text-white/60">✓</span>
            )}
          </div>
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 ml-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center border border-gray-600/50">
            <span className="text-xs font-semibold text-gray-300">You</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Quick action chips
const QuickActions = ({ onSelect, onNewTask, onViewTasks }: { onSelect: (prompt: string) => void; onNewTask: () => void; onViewTasks: () => void }) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <button
        onClick={onNewTask}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
      >
        <FaPlus className="text-white" />
        New Task
      </button>
      <button
        onClick={onViewTasks}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-medium hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300"
      >
        <FaList className="text-white" />
        View Tasks
      </button>
      <button
        onClick={() => onSelect('Give me task insights')}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-gray-300 text-xs hover:bg-gray-700/50 hover:border-purple-500/50 hover:text-white transition-all duration-300"
      >
        <BsStars className="text-pink-400" />
        Insights
      </button>
    </div>
  );
};

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTaskListModal, setShowTaskListModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Get authenticated user
  const { user } = useAuth();
  const { triggerRefresh } = useTaskUpdate();

  // Get user ID from authenticated user
  const userId = user?.id || '';

  // API URL - Phase III AI Backend for chat functionality
  const apiUrl = process.env.NEXT_PUBLIC_PHASE_III_API_URL || 'http://localhost:8000';

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

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
      console.error('Chat API error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '🔌 Unable to connect to AI assistant. Please check your internet connection and try again.',
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

  const clearChat = () => {
    setMessages([]);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Dynamic sizing
  const chatSize = isExpanded
    ? 'w-[calc(100vw-2rem)] sm:w-[500px] h-[80vh] sm:h-[700px]'
    : 'w-[calc(100vw-2rem)] sm:w-[400px] h-[70vh] sm:h-[580px]';

  return (
    <>
      {/* Floating Action Button with Glow Effect */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Pulse ring animation */}
        {!isOpen && (
          <>
            <div className="absolute inset-0 w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 animate-ping opacity-20" />
            <div className="absolute inset-0 w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 animate-pulse opacity-30" />
          </>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`relative w-16 h-16 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-500 transform hover:scale-105 ${
            isOpen
              ? 'bg-gray-800 border border-gray-700 hover:border-red-500/50 rotate-0'
              : 'bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 hover:from-purple-500 hover:via-pink-500 hover:to-purple-600 shadow-purple-500/40'
          } ${isHovered && !isOpen ? 'rotate-12' : ''}`}
        >
          {/* Inner glow */}
          {!isOpen && (
            <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
          )}

          {isOpen ? (
            <IoMdClose className="text-gray-300 text-2xl hover:text-red-400 transition-colors relative z-10" />
          ) : (
            <div className="relative">
              <RiRobot2Fill className="text-white text-2xl relative z-10 drop-shadow-lg" />
              <HiSparkles className="absolute -top-1 -right-1 text-yellow-300 text-xs animate-sparkle" />
            </div>
          )}
        </button>

        {/* Floating label */}
        {!isOpen && isHovered && (
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-800 rounded-lg border border-gray-700 shadow-xl animate-fade-in">
            <span className="text-xs text-gray-300 whitespace-nowrap">AI Assistant</span>
            <div className="absolute top-full right-4 w-2 h-2 bg-gray-800 border-r border-b border-gray-700 transform rotate-45 -translate-y-1" />
          </div>
        )}
      </div>

      {/* Chat Window with Glassmorphism */}
      {isOpen && (
        <div
          className={`fixed bottom-24 right-6 ${chatSize} z-50 animate-scale-in`}
          style={{ transformOrigin: 'bottom right' }}
        >
          {/* Outer glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-3xl blur-lg opacity-30 animate-pulse-slow" />

          {/* Main container */}
          <div className="relative h-full bg-gray-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-700/50">
            {/* Gradient orbs for ambient effect */}
            <GradientOrb className="w-32 h-32 bg-purple-600 -top-16 -left-16" />
            <GradientOrb className="w-24 h-24 bg-pink-600 -bottom-12 -right-12" />
            <GradientOrb className="w-20 h-20 bg-blue-600 top-1/2 -right-10" />

            {/* Particle field */}
            <ParticleField />

            {/* Header with glassmorphism */}
            <div className="relative bg-gradient-to-r from-purple-900/80 via-pink-900/80 to-purple-900/80 backdrop-blur-xl p-4 border-b border-gray-700/50">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-purple-600/10" />

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Animated avatar */}
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30 animate-glow">
                      <RiRobot2Fill className="text-white text-xl" />
                    </div>
                    {/* Online indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse">
                      <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-50" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-bold text-base">TaskFlow AI</h3>
                      <RiSparklingFill className="text-yellow-400 text-xs animate-sparkle" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                      <p className="text-gray-400 text-xs">Ready to assist</p>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={clearChat}
                    className="p-2 rounded-xl bg-gray-800/50 hover:bg-red-500/20 border border-gray-700/50 hover:border-red-500/50 transition-all group"
                    title="Clear chat"
                  >
                    <FaTrash className="text-gray-400 text-xs group-hover:text-red-400 transition-colors" />
                  </button>
                  <button
                    onClick={toggleExpand}
                    className="p-2 rounded-xl bg-gray-800/50 hover:bg-purple-500/20 border border-gray-700/50 hover:border-purple-500/50 transition-all group"
                    title={isExpanded ? 'Minimize' : 'Expand'}
                  >
                    {isExpanded ? (
                      <FaCompress className="text-gray-400 text-xs group-hover:text-purple-400 transition-colors" />
                    ) : (
                      <FaExpand className="text-gray-400 text-xs group-hover:text-purple-400 transition-colors" />
                    )}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-xl bg-gray-800/50 hover:bg-red-500/20 border border-gray-700/50 hover:border-red-500/50 transition-all group"
                    title="Close"
                  >
                    <FaTimes className="text-gray-400 text-sm group-hover:text-red-400 transition-colors" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  {/* Animated welcome illustration */}
                  <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 flex items-center justify-center shadow-2xl shadow-purple-500/30 animate-float">
                      <RiRobot2Fill className="text-white text-4xl" />
                    </div>
                    <div className="absolute -top-2 -right-2">
                      <HiSparkles className="text-yellow-400 text-xl animate-sparkle" />
                    </div>
                    <div className="absolute -bottom-1 -left-2">
                      <BsStars className="text-pink-400 text-lg animate-sparkle" style={{ animationDelay: '0.5s' }} />
                    </div>
                  </div>

                  <h4 className="text-white font-bold text-xl mb-2">
                    Hello! I'm your AI Assistant
                  </h4>
                  <p className="text-gray-400 text-sm mb-6 max-w-[280px] leading-relaxed">
                    I can help you manage tasks, get insights, and boost your productivity. What would you like to do?
                  </p>

                  <QuickActions
                    onSelect={setInput}
                    onNewTask={() => setShowTaskModal(true)}
                    onViewTasks={() => setShowTaskListModal(true)}
                  />

                  {/* Powered by badge */}
                  <div className="absolute bottom-4 flex items-center gap-2 text-xs text-gray-500">
                    <HiChip className="text-purple-400" />
                    <span>Powered by Phase III AI</span>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isLatest={index === messages.length - 1}
                    />
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/20">
                          <RiRobot2Fill className="text-white text-sm" />
                        </div>
                        <div className="bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-700/50">
                          <TypingIndicator />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Area with modern design */}
            <div className="relative p-4 border-t border-gray-700/50 bg-gray-900/50 backdrop-blur-xl">
              <div className="absolute inset-x-4 -top-px h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask me anything..."
                    rows={1}
                    className="w-full bg-gray-800/80 backdrop-blur-sm text-white rounded-2xl px-4 py-3 pr-12 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 border border-gray-700/50 focus:border-purple-500/50 resize-none transition-all duration-300 scrollbar-thin scrollbar-thumb-gray-700"
                    disabled={isLoading}
                    style={{ maxHeight: '120px' }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                    }}
                  />

                  {/* Character indicator */}
                  {input.length > 0 && (
                    <span className="absolute bottom-2 right-3 text-[10px] text-gray-500">
                      {input.length}/500
                    </span>
                  )}
                </div>

                {/* Send button with glow */}
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 ${
                    input.trim() && !isLoading
                      ? 'bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50'
                      : 'bg-gray-800 border border-gray-700'
                  }`}
                >
                  {/* Button glow */}
                  {input.trim() && !isLoading && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 blur-lg opacity-40" />
                  )}

                  <RiSendPlaneFill
                    className={`text-lg relative z-10 transition-all duration-300 ${
                      input.trim() && !isLoading
                        ? 'text-white'
                        : 'text-gray-500'
                    } ${isLoading ? 'animate-pulse' : ''}`}
                  />
                </button>
              </div>

              {/* Keyboard shortcut hint */}
              <div className="flex items-center justify-center mt-2 gap-1 text-[10px] text-gray-600">
                <kbd className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700">Enter</kbd>
                <span>to send</span>
                <span className="mx-1">•</span>
                <kbd className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700">Shift+Enter</kbd>
                <span>for new line</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Creation Modal */}
      {showTaskModal && userId && (
        <TaskCreationModal
          userId={userId}
          onClose={() => setShowTaskModal(false)}
          onSuccess={() => {
            setShowTaskModal(false);
            // Trigger refresh to update task list across the app
            triggerRefresh();
            const successMsg: Message = {
              id: Date.now().toString(),
              role: 'assistant',
              content: 'Task created successfully! It has been added to your task list and will appear in the Tasks section.',
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
          onTaskUpdate={triggerRefresh}
        />
      )}
    </>
  );
};

export default ChatWidget;
