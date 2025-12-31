// frontend/app/dashboard/analytics/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../lib/auth/context';
import { apiService } from '../../../lib/api';
import { Task } from '../../../lib/types/task';
import {
  FaChartLine,
  FaArrowTrendUp,
  FaBolt,
  FaLayerGroup,
  FaCircle,
  FaClock,
  FaCheck,
  FaTerminal
} from 'react-icons/fa6';
import TaskInsightsCharts from '../../../components/dashboard/task-insights-charts';

const IntelligencePage: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const res = await apiService.getTasks(user.id);
        setTasks(res.tasks || []);
      } catch (err) {
        console.error('Intelligence Sync Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const stats = useMemo(() => {
    const total = tasks.length || 1;
    const completed = tasks.filter(t => t.completed).length;
    const rate = Math.round((completed / total) * 100);
    const active = tasks.filter(t => !t.completed).length;
    const high = tasks.filter(t => !t.completed && t.priority === 'high').length;

    return [
      { label: 'Neural_Efficiency', value: `${rate}%`, icon: FaBolt, color: '#8b5cf6' },
      { label: 'Active_Vectors', value: active, icon: FaClock, color: '#3b82f6' },
      { label: 'High_Risk_Objectives', value: high, icon: FaArrowTrendUp, color: '#ef4444' },
      { label: 'Neutralized_Total', value: completed, icon: FaCheck, color: '#10b981' },
    ];
  }, [tasks]);

  if (loading) return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
       <div className="h-20 bg-white/5 animate-pulse rounded-2xl" />
       <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white/5 animate-pulse rounded-3xl" />)}
       </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 p-4 lg:p-8 animate-in fade-in duration-1000">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <FaChartLine className="text-[#8b5cf6] text-xs" />
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Intelligence_Deep_Scan</span>
           </div>
           <h1 className="text-4xl font-black text-white tracking-tighter uppercase font-mono">System Analytics</h1>
           <p className="text-white/20 text-[10px] mt-1 font-bold uppercase tracking-widest">Real-time neural feedback enabled</p>
        </div>

        <div className="flex items-center gap-4">
           <div className="px-5 py-2.5 rounded-2xl bg-[#8b5cf6]/5 border border-[#8b5cf6]/20 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></div>
              <span className="text-[9px] font-black text-white uppercase tracking-widest">Global_Sync_Stable</span>
           </div>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="group relative p-8 rounded-[2.5rem] bg-black/40 border border-white/5 hover:border-[#8b5cf6]/30 transition-all duration-500 overflow-hidden">
             {/* Hover Glow */}
             <div className="absolute -inset-1 bg-gradient-to-br from-[#8b5cf6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

             <div className="relative z-10">
                <s.icon className="text-xl mb-4" style={{ color: s.color }} />
                <h4 className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">{s.label}</h4>
                <p className="text-4xl font-black text-white tracking-tighter italic">{s.value}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
           {/* Reusing our High-End Chart Engine */}
           <TaskInsightsCharts className="h-[600px] bg-black/40 border border-white/5" />
        </div>

        <div className="lg:col-span-4 space-y-10">
           {/* Detailed Performance Metrics */}
           <div className="p-8 rounded-[3rem] border border-white/10 bg-gradient-to-br from-white/[0.02] to-transparent backdrop-blur-xl">
              <h3 className="text-xs font-black text-[#8b5cf6] uppercase tracking-[0.3em] mb-10">Performance_Matrix</h3>

              <div className="space-y-12">
                 {[
                   { label: 'Operational_Uptime', val: 99.8, color: '#8b5cf6' },
                   { label: 'Neural_Precision', val: 74.2, color: '#ec4899' },
                   { label: 'Response_Velocity', val: 88.5, color: '#f59e0b' }
                 ].map((m, i) => (
                   <div key={i} className="space-y-3">
                      <div className="flex justify-between items-end">
                         <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{m.label}</span>
                         <span className="text-sm font-black text-white">{m.val}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                         <div
                          className="h-full rounded-full animate-in slide-in-from-left duration-1000"
                          style={{ width: `${m.val}%`, backgroundColor: m.color, boxShadow: `0 0 10px ${m.color}` }}
                         />
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="p-8 rounded-[3rem] border border-white/5 bg-black/20 text-center py-12">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/5">
                 <FaTerminal className="text-[#8b5cf6] text-xs" />
              </div>
              <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-1">Export_Logs</h4>
              <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Download full tactical history</p>
              <button className="mt-8 px-8 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#8b5cf6]/40 transition-all text-[9px] font-black text-white uppercase tracking-widest">Initialize_Export</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default IntelligencePage;
