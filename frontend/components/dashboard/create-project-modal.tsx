// frontend/components/dashboard/create-project-modal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  FaXmark,
  FaRocket,
  FaShieldHalved,
  FaFlag,
  FaCheck,
  FaArrowRight,
  FaSpinner
} from 'react-icons/fa6';
import { apiService } from '../../lib/api';
import { useAuth } from '../../lib/auth/context';
import { Project } from '../../lib/types/project';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (project: Project) => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name && step === 1) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name, step]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const project = await apiService.createProject(user.id, {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || undefined,
        priority: formData.priority
      });
      onSuccess(project);
      onClose();
      // Reset form
      setFormData({ name: '', slug: '', description: '', priority: 'medium' });
      setStep(1);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize operation. Check parameters.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-[#0a0a0f] border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_0_80px_rgba(139,92,246,0.2)] animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="relative h-24 bg-gradient-to-br from-[#8b5cf6]/10 to-transparent border-b border-white/5 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#8b5cf6]/20 border border-[#8b5cf6]/30 flex items-center justify-center">
              <FaRocket className="text-[#8b5cf6] text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-tighter">Initialize Operation</h2>
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Create new project vector</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <FaXmark className="text-sm" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
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
            <div className="p-4 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-[10px] font-bold uppercase tracking-widest text-center">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Operation Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ENTER PROJECT IDENTIFIER"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-[11px] font-bold text-white placeholder:text-white/10 focus:border-[#8b5cf6]/50 focus:bg-white/[0.06] transition-all outline-none"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">System Slug</label>
                <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4">
                  <span className="text-[#8b5cf6] text-xs">/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="auto-generated-slug"
                    className="flex-1 bg-transparent border-none outline-none text-[11px] font-mono text-white placeholder:text-white/10"
                  />
                </div>
                <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest ml-1">Unique URL identifier for this operation</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Mission Brief</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Define operational parameters and objectives..."
                  rows={4}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-[11px] font-medium text-white placeholder:text-white/10 focus:border-[#8b5cf6]/50 focus:bg-white/[0.06] transition-all outline-none resize-none"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Risk Level</label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: 'low', label: 'Standard', color: 'text-[#10b981]', bg: 'bg-[#10b981]/10 border-[#10b981]/20' },
                  { value: 'medium', label: 'Elevated', color: 'text-[#f59e0b]', bg: 'bg-[#f59e0b]/10 border-[#f59e0b]/20' },
                  { value: 'high', label: 'Critical', color: 'text-[#ef4444]', bg: 'bg-[#ef4444]/10 border-[#ef4444]/20' }
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: opt.value as any })}
                    className={`p-4 rounded-2xl border transition-all duration-500 ${
                      formData.priority === opt.value
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
            </div>
          )}

          {/* Navigation Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
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
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && !formData.name}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 text-[#8b5cf6] text-[9px] font-black uppercase tracking-widest hover:bg-[#8b5cf6]/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Continue <FaArrowRight className="text-[10px]" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#8b5cf6]/80 text-white text-[9px] font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <FaSpinner className="text-sm animate-spin" />
                ) : (
                  <>
                    Initialize Operation <FaCheck className="text-[10px]" />
                  </>
                )}
              </button>
            )}
          </div>
        </form>

        {/* Background Glow */}
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-[#8b5cf6]/5 blur-[100px] rounded-full pointer-events-none" />
      </div>
    </div>
  );
};

export default CreateProjectModal;
