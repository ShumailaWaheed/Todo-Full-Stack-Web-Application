'use client';

import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-[#0a0a0f] border border-white/10 rounded-[2rem] p-8 max-w-md w-full max-h-[90vh] overflow-y-auto z-10 animate-in fade-in zoom-in-95">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-[#ef4444]/20 flex items-center justify-center mb-6">
            <FaExclamationTriangle className="text-[#ef4444] text-xl" />
          </div>

          <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-2">
            {title}
          </h3>

          <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-8">
            {message}
          </p>

          <div className="flex gap-4 w-full">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              {cancelText}
            </button>

            <button
              onClick={onConfirm}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;