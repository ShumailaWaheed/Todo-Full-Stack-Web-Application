// frontend/components/dashboard/global-search.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FaMagnifyingGlass as FaSearch,
  FaTerminal,
  FaRocket,
  FaXmark
} from 'react-icons/fa6';
import { apiService } from '../../lib/api';
import { useAuth } from '../../lib/auth/context';
import { Task } from '../../lib/types/task';
import { Project } from '../../lib/types/project';

const GlobalSearch: React.FC = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ tasks: Task[], projects: Project[] }>({ tasks: [], projects: [] });
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleSearch = async () => {
      if (!user || query.length < 2) {
        setResults({ tasks: [], projects: [] });
        return;
      }

      setLoading(true);
      try {
        const [taskRes, projRes] = await Promise.all([
          apiService.getTasks(user.id),
          apiService.getProjects(user.id)
        ]);

        const filteredTasks = (taskRes.tasks || []).filter(t =>
          t.title.toLowerCase().includes(query.toLowerCase()) ||
          t.description?.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5);

        const filteredProjects = (Array.isArray(projRes) ? projRes : []).filter(p =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.description?.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 3);

        setResults({ tasks: filteredTasks, projects: filteredProjects });
      } catch (err) {
        console.error('Search Sync Error:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(handleSearch, 300);
    return () => clearTimeout(debounce);
  }, [query, user]);

  return (
    <div ref={searchRef} className="relative z-50">
      <div className={`
        flex items-center gap-4 bg-white/[0.03] border transition-all duration-500 rounded-2xl px-5 py-2.5
        ${isFocused ? 'border-[#8b5cf6]/50 bg-white/[0.06] w-84 shadow-[0_0_30px_rgba(139,92,246,0.1)]' : 'border-white/5 w-64'}
      `}>
        <FaSearch className={`text-xs transition-colors duration-500 ${isFocused ? 'text-[#8b5cf6]' : 'text-white/20'}`} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="QUERY SYSTEM..."
          className="bg-transparent border-none outline-none text-[10px] font-black tracking-[0.2em] text-white placeholder:text-white/10 w-full"
        />
        {query && (
          <button onClick={() => setQuery('')} className="text-white/20 hover:text-white transition-colors">
            <FaXmark className="text-[10px]" />
          </button>
        )}
      </div>

      {/* SEARCH ENGINE OVERLAY */}
      {isFocused && (query.length >= 2 || results.tasks.length > 0 || results.projects.length > 0) && (
        <div className="absolute top-14 left-0 right-0 bg-black/90 backdrop-blur-3xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.9)] animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="p-4 space-y-4">
            {/* Project Results */}
            {results.projects.length > 0 && (
              <div>
                <h5 className="text-[8px] font-black text-[#8b5cf6] uppercase tracking-[0.4em] mb-3 px-2">Active_Operations</h5>
                <div className="space-y-1">
                  {results.projects.map(p => (
                    <div key={p.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-colors cursor-pointer group">
                      <div className="w-6 h-6 rounded-lg bg-[#8b5cf6]/10 flex items-center justify-center text-[#8b5cf6]">
                        <FaRocket className="text-[10px]" />
                      </div>
                      <span className="text-[10px] font-bold text-white/80 group-hover:text-white truncate">{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Task Results */}
            {results.tasks.length > 0 && (
              <div>
                <h5 className="text-[8px] font-black text-[#10b981] uppercase tracking-[0.4em] mb-3 px-2">Neutralized_Targets</h5>
                <div className="space-y-1">
                  {results.tasks.map(t => (
                    <div key={t.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-colors cursor-pointer group">
                      <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-white/40">
                        <FaTerminal className="text-[10px]" />
                      </div>
                      <span className="text-[10px] font-bold text-white/60 group-hover:text-white truncate">{t.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!loading && results.tasks.length === 0 && results.projects.length === 0 && query.length >= 2 && (
              <div className="py-8 text-center">
                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">No matching vectors found</p>
              </div>
            )}

            {loading && (
              <div className="py-8 flex justify-center">
                <div className="w-4 h-4 border-2 border-[#8b5cf6]/20 border-t-[#8b5cf6] rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          <div className="bg-white/[0.02] p-3 border-t border-white/5 text-center">
             <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Neural_Search_V2.0.4</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
