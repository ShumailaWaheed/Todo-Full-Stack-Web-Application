// frontend/components/ui/app-logo.tsx
'use client';

import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  showText = true,
  className = ''
}) => {
  const sizeClasses = {
    sm: { container: 'w-6 h-6', icon: 'text-xs', text: 'text-sm' },
    md: { container: 'w-8 h-8', icon: 'text-sm', text: 'text-lg' },
    lg: { container: 'w-12 h-12', icon: 'text-lg', text: 'text-2xl' },
    xl: { container: 'w-16 h-16', icon: 'text-2xl', text: 'text-3xl' }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`${currentSize.container} bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/30`}>
        <FaCheckCircle className={`text-white ${currentSize.icon}`} />
      </div>
      {showText && (
        <span className={`${currentSize.text} font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent`}>
          TaskFlow
        </span>
      )}
    </div>
  );
};

export default AppLogo;
