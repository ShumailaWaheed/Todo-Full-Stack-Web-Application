// frontend/app/dashboard/projects/page.tsx
'use client';

import React from 'react';
import { FaFolder, FaPlus, FaSearch, FaEllipsisV, FaStar, FaRegClock, FaCheckCircle } from 'react-icons/fa';

const ProjectsPage: React.FC = () => {
  // Mock data for projects
  const projects = [
    {
      id: 1,
      name: 'Website Redesign',
      description: 'Complete overhaul of company website',
      status: 'active',
      progress: 75,
      tasks: { completed: 15, total: 20 },
      members: 4,
      dueDate: '2025-01-15',
    },
    {
      id: 2,
      name: 'Mobile App',
      description: 'New mobile application for customers',
      status: 'active',
      progress: 45,
      tasks: { completed: 9, total: 20 },
      members: 6,
      dueDate: '2025-02-28',
    },
    {
      id: 3,
      name: 'Marketing Campaign',
      description: 'Q1 marketing initiative',
      status: 'completed',
      progress: 100,
      tasks: { completed: 12, total: 12 },
      members: 3,
      dueDate: '2024-12-31',
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center">
          <FaFolder className="text-purple-400 text-2xl mr-3" />
          <h1 className="text-2xl font-bold text-white">Projects</h1>
        </div>
        <p className="text-gray-400 mt-2">Manage and track your projects</p>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        <button className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg shadow-purple-500/20">
          <FaPlus className="mr-2" />
          New Project
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-teal-500/20 mr-4">
              <FaFolder className="text-blue-400 text-xl" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Projects</p>
              <p className="text-2xl font-bold text-white">{projects.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-gradient-to-r from-green-500/20 to-teal-500/20 mr-4">
              <FaCheckCircle className="text-green-400 text-xl" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Completed</p>
              <p className="text-2xl font-bold text-white">{projects.filter(p => p.status === 'completed').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500/20 to-yellow-500/20 mr-4">
              <FaRegClock className="text-orange-400 text-xl" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">In Progress</p>
              <p className="text-2xl font-bold text-white">{projects.filter(p => p.status === 'active').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 mr-4">
              <FaStar className="text-purple-400 text-xl" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Team Members</p>
              <p className="text-2xl font-bold text-white">{projects.reduce((sum, p) => sum + p.members, 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Active Projects</h2>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50 transition-colors duration-200 text-sm">
              Filter
            </button>
            <button className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50 transition-colors duration-200 text-sm">
              Sort
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-gray-700/40 hover:bg-gray-700/50 rounded-xl p-6 border border-gray-600/40 transition-all duration-200"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20">
                    <FaFolder className="text-purple-400 text-xl" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-bold text-white">{project.name}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        project.status === 'active'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {project.status === 'active' ? 'Active' : 'Completed'}
                      </span>
                    </div>
                    <p className="text-gray-400 mt-1">{project.description}</p>

                    <div className="flex items-center mt-4 space-x-6">
                      <div className="flex items-center text-sm text-gray-400">
                        <FaCheckCircle className="mr-1.5 text-green-400" />
                        {project.tasks.completed}/{project.tasks.total} tasks
                      </div>
                      <div className="flex items-center text-sm text-gray-400">
                        <FaRegClock className="mr-1.5 text-orange-400" />
                        Due {project.dueDate}
                      </div>
                      <div className="flex items-center text-sm text-gray-400">
                        <FaStar className="mr-1.5 text-purple-400" />
                        {project.members} members
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-600/50 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            project.status === 'completed'
                              ? 'bg-gradient-to-r from-green-500 to-teal-500'
                              : 'bg-gradient-to-r from-purple-500 to-pink-500'
                          }`}
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-600/50 rounded-lg transition-colors duration-200">
                  <FaEllipsisV />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;