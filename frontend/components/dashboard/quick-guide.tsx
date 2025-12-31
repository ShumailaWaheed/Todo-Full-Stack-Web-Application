// frontend/components/dashboard/quick-guide.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FaChevronRight, FaLightbulb, FaCheckCircle, FaClock, FaBullseye } from 'react-icons/fa';

interface QuickGuideProps {
  className?: string;
}

interface GuideStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const guideSteps: GuideStep[] = [
  {
    id: 1,
    title: 'Create a Task',
    description: 'Click the + button to add a new task to your list',
    icon: <FaClock className="w-4 h-4" />,
  },
  {
    id: 2,
    title: 'Set Priorities',
    description: 'Mark high-priority tasks to focus on what matters most',
    icon: <FaBullseye className="w-4 h-4" />,
  },
  {
    id: 3,
    title: 'Track Progress',
    description: 'Watch your productivity score improve as you complete tasks',
    icon: <FaCheckCircle className="w-4 h-4" />,
  },
];

const QuickGuide: React.FC<QuickGuideProps> = ({ className = '' }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const typeText = useCallback((text: string) => {
    setIsTyping(true);
    setDisplayedText('');
    let index = 0;

    const typeChar = () => {
      if (index < text.length) {
        setDisplayedText(text.substring(0, index + 1));
        index++;
        setTimeout(typeChar, 30 + Math.random() * 20); // Random delay for natural typing feel
      } else {
        setIsTyping(false);
      }
    };

    typeChar();
  }, []);

  useEffect(() => {
    typeText(guideSteps[currentStep].description);
  }, [currentStep, typeText]);

  // Auto-advance steps
  useEffect(() => {
    if (isTyping) return;

    const timer = setTimeout(() => {
      setCurrentStep((prev) => (prev + 1) % guideSteps.length);
    }, 4000); // Wait 4 seconds after typing finishes

    return () => clearTimeout(timer);
  }, [currentStep, isTyping]);

  const tips = [
    'Break large tasks into smaller subtasks',
    'Set realistic deadlines for better planning',
    'Review your completed tasks weekly',
    'Use labels to categorize your work',
  ];

  return (
    <div className={`outline-card p-5 md:p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-lg bg-[#8b5cf6]/10 flex items-center justify-center">
          <FaLightbulb className="w-5 h-5 text-[#8b5cf6]" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-[#f0f2f5]">Quick Guide</h3>
          <p className="text-xs text-[#6b7280]">Get started in 3 steps</p>
        </div>
      </div>

      {/* Animated Step Display */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="w-6 h-6 rounded-full bg-[#8b5cf6]/10 flex items-center justify-center text-[#8b5cf6] text-xs font-medium"
          >
            {guideSteps[currentStep].id}
          </span>
          <h4 className="text-sm font-medium text-[#f0f2f5]">
            {guideSteps[currentStep].title}
          </h4>
        </div>
        <div className="bg-[#222630] rounded-lg p-4 min-h-[60px]">
          <p className="text-sm text-[#9ca3af] leading-relaxed">
            {displayedText}
            {isTyping && (
              <span className="inline-block w-1.5 h-4 bg-[#8b5cf6] ml-1 animate-pulse align-middle"></span>
            )}
          </p>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-center gap-2 mb-5">
        {guideSteps.map((step, index) => (
          <button
            key={step.id}
            onClick={() => setCurrentStep(index)}
            className={`
              step-dot
              ${index === currentStep ? 'active' : ''}
              ${index < currentStep ? 'completed' : ''}
            `}
            aria-label={`Go to step ${step.id}`}
          />
        ))}
      </div>

      {/* Navigation Dots */}
      <div className="flex justify-center gap-1 mb-5">
        {guideSteps.map((step) => (
          <div
            key={step.id}
            className={`
              w-2 h-2 rounded-full transition-all duration-300 cursor-pointer
              ${currentStep === step.id - 1
                ? 'bg-[#8b5cf6] w-6'
                : currentStep > step.id - 1
                ? 'bg-[#10b981]'
                : 'bg-[rgba(148,163,184,0.2)]'
              }
            `}
            onClick={() => setCurrentStep(step.id - 1)}
          />
        ))}
      </div>

      {/* Pro Tips Section */}
      <div className="border-t border-[rgba(148,163,184,0.12)] pt-4">
        <p className="text-xs font-medium text-[#6b7280] uppercase tracking-wider mb-3">
          Pro Tips
        </p>
        <ul className="space-y-2">
          {tips.map((tip, index) => (
            <li
              key={index}
              className="flex items-start gap-2 text-sm text-[#9ca3af]"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <FaChevronRight className="w-3 h-3 mt-0.5 text-[#8b5cf6] flex-shrink-0" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default QuickGuide;
