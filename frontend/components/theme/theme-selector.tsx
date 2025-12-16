'use client';

import React from 'react';
import { useTheme } from '../../lib/theme/context';
import { FaSun, FaMoon, FaPalette } from 'react-icons/fa';

const ThemeSelector: React.FC = () => {
  const { theme, toggleTheme, setAccentColor } = useTheme();

  const accentColors = [
    { name: 'Purple-Pink', value: 'from-purple-500 to-pink-500', preview: 'bg-gradient-to-r from-purple-500 to-pink-500' },
    { name: 'Blue-Teal', value: 'from-blue-500 to-teal-500', preview: 'bg-gradient-to-r from-blue-500 to-teal-500' },
    { name: 'Green-Yellow', value: 'from-green-500 to-yellow-500', preview: 'bg-gradient-to-r from-green-500 to-yellow-500' },
    { name: 'Red-Orange', value: 'from-red-500 to-orange-500', preview: 'bg-gradient-to-r from-red-500 to-orange-500' },
    { name: 'Indigo-Purple', value: 'from-indigo-500 to-purple-500', preview: 'bg-gradient-to-r from-indigo-500 to-purple-500' },
  ];

  return (
    <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
      <div className="flex items-center mb-4">
        <FaPalette className="text-purple-400 mr-2" />
        <h3 className="text-lg font-semibold text-white">Theme Settings</h3>
      </div>

      {/* Theme Toggle */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">Theme Mode</label>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 ${
              theme.mode === 'dark'
                ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-purple-300 border border-purple-500/30'
                : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <FaMoon className="mr-2" />
            {theme.mode === 'dark' ? 'Dark' : 'Light'}
          </button>
        </div>
      </div>

      {/* Accent Color Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Accent Color</label>
        <div className="grid grid-cols-3 gap-2">
          {accentColors.map((color) => (
            <button
              key={color.value}
              onClick={() => setAccentColor(color.value)}
              className={`flex flex-col items-center p-2 rounded-lg transition-all duration-300 ${
                theme.accentColor === color.value
                  ? 'ring-2 ring-offset-2 ring-purple-500/50 bg-gray-700/30'
                  : 'hover:bg-gray-700/30'
              }`}
            >
              <div className={`w-8 h-8 rounded-full ${color.preview}`}></div>
              <span className="text-xs mt-1 text-gray-400">{color.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;