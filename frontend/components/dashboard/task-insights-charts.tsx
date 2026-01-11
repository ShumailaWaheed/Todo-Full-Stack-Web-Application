// frontend/components/dashboard/task-insights-charts.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  FaChartLine,
  FaChartBar,
  FaChartPie,
  FaBolt,
  FaLayerGroup,
  FaCircle,
} from 'react-icons/fa6';
import { apiService } from '../../lib/api';
import { useAuth } from '../../lib/auth/context';

interface TaskInsightsChartsProps {
  className?: string;
}

const TaskInsightsCharts: React.FC<TaskInsightsChartsProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [activeChart, setActiveChart] = useState<'weekly' | 'status' | 'completion'>('weekly');
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const response = await apiService.getTasks(user.id);
        const fetchedTasks = response.tasks || [];
        setTasks(fetchedTasks);
        setTimeout(() => setAnimate(true), 200);
      } catch (error) {
        console.error('Error fetching tasks for charts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [user]);

  const completedCount = tasks.filter((t: any) => t.completed).length;
  const pendingCount = tasks.filter((t: any) => !t.completed).length;
  const total = tasks.length || 1;
  const rate = Math.round((completedCount / total) * 100);

  // Real Weekly Logic: Map tasks to days of week based on created_at
  const getWeeklyData = () => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const counts = new Array(7).fill(0);

    tasks.forEach((t: any) => {
      const date = new Date(t.created_at || Date.now());
      counts[date.getDay()]++;
    });

    // Rotate to start from MON
    const rotatedCounts = [...counts.slice(1), counts[0]];
    const rotatedDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

    return rotatedDays.map((name, i) => ({
      name,
      tasks: rotatedCounts[i],
      // If we have no real data yet, show a subtle base pulse
      h: Math.max((rotatedCounts[i] / (Math.max(...counts) || 1)) * 100, 10)
    }));
  };

  const weeklyData = getWeeklyData();

  if (loading) return (
    <div className={`border border-white/5 bg-white/[0.01] rounded-[2rem] p-8 animate-pulse h-[450px] ${className}`}>
      <div className="h-6 w-32 bg-white/5 rounded mb-8"></div>
      <div className="h-full w-full bg-white/5 rounded-2xl"></div>
    </div>
  );

  return (
    <div className={`relative border border-white/10 bg-black/40 backdrop-blur-xl rounded-[2.5rem] p-8 flex flex-col h-[450px] overflow-hidden group/main ${className}`}>
      {/* Light Leak */}
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#8b5cf6]/20 blur-[120px] rounded-full pointer-events-none group-hover/main:bg-[#8b5cf6]/30 transition-all duration-1000"></div>

      {/* Header */}
      <div className="flex items-start justify-between relative z-10 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-[#8b5cf6] animate-pulse shadow-[0_0_10px_#8b5cf6]"></div>
            <span className="text-[10px] font-black text-[#8b5cf6] tracking-[0.4em] uppercase">Visual.Core</span>
          </div>
          <h3 className="text-2xl font-black text-white tracking-tighter leading-none mb-1">ANALYTICS HUB</h3>
          <p className="text-xs text-white/30 font-medium tracking-wide">Real-time data synchronization active</p>
        </div>

        <div className="flex items-center bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl">
          {[
            { id: 'weekly', icon: FaChartBar },
            { id: 'status', icon: FaChartPie },
            { id: 'completion', icon: FaChartLine },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setAnimate(false); setActiveChart(tab.id as any); setTimeout(() => setAnimate(true), 50); }}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-500 ${
                activeChart === tab.id
                ? 'bg-[#8b5cf6] text-white shadow-[0_0_25px_rgba(139,92,246,0.6)] scale-110'
                : 'text-white/20 hover:text-white/50 hover:bg-white/5'
              }`}
            >
              <tab.icon className="text-sm" />
            </button>
          ))}
        </div>
      </div>

      {/* Custom SVG Chart Engine (100% Reliable & REAL) */}
      <div className="flex-1 w-full relative z-10 flex items-center justify-center min-h-0">
        {activeChart === 'weekly' && (
          <div className="w-full h-full flex items-end justify-between px-2 gap-3">
            {weeklyData.map((day, i) => (
              <div key={i} className="flex-1 group/bar relative h-full flex flex-col justify-end">
                <div
                  className={`w-full bg-gradient-to-t from-[#8b5cf6]/10 to-[#8b5cf6]/40 border border-[#8b5cf6]/30 rounded-t-xl transition-all duration-[1500ms] cubic-bezier(0.34, 1.56, 0.64, 1)`}
                  style={{ height: animate ? `${day.h}%` : '0%', transitionDelay: `${i * 100}ms` }}
                >
                   <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-[#8b5cf6] text-white px-2 py-0.5 rounded text-[10px] font-black">{day.tasks}</div>
                </div>
                <span className="text-[9px] font-black text-white/20 mt-4 text-center">{day.name}</span>
              </div>
            ))}
          </div>
        )}

        {activeChart === 'status' && (
          <div className="relative w-56 h-56 flex items-center justify-center">
             <svg className="w-full h-full p-2 overflow-visible" viewBox="0 0 100 100">
               {/* Background Track */}
               <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="8" />
               {/* Progress Ring */}
               <circle
                cx="50" cy="50" r="40" fill="none" stroke="#8b5cf6" strokeWidth="8"
                strokeDasharray="251.2"
                strokeDashoffset={animate ? 251.2 - (251.2 * rate / 100) : 251.2}
                strokeLinecap="round"
                className="transition-all duration-[2000ms] cubic-bezier(0.16, 1, 0.3, 1)"
                style={{ filter: 'drop-shadow(0 0 12px rgba(139,92,246,0.6))' }}
               />
             </svg>
             <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-5xl font-black text-white tracking-tighter transition-all duration-1000 scale-[1] group-hover/main:scale-110">{rate}%</span>
                <span className="text-[10px] font-black text-[#8b5cf6] tracking-[0.3em] uppercase opacity-60">Success</span>
             </div>
          </div>
        )}

        {activeChart === 'completion' && (
          <div className="w-full h-full px-2 flex flex-col justify-center">
             <div className="flex items-center justify-between mb-12">
                <div className="p-4 rounded-3xl bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 shadow-inner">
                   <FaChartLine className="text-3xl text-[#8b5cf6] animate-bounce" />
                </div>
                <div className="text-right">
                   <p className="text-4xl font-black text-white tracking-tighter">+{rate > 50 ? 'Elite' : 'Synced'}</p>
                   <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Performance Tier</p>
                </div>
             </div>
             <div className="space-y-6">
                {[
                  { label: 'Completed Energy', val: completedCount, color: '#10b981', max: tasks.length },
                  { label: 'Pending Buffering', val: pendingCount, color: '#3b82f6', max: tasks.length },
                  { label: 'Neural Precision', val: rate, color: '#8b5cf6', max: 100 },
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-[9px] font-black text-white/40 uppercase tracking-widest">
                      <span>{item.label}</span>
                      <span className="text-white">{item.val}{item.label.includes('Precision') ? '%' : ''}</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full transition-all duration-[1500ms] shadow-[0_0_10px]" style={{ width: animate ? `${(item.val / (item.max || 1)) * 100}%` : '0%', backgroundColor: item.color, transitionDelay: `${i * 200}ms` }} />
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>

      {/* Footer Metrics */}
      <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-8 mt-6 relative z-10">
        {[
          { label: 'PENDING', val: pendingCount, icon: FaBolt, color: '#8b5cf6' },
          { label: 'DONE', val: completedCount, icon: FaLayerGroup, color: '#10b981' },
          { label: 'TOTAL', val: tasks.length, icon: FaCircle, color: '#3b82f6', pulse: true },
        ].map((item, i) => (
          <div key={i} className="flex flex-col items-center group/item transition-transform">
            <div className={`mb-2 transition-all group-hover/item:scale-125`} style={{ color: item.color }}>
              <item.icon className="text-[10px]" />
            </div>
            <span className="text-[10px] font-black text-white tracking-widest leading-none mb-1">{item.val}</span>
            <span className="text-[8px] font-black text-white/20 tracking-[0.2em]">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskInsightsCharts;
