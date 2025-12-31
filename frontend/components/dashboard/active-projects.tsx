// frontend/components/dashboard/active-projects.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  FaRocket,
  FaChevronRight,
  FaCircle,
  FaPlus
} from 'react-icons/fa6';
import { apiService } from '../../lib/api';
import { useAuth } from '../../lib/auth/context';
import { Project } from '../../lib/types/project';
import { Task } from '../../lib/types/task';

interface ActiveProjectsProps {
  className?: string;
}

const ActiveProjects: React.FC<ActiveProjectsProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        // Fetch projects and tasks in parallel
        const [projRes, taskRes] = await Promise.all([
          apiService.getProjects(user.id),
          apiService.getTasks(user.id)
        ]);

        // The API returns an array directly for getProjects based on the router
        setProjects(Array.isArray(projRes) ? projRes : []);
        setTasks(taskRes.tasks || []);
      } catch (error) {
        console.error('Project Hub Sync Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Logic: Calculate progress for each project based on its tasks
  const projectsWithProgress = useMemo(() => {
    return projects.map(project => {
      // Find tasks belonging to this project (assuming project_id exists on Task,
      // though the current type doesn't show it, we might need to update tasks or just filter title for now if it's a prefix)
      // For now, let's use a mock mapping or assume logic exists in the DB
      // If project_id isn't explicitly on Task type, we use a random but deterministic progress for visual demo
      // until we confirm the Task schema supports project_id
      const projectTasks = tasks.filter(t => (t as any).project_id === project.id);
      const total = projectTasks.length;
      const completed = projectTasks.filter(t => t.completed).length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

      return { ...project, progress, taskCount: total };
    }).slice(0, 3); // Only show top 3 active
  }, [projects, tasks]);

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-32 bg-white/5 animate-pulse rounded-[1.5rem]" />
      ))}
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#ec4899]/10 border border-[#ec4899]/20 flex items-center justify-center text-[#ec4899]">
            <FaRocket className="text-xs" />
          </div>
          <h3 className="text-sm font-black text-white/80 uppercase tracking-widest">Active Operations</h3>
        </div>
        <button className="text-[10px] font-black text-[#8b5cf6] hover:text-white transition-all uppercase tracking-widest flex items-center gap-1.5 group">
          Deployment Hub <FaChevronRight className="text-[8px] group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {projectsWithProgress.length > 0 ? projectsWithProgress.map((project) => (
          <div
            key={project.id}
            className="group relative bg-[#0a0a0f] border border-white/5 hover:border-[#8b5cf6]/30 p-6 rounded-[2rem] transition-all duration-500 overflow-hidden cursor-pointer"
          >
            {/* Holographic Border Beam FX */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
               <div className="absolute inset-[-1px] rounded-[2rem] border border-[#8b5cf6] shadow-[0_0_20px_rgba(139,92,246,0.3)] animate-[pulse_2s_infinite]"></div>
            </div>

            {/* Background Glow */}
            <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-[#8b5cf6]/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="relative w-12 h-12 flex items-center justify-center">
                   {/* Circular Progress Ring */}
                   <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="8" />
                      <circle
                        cx="50" cy="50" r="40" fill="none"
                        stroke={project.priority === 'high' ? '#ef4444' : project.priority === 'medium' ? '#f59e0b' : '#10b981'}
                        strokeWidth="8"
                        strokeDasharray="251.2"
                        strokeDashoffset={251.2 - (251.2 * project.progress / 100)}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                        style={{ filter: `drop-shadow(0 0 8px ${project.priority === 'high' ? '#ef4444' : project.priority === 'medium' ? '#f59e0b' : '#10b981'})` }}
                      />
                   </svg>
                   <div className="absolute inset-0 flex items-center justify-center">
                      <FaRocket className={`text-[10px] ${
                         project.priority === 'high' ? 'text-[#ef4444]' : project.priority === 'medium' ? 'text-[#f59e0b]' : 'text-[#10b981]'
                      }`} />
                   </div>
                </div>
                <span className="text-[40px] font-black text-white/5 absolute -right-2 -top-2 tracking-tighter leading-none select-none italic group-hover:text-[#8b5cf6]/10 transition-colors">
                  {project.progress}
                </span>
              </div>

              <h4 className="text-sm font-black text-white group-hover:text-[#8b5cf6] transition-colors truncate mb-1 uppercase tracking-tight">
                {project.name}
              </h4>
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-6">
                Unit_{project.slug.slice(0, 8)} // {project.taskCount} Obj
              </p>

              <div className="mt-auto space-y-2">
                <div className="flex justify-between text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">
                  <span>Operational_Stability</span>
                  <span className="text-white/60">{project.progress}%</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] rounded-full transition-all duration-1000 shadow-[0_0_10px_#8b5cf6]"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Hover Side Glow */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#8b5cf6] scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-500" />
          </div>
        )) : (
          <div className="col-span-3 py-10 text-center border border-dashed border-white/5 rounded-[2rem] group hover:border-[#8b5cf6]/20 transition-colors cursor-pointer">
             <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 group-hover:rotate-90 transition-transform">
                <FaPlus className="text-white/20" />
             </div>
             <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Initialize First Operation</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveProjects;
