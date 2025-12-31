// frontend/components/ui/loading-spinner.tsx
'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text = 'Loading...',
  fullScreen = false
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const spinner = (
    <>
      <div className="relative">
        <div className={`${sizeClasses[size]} border-4 border-gray-700 border-t-purple-500 rounded-full animate-spin`}></div>
        <div className={`absolute inset-0 ${sizeClasses[size]} border-4 border-transparent border-r-pink-500 rounded-full animate-spin`} style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
      </div>
      {text && (
        <p className="mt-4 text-gray-400 text-sm md:text-base animate-pulse">{text}</p>
      )}
    </>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm flex flex-col items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      {spinner}
    </div>
  );
};

export default LoadingSpinner;
