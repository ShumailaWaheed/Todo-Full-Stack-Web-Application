// frontend/app/dashboard/page.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../lib/auth/context';
import { apiService } from '../../lib/api';
import { Task } from '../../lib/types/task';
import { useToast } from '../../components/ui/toast';
import {
  FaFire,
  FaCheck,
  FaClock,
  FaFolder,
  FaStar,
  FaBolt,
  FaChartLine,
} from 'react-icons/fa6';

// Components
import AddTaskSection from '../../components/dashboard/add-task-section';
import TaskInsightsCharts from '../../components/dashboard/task-insights-charts';
import TodaysFocus from '../../components/dashboard/todays-focus';
import RecentTasks from '../../components/dashboard/recent-tasks';
import ActivityHeatmap from '../../components/dashboard/activity-heatmap';

const DashboardPage: React.FC = () => {
  const { user, loading } = useAuth();
  const { addToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [greeting, setGreeting] = useState('');

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingData(true);
      const response = await apiService.getTasks(user.id);
      setTasks(response.tasks || []);
    } catch (error) {
      console.error('Data Sync Error:', error);
      addToast({
        type: 'error',
        title: 'Sync Failed',
        message: 'Could not retrieve dashboard data. Please try again.'
      });
    } finally {
      setLoadingData(false);
    }
  }, [user, addToast]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Strategize');
    else if (hour < 18) setGreeting('Execute');
    else setGreeting('Review');

    if (user && !loading) fetchData();
  }, [user, loading, fetchData]);

  // Listen for chatbot task events to refresh dashboard data
  useEffect(() => {
    const refresh = () => fetchData();
    window.addEventListener('taskCreated', refresh);
    window.addEventListener('taskUpdated', refresh);
    window.addEventListener('taskToggled', refresh);
    window.addEventListener('taskDeleted', refresh);
    return () => {
      window.removeEventListener('taskCreated', refresh);
      window.removeEventListener('taskUpdated', refresh);
      window.removeEventListener('taskToggled', refresh);
      window.removeEventListener('taskDeleted', refresh);
    };
  }, [fetchData]);

  // REAL LOGIC CALCULATIONS
  const activeTasks = useMemo(() => tasks.filter(t => !t.completed), [tasks]);
  const completedTasks = useMemo(() => tasks.filter(t => t.completed), [tasks]);
  const highPriority = useMemo(() => activeTasks.filter(t => t.priority === 'high'), [activeTasks]);

  const productivityScore = useMemo(() => {
    if (tasks.length === 0) return 0;
    return Math.round((completedTasks.length / tasks.length) * 100);
  }, [tasks, completedTasks]);

  const stats = useMemo(() => [
    { label: 'ACTIVE', value: activeTasks.length, icon: FaClock, color: '#3b82f6' },
    { label: 'COMPLETED', value: completedTasks.length, icon: FaCheck, color: '#10b981' },
    { label: 'PENDING', value: activeTasks.length, icon: FaFolder, color: '#8b5cf6' },
    { label: 'PRODUCTIVITY', value: productivityScore, icon: FaFire, color: HighScoreColor(productivityScore) },
  ], [activeTasks.length, completedTasks.length, productivityScore]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-2 border-[#8b5cf6]/20 rounded-full"></div>
        <div className="absolute inset-0 border-t-2 border-[#8b5cf6] rounded-full animate-spin"></div>
      </div>
    </div>
  );

  const dynamicGreeting = useMemo(() => {
    if (productivityScore >= 80) return 'Optimize';
    if (productivityScore >= 50) return 'Execute';
    if (activeTasks.length > 0) return 'Intercept';
    return 'Strategize';
  }, [productivityScore, activeTasks.length]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 lg:p-8 animate-in fade-in duration-1000">
      {/* Header: Personal Neural Briefing */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-[#8b5cf6] animate-pulse shadow-[0_0_10px_#8b5cf6]"></div>
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">TASK MANAGER READY</span>
          </div>
          <h1 className="text-xl sm:text-3xl lg:text-5xl font-black text-white tracking-tighter">
            TIME TO <span className="text-[#8b5cf6]">{dynamicGreeting.toUpperCase()}</span>, {userName().toUpperCase()}
          </h1>
          <p className="text-sm text-white/30 mt-2 font-medium max-w-xl leading-relaxed">
            {productivityScore > 70
              ? `Excellent performance! You have completed ${completedTasks.length} tasks today.`
              : `Ready to work. ${activeTasks.length} tasks are waiting for your attention.`}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
           <div className="px-4 py-2 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md flex items-center gap-3">
              <FaStar className="text-[#f59e0b] text-xs" />
              <span className="text-[10px] font-bold text-white/60 tracking-widest lowercase">system_uptime: 99.9%</span>
           </div>
        </div>
      </div>

      {/* Stats row with "Data-Pop" animation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="group relative border border-white/5 bg-black/20 p-3 sm:p-6 rounded-xl sm:rounded-[2rem] transition-all duration-500 hover:bg-[#8b5cf6]/5 hover:border-[#8b5cf6]/20 overflow-hidden"
          >
            {/* Glossy Reflection FX */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
               <div className="absolute top-[-100%] left-[-100%] w-[300%] h-[300%] bg-gradient-to-br from-white/10 via-transparent to-transparent rotate-45 transform group-hover:translate-x-1/2 group-hover:translate-y-1/2 transition-transform duration-[1500ms]"></div>
            </div>

            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/5 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3">
                <stat.icon className="text-sm" style={{ color: stat.color }} />
              </div>
              <div className="text-right">
                <h4 className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">{stat.label}</h4>
                <p className="text-xl sm:text-3xl font-black text-white mt-1">
                  {loadingData ? '..' : stat.value}
                </p>
              </div>
            </div>
            {/* Tiny trend sparkline */}
            <div className="flex gap-1 h-4 items-end opacity-20 group-hover:opacity-100 transition-opacity">
               {[40, 70, 50, 90, 60].map((h, j) => <div key={j} className="flex-1 bg-white/20 rounded-full" style={{ height: `${h}%` }} />)}
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Multi-Stage Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Primary (Automation & Capture) */}
        <div className="lg:col-span-7 space-y-8">
           <AddTaskSection />

           {/* Real Performance Index */}
           <div className="p-4 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent relative overflow-hidden group">
              {/* Holographic Border Beam */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                 <div className="absolute inset-[-1px] rounded-[2.5rem] border border-[#8b5cf6]/40 shadow-[0_0_30px_rgba(139,92,246,0.2)]"></div>
              </div>

              <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-1000">
                <FaChartLine className="text-[180px] text-white" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <FaBolt className="text-[#8b5cf6] text-xs" />
                  <span className="text-[10px] font-black text-[#8b5cf6] uppercase tracking-[0.4rem]">Productivity Score</span>
                </div>

                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-4xl sm:text-7xl font-black text-white tracking-tighter italic">{productivityScore}</span>
                  <span className="text-xl font-bold text-white/10 uppercase tracking-widest">Index</span>
                </div>

                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-6">
                   <div
                    className="h-full bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] rounded-full transition-all duration-[2000ms] shadow-[0_0_20px_rgba(139,92,246,0.5)]"
                    style={{ width: `${productivityScore}%` }}
                   />
                </div>

                <p className="text-sm text-white/40 leading-relaxed font-medium">
                  {productivityScore > 50
                    ? "Your productivity is high. Keep up the great work!"
                    : "Consider focusing on high-priority tasks to boost your productivity."}
                </p>
              </div>
           </div>

           <TodaysFocus className="p-2" />
        </div>

        {/* Right Secondary (Analytics & Feed) */}
        <div className="lg:col-span-5 relative">
           <div className="lg:sticky lg:top-12 space-y-8 pb-12">
              <ActivityHeatmap tasks={tasks} />
              <TaskInsightsCharts />
              <RecentTasks />
           </div>
        </div>
      </div>
    </div>
  );

  function userName(): string {
    if (!user) return 'Loading...';
    return user.name || user.email.split('@')[0];
  }

  function HighScoreColor(score: number) {
    if (score > 80) return '#10b981';
    if (score > 40) return '#f59e0b';
    return '#8b5cf6';
  }
};

export default DashboardPage;
