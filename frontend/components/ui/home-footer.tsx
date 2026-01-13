// frontend/components/ui/home-footer.tsx
'use client';

import React from 'react';
import { FaTasks, FaGithub, FaLinkedin, FaTwitter, FaEnvelope, FaPhone } from 'react-icons/fa';

const HomeFooter: React.FC = () => {
  return (
    <footer className="py-16 border-t border-white/10 bg-gradient-to-b from-[#0a0a0f]/80 to-black/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                <FaTasks className="text-white text-lg" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  TasklyPro
                </span>
                <p className="text-xs text-gray-400 mt-1">Professional Task Management</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Empowering teams and individuals to achieve more with intelligent task management and productivity insights.
            </p>
            <div className="flex items-center space-x-4 pt-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gradient-to-br from-purple-500/30 to-pink-500/30 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-purple-500/20"
                aria-label="GitHub"
              >
                <FaGithub className="text-lg" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gradient-to-br from-blue-500/30 to-cyan-500/30 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/20"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="text-lg" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gradient-to-br from-sky-500/30 to-blue-500/30 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-sky-500/20"
                aria-label="Twitter"
              >
                <FaTwitter className="text-lg" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></span>
              Product
            </h3>
            <ul className="space-y-3">
              {[
                { name: 'Features', href: '#features' },
                { name: 'Solutions', href: '#' },
                { name: 'Pricing', href: '#' },
                { name: 'Integrations', href: '#' },
                { name: 'Updates', href: '#' }
              ].map((item, index) => (
                <li key={index}>
                  <a
                    href={item.href}
                    className="text-gray-400 hover:text-purple-400 transition-colors duration-300 text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-purple-400 transition-colors"></span>
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></span>
              Resources
            </h3>
            <ul className="space-y-3">
              {[
                { name: 'Documentation', href: '#' },
                { name: 'Guides', href: '#' },
                { name: 'Blog', href: '#' },
                { name: 'Support', href: '#' },
                { name: 'API', href: '#' }
              ].map((item, index) => (
                <li key={index}>
                  <a
                    href={item.href}
                    className="text-gray-400 hover:text-blue-400 transition-colors duration-300 text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-blue-400 transition-colors"></span>
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Legal */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></span>
              Company
            </h3>
            <ul className="space-y-3 mb-6">
              {[
                { name: 'About Us', href: '#' },
                { name: 'Careers', href: '#' },
                { name: 'Contact', href: '#' },
                { name: 'Partners', href: '#' }
              ].map((item, index) => (
                <li key={index}>
                  <a
                    href={item.href}
                    className="text-gray-400 hover:text-green-400 transition-colors duration-300 text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-green-400 transition-colors"></span>
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>

            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                <FaEnvelope className="text-purple-400 text-xs flex-shrink-0" />
                <span>contact@tasklypro.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                <FaPhone className="text-blue-400 text-xs flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} TasklyPro. All rights reserved.
          </div>
          <div className="flex items-center space-x-6 text-sm">
            <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors duration-300">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors duration-300">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors duration-300">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;