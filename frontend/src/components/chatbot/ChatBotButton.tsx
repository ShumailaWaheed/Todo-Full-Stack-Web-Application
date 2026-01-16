'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../lib/auth/context';
import ChatBot from './ChatBot';

export default function ChatBotButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, token } = useAuth();

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-2xl hover:shadow-purple-500/50 hover:scale-110 transition-all duration-300 flex items-center justify-center group"
          aria-label="Open AI Assistant"
        >
          <svg
            className="w-8 h-8 group-hover:scale-110 transition-transform"
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

      {/* ChatBot Component */}
      <ChatBot
        userId={user?.id}
        token={token ?? undefined}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
