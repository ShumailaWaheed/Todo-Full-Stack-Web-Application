// frontend/components/ui/home-footer.tsx
'use client';

import React from 'react';
import { FaTasks, FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';

const HomeFooter: React.FC = () => {
  return (
    <footer className="py-12 border-t border-white/5 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <FaTasks className="text-white text-lg" />
            </div>
            <span className="text-xl font-bold text-white">TasklyPro</span>
          </div>
          <div className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} TasklyPro. All rights reserved.
          </div>
          <div className="flex items-center space-x-4">
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-purple-500/30 transition-all duration-300 hover:scale-110">
              <FaGithub className="text-lg" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-500/30 transition-all duration-300 hover:scale-110">
              <FaLinkedin className="text-lg" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-sky-500/30 transition-all duration-300 hover:scale-110">
              <FaTwitter className="text-lg" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;