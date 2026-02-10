'use client';

import React, { useState } from 'react';
import { useAuth } from '../../lib/auth/context';
import EnhancedChatBot from './EnhancedChatBot';

export default function EnhancedChatBotButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, token } = useAuth();

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-full shadow-2xl hover:shadow-purple-500/50 hover:scale-110 transition-all duration-300 flex items-center justify-center group"
          aria-label="Open AI Assistant"
          style={{
            boxShadow: '0 0 30px rgba(139, 92, 246, 0.6), 0 0 60px rgba(219, 39, 119, 0.4)',
          }}
        >
          <svg
            className="w-6 h-6 sm:w-8 sm:h-8 group-hover:scale-110 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>

          {/* Pulse Animation */}
          <span className="absolute inset-0 rounded-full bg-purple-500 animate-ping opacity-20"></span>

          {/* Badge */}
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          </span>
        </button>
      )}

      {/* Enhanced ChatBot Component */}
      {isOpen && <EnhancedChatBot />}
    </>
  );
}