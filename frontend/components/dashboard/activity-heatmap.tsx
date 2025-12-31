// frontend/components/dashboard/activity-heatmap.tsx
'use client';

import React, { useMemo } from 'react';
import { FaFire } from 'react-icons/fa6';
import { Task } from '../../lib/types/task';

interface ActivityHeatmapProps {
  tasks: Task[];
}

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ tasks }) => {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Logic: Calculate activity intensity for the last 14 days
  const heatData = useMemo(() => {
    const data = [];
    const today = new Date();

    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateStr = date.toDateString();

      const count = tasks.filter(t =>
        t.completed && new Date(t.updated_at || '').toDateString() === dateStr
      ).length;

      data.push({
        day: days[date.getDay()],
        intensity: count, // 0, 1, 2, 3+
        date: dateStr
      });
    }
    return data;
  }, [tasks]);

  const getIntensityColor = (intensity: number) => {
    if (intensity === 0) return 'bg-white/[0.03] border-white/5';
    if (intensity === 1) return 'bg-[#8b5cf6]/20 border-[#8b5cf6]/30';
    if (intensity === 2) return 'bg-[#8b5cf6]/50 border-[#8b5cf6]/50 shadow-[0_0_10px_rgba(139,92,246,0.3)]';
    return 'bg-[#8b5cf6] border-[#8b5cf6] shadow-[0_0_15px_#8b5cf6]';
  };

  return (
    <div className="p-6 rounded-[2rem] border border-white/5 bg-black/20 backdrop-blur-md">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/20 flex items-center justify-center text-[#f59e0b]">
          <FaFire className="text-xs" />
        </div>
        <div>
          <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Neural_Activity</h4>
          <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest leading-none">Intelligence Stream</p>
        </div>
      </div>

      <div className="flex items-end gap-2 h-20 px-2 justify-between">
        {heatData.map((data, i) => (
          <div key={i} className="flex flex-col items-center gap-2 flex-1">
            <div
              className={`w-full rounded-md border transition-all duration-700 group relative ${getIntensityColor(data.intensity)}`}
              style={{ height: `${Math.max(20, (data.intensity + 1) * 20)}%` }}
            >
               {/* Tooltip */}
               <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-black border border-white/10 text-[8px] font-black text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
                  {data.intensity} Operations
               </div>
            </div>
            <span className="text-[8px] font-black text-white/10 uppercase">{data.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityHeatmap;
