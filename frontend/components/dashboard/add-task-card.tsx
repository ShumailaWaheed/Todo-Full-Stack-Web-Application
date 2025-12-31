// frontend/components/dashboard/add-task-card.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FaPlus } from 'react-icons/fa';

interface AddTaskCardProps {
  className?: string;
}

const AddTaskCard: React.FC<AddTaskCardProps> = ({ className = '' }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push('/dashboard/tasks/create');
  };

  return (
    <div
      onClick={handleClick}
      className={`
        outline-card outline-card-clickable
        flex flex-col items-center justify-center
        p-6 min-h-[140px] md:min-h-[160px]
        group
        ${className}
      `}
    >
      <div className="relative mb-3">
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl border-2 border-[rgba(148,163,184,0.12)] flex items-center justify-center bg-[#1c2029] group-hover:bg-[#222630] group-hover:border-[#8b5cf6]/30 transition-all duration-300 group-hover:scale-105">
          <FaPlus className="w-6 h-6 md:w-7 md:h-7 text-[#9ca3af] group-hover:text-[#8b5cf6] transition-colors duration-300" />
        </div>
        {/* Soft glow effect on hover */}
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 rounded-xl bg-[#8b5cf6]/5 blur-xl"></div>
        </div>
      </div>
      <h3 className="text-sm md:text-base font-medium text-[#f0f2f5] group-hover:text-[#8b5cf6] transition-colors duration-300">
        Add New Task
      </h3>
      <p className="text-xs text-[#6b7280] mt-1 text-center">
        Click to create a task
      </p>
    </div>
  );
};

export default AddTaskCard;
