// frontend/components/dashboard/add-task-section.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaPlus,
  FaChevronRight,
  FaArrowRight,
  FaPenToSquare as FaEdit,
  FaKeyboard,
  FaTasks,
  FaFlag,
  FaCheck,
  FaLightbulb,
  FaShieldHalved,
  FaBolt,
  FaMicrochip
} from 'react-icons/fa6';

interface AddTaskSectionProps {
  className?: string;
}

const guideSteps = [
  {
    id: 1,
    title: 'Initialize Objective',
    description: 'Tap [+] to activate the high-precision creation engine.',
    proTip: 'Use descriptive verbs like [DEPLOY] or [NEUTRALIZE] for better psychological flow.',
    icon: <FaEdit className="w-5 h-5" />
  },
  {
    id: 2,
    title: 'Sector Assignment',
    description: 'Link your objective to a Project Vault for unified tracking.',
    proTip: 'Assigning a project auto-calculates operational stability in your dashboard hub.',
    icon: <FaShieldHalved className="w-5 h-5" />
  },
  {
    id: 3,
    title: 'Priority Vector',
    description: 'Designate High, Medium, or Low risk levels.',
    proTip: 'Focus 80% of your energy on High-Risk tasks to maximize Neural Efficiency.',
    icon: <FaBolt className="w-5 h-5" />
  },
  {
    id: 4,
    title: 'Finalize & Sync',
    description: 'Verify your parameters and synchronize to the global grid.',
    proTip: 'Complete tasks daily to maintain your system streak and light up your heatmap.',
    icon: <FaMicrochip className="w-5 h-5" />
  },
];

const AddTaskSection: React.FC<AddTaskSectionProps> = ({ className = '' }) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [activeTab, setActiveTab] = useState<'create' | 'guide'>('create');
  const [hovered, setHovered] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const typeText = useCallback((text: string) => {
    let index = 0;
    setDisplayedText('');
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    const type = () => {
      if (index < text.length) {
        setDisplayedText(prev => prev + text.charAt(index));
        index++;
        typingTimeoutRef.current = setTimeout(type, 30);
      }
    };
    type();
  }, []);

  useEffect(() => {
    typeText(guideSteps[currentStep].description);
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % guideSteps.length);
    }, 6000);
    return () => {
      clearInterval(interval);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [currentStep, typeText]);

  return (
    <div className={`${className} relative`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#8b5cf6]/20 border border-[#8b5cf6]/30 flex items-center justify-center">
            <FaPlus className="w-4 h-4 text-[#8b5cf6]" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">Quick Actions</h3>
        </div>

        <div className="flex bg-white/5 p-1 rounded-lg border border-white/10 gap-1">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-1.5 rounded-md text-[10px] uppercase font-black transition-all ${activeTab === 'create' ? 'bg-[#8b5cf6] text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]' : 'text-white/40 hover:text-white'}`}
          >
            Create
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-1.5 rounded-md text-[10px] uppercase font-black transition-all ${activeTab === 'guide' ? 'bg-[#8b5cf6] text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]' : 'text-white/40 hover:text-white'}`}
          >
            Guide
          </button>
        </div>
      </div>

      {activeTab === 'create' ? (
        <div
          onClick={() => router.push('/dashboard/tasks/create')}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="group relative cursor-pointer border border-white/10 bg-white/[0.02] p-8 rounded-2xl overflow-hidden transition-all duration-500 hover:border-[#8b5cf6]/40 hover:bg-white/[0.04] hover:-translate-y-1"
        >
          {/* Accent Line */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#8b5cf6] transition-transform duration-500 scale-y-[0.3] group-hover:scale-y-100 origin-top shadow-[0_0_15px_#8b5cf6]"></div>

          <div className="flex items-start justify-between mb-10">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 ${hovered ? 'bg-[#8b5cf6]/10 border-[#8b5cf6] rotate-12 shadow-[0_0_30px_rgba(139,92,246,0.3)]' : 'bg-white/5 border-white/10'}`}>
              <FaPlus className={`w-7 h-7 ${hovered ? 'text-[#8b5cf6] scale-110' : 'text-white/20'}`} />
            </div>

            <div className={`flex flex-col items-end gap-2 transition-all duration-500 ${hovered ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}>
              <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded border border-white/10">
                <FaKeyboard className="text-[10px] text-white/40" />
                <span className="text-[9px] text-white/60 font-mono tracking-tighter">CTRL+N</span>
              </div>
              <FaArrowRight className="text-[#8b5cf6] animate-pulse" />
            </div>
          </div>

          <h4 className="text-xl font-black text-white tracking-tight mb-2 uppercase group-hover:text-[#8b5cf6] transition-colors">Start New Task</h4>
          <p className="text-sm text-white/40 group-hover:text-white/70 transition-colors">Invoke the creation engine to organize your next objective.</p>
        </div>
      ) : (
        <div className="border border-white/10 bg-white/[0.02] p-8 rounded-2xl">
          <div className="flex gap-1.5 mb-8">
            {guideSteps.map((_, i) => (
              <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === currentStep ? 'flex-1 bg-[#8b5cf6]' : 'w-8 bg-white/10'}`} />
            ))}
          </div>

          <div className="flex items-start gap-5 mb-6 text-[#8b5cf6]">
            <div className="w-12 h-12 rounded-xl bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 flex items-center justify-center">{guideSteps[currentStep].icon}</div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Phase 0{guideSteps[currentStep].id}</span>
              <h5 className="text-xl font-bold text-white">{guideSteps[currentStep].title}</h5>
            </div>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-xl p-5 min-h-[80px] mb-6">
            <p className="text-base text-white/60 leading-relaxed italic">"{displayedText}"</p>
          </div>

          {/* Pro Tip Section */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-[#8b5cf6]/5 border border-[#8b5cf6]/10 animate-in fade-in slide-in-from-bottom-2 duration-700">
             <div className="p-2 rounded-lg bg-[#8b5cf6]/10">
                <FaLightbulb className="text-[#8b5cf6] text-xs animate-pulse" />
             </div>
             <div>
                <span className="text-[8px] font-black text-[#8b5cf6] uppercase tracking-[0.2em]">Tactical_Advice</span>
                <p className="text-[10px] text-white/40 leading-relaxed font-medium mt-0.5">{guideSteps[currentStep].proTip}</p>
             </div>
          </div>

          <div className="flex justify-between items-center pt-8 mt-6 border-t border-white/5">
             <button onClick={() => setCurrentStep(p => (p - 1 + guideSteps.length) % guideSteps.length)} className="text-[10px] font-black text-white/30 hover:text-white">PREV</button>
             <div className="flex gap-1.5">
               {guideSteps.map((_, i) => (
                 <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === currentStep ? 'bg-[#8b5cf6]' : 'bg-white/10'}`} />
               ))}
             </div>
             <button onClick={() => setCurrentStep(p => (p + 1) % guideSteps.length)} className="text-[10px] font-black text-[#8b5cf6]">NEXT</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddTaskSection;
