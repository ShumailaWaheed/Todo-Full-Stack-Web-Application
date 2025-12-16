'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth/context';
import { useRouter, usePathname } from 'next/navigation';
import { apiService } from '../../lib/api';
import { FaPlus, FaFire, FaChartLine, FaCog, FaTasks, FaFolder, FaCheckCircle, FaChartBar, FaColumns, FaTh, FaList, FaEllipsisV, FaRegCalendar, FaUser } from 'react-icons/fa';

const DashboardPage: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<'routine' | 'todo'>('routine');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('grid');
  const [loadingData, setLoadingData] = useState(true);

  const [taskStats, setTaskStats] = useState({
    today: 0,
    upcoming: 0,
    completed: 0,
    projects: 0,
    completedThisWeek: 0
  });

  const [progressData, setProgressData] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0
  });

  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  // Function to fetch dashboard data
  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setLoadingData(true);

      // Fetch all tasks for the user
      const allTasksResponse = await apiService.getTasks(user.id);
      const allTasks = allTasksResponse.tasks;

      // Calculate task statistics
      const totalTasks = allTasks.length;
      const completedTasks = allTasks.filter(task => task.completed).length;
      const activeTasks = allTasks.filter(task => !task.completed).length;

      // For simplicity, we'll count all non-completed tasks as "today/upcoming"
      const todayTasks = activeTasks;
      const upcomingTasks = 0; // Could be refined based on due dates

      // Calculate overdue tasks
      const overdueTasks = allTasks.filter(task => {
        if (!task.due_date || task.completed) return false;
        return new Date(task.due_date) < new Date();
      }).length;

      // Update task stats
      setTaskStats({
        today: todayTasks,
        upcoming: upcomingTasks,
        completed: completedTasks,
        projects: 3, // This would come from a projects API
        completedThisWeek: 78 // This would be calculated from completed tasks
      });

      // Update progress data
      setProgressData({
        total: totalTasks,
        completed: completedTasks,
        inProgress: activeTasks - overdueTasks,
        overdue: overdueTasks
      });

      // Format recent activities (last 4 tasks)
      const formattedActivities = allTasks.slice(0, 4).map((task, index) => ({
        id: task.id.toString(),
        type: task.completed ? 'completed' as const : 'created' as const,
        title: task.title,
        time: `${index + 1} ${index === 0 ? 'minute' : 'minutes'} ago`,
        project: 'General' // This would come from project data
      }));

      setRecentActivities(formattedActivities);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // If it's a network error, try to handle it gracefully
      if (error instanceof Error && error.message.includes('Network error')) {
        // Show a user-friendly message about network issues
        console.warn('Network issue detected, showing cached/empty data');
        // Set empty data to avoid breaking the UI
        setTaskStats({
          today: 0,
          upcoming: 0,
          completed: 0,
          projects: 0,
          completedThisWeek: 0
        });
        setProgressData({
          total: 0,
          completed: 0,
          inProgress: 0,
          overdue: 0
        });
        setRecentActivities([]);
      } else {
        // For other errors, also set empty data to avoid breaking the UI
        console.error('Non-network error, setting empty data');
        setTaskStats({
          today: 0,
          upcoming: 0,
          completed: 0,
          projects: 0,
          completedThisWeek: 0
        });
        setProgressData({
          total: 0,
          completed: 0,
          inProgress: 0,
          overdue: 0
        });
        setRecentActivities([]);
      }
    } finally {
      setLoadingData(false);
    }
  };

  // Load dashboard data when component mounts or user changes
  useEffect(() => {
    if (user && !loading) {
      fetchDashboardData();
    }
  }, [user, loading]);

  // Refresh dashboard data when the page becomes visible again (e.g., after creating a task)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        fetchDashboardData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  // Refresh dashboard data when navigating between dashboard and tasks views
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [pathname, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirect will happen via layout
  }

  const handleAddTask = () => {
    router.push('/dashboard/tasks/create');
  };

  // Function to refresh dashboard data after task operations
  const refreshDashboardData = async () => {
    if (user) {
      try {
        await fetchDashboardData();
      } catch (error) {
        console.error('Error refreshing dashboard data:', error);
        // Show user-friendly error message if it's a network error
        if (error instanceof Error && error.message.includes('Network error')) {
          console.warn('Network issue detected during refresh, data may be stale');
        }
      }
    }
  };

  // Determine if we're on the dashboard or tasks view
  const isTasksView = pathname.startsWith('/dashboard/tasks');

  if (isTasksView) {
    // Tasks view content
    return (
      <div className="p-6">
        {/* Header with Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1)}
          </h1>
          <p className="text-gray-400 mt-2">Ready to boost your productivity today? You're on a 7-day streak!</p>

          <div className="mt-4 flex flex-wrap gap-4">
            {/* Add Task Button */}
            <button
              onClick={() => {
                router.push('/dashboard/tasks/create');
              }}
              className="flex items-center px-6 py-3 bg-gray-800 rounded-lg text-white font-medium border border-gray-700 hover:bg-gray-750 transition-colors"
            >
              <FaPlus className="mr-2" />
              Add Task
            </button>

            {/* New Project Button */}
            <button className="flex items-center px-6 py-3 bg-gray-800 rounded-lg text-white font-medium border border-gray-700 hover:bg-gray-750 transition-colors">
              <FaFolder className="mr-2" />
              New Project
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-6">
          <button
            className={`px-4 py-2 font-medium text-sm relative ${
              activeTab === 'routine'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('routine')}
          >
            Routine
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm relative ${
              activeTab === 'todo'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('todo')}
          >
            Todo
          </button>
        </div>

        {/* Stats / Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs uppercase text-gray-400 font-medium tracking-wider">Total Tasks</p>
                <p className="text-2xl font-bold text-white mt-1">{loadingData ? '...' : taskStats.today + taskStats.upcoming}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-700">
                <FaTasks className="text-purple-400 text-lg" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs uppercase text-gray-400 font-medium tracking-wider">Completed</p>
                <p className="text-2xl font-bold text-white mt-1">{loadingData ? '...' : taskStats.completed}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-700">
                <FaCheckCircle className="text-green-400 text-lg" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs uppercase text-gray-400 font-medium tracking-wider">Projects</p>
                <p className="text-2xl font-bold text-white mt-1">{loadingData ? '...' : taskStats.projects}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-700">
                <FaFolder className="text-blue-400 text-lg" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs uppercase text-gray-400 font-medium tracking-wider">This Week</p>
                <p className="text-2xl font-bold text-white mt-1">{loadingData ? '...' : taskStats.completedThisWeek}%</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-700">
                <FaChartLine className="text-yellow-400 text-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8 shadow-sm">
          <h3 className="text-lg font-semibold text-white mb-4">Progress Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total</p>
              <p className="text-xl font-bold text-white">{loadingData ? '...' : progressData.total}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Completed</p>
              <p className="text-xl font-bold text-green-400">{loadingData ? '...' : progressData.completed}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">In Progress</p>
              <p className="text-xl font-bold text-blue-400">{loadingData ? '...' : progressData.inProgress}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Overdue</p>
              <p className="text-xl font-bold text-red-400">{loadingData ? '...' : progressData.overdue}</p>
            </div>
          </div>
          <div className="mt-4 w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
              style={{width: loadingData ? '0%' : `${(progressData.completed / progressData.total) * 100}%`}}
            ></div>
          </div>
        </div>

        {/* Task List Section */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">Recent Tasks</h3>
            <div className="flex items-center space-x-2">
              <button
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-purple-600' : 'bg-gray-700'} hover:bg-purple-600 transition-colors`}
                onClick={() => setViewMode('grid')}
              >
                <FaTh />
              </button>
              <button
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-purple-600' : 'bg-gray-700'} hover:bg-purple-600 transition-colors`}
                onClick={() => setViewMode('list')}
              >
                <FaList />
              </button>
              <button
                className={`p-2 rounded-lg ${viewMode === 'compact' ? 'bg-purple-600' : 'bg-gray-700'} hover:bg-purple-600 transition-colors`}
                onClick={() => setViewMode('compact')}
              >
                <FaColumns />
              </button>
              <button className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center">
                View All →
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {loadingData ? (
              // Loading state
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                <p className="text-gray-400 mt-2">Loading tasks...</p>
              </div>
            ) : recentActivities.length > 0 ? (
              // Show recent tasks
              recentActivities.map((activity) => (
                <div key={activity.id} className="bg-gray-750 rounded-lg p-4 border border-gray-600 hover:bg-gray-700 transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        activity.type === 'completed' ? 'bg-green-500' :
                        activity.type === 'created' ? 'bg-blue-500' :
                        activity.type === 'updated' ? 'bg-yellow-500' : 'bg-purple-500'
                      }`}></div>
                      <div>
                        <p className="text-white font-medium">{activity.title}</p>
                        <p className="text-sm text-gray-400">{activity.project} • {activity.time}</p>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-white">
                      <FaEllipsisV />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              // Empty state
              <div className="text-center py-8">
                <p className="text-gray-400">No recent tasks</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } else {
    // Dashboard view content
    return (
      <div className="p-6">
        {/* Welcome Section */}
        <div className="mb-8 p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-600 shadow-sm hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
          <h1 className="text-2xl font-bold font-mono text-white mb-2 tracking-wider">
            Welcome back, {user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1)}
          </h1>
          <p className="text-sm text-gray-400">System operational. {taskStats.today} active tasks detected</p>

          <div className="mt-4 flex">
            <button
              onClick={() => router.push('/dashboard/projects')}
              className="flex items-center px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 hover:scale-105"
            >
              New Project <span className="ml-2">→</span>
            </button>
          </div>
        </div>

        {/* Stats / Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-600 shadow-sm hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs uppercase text-gray-400 font-medium tracking-wider">TOTAL PROJECTS</p>
                <p className="text-2xl font-bold text-white mt-1">{loadingData ? '...' : taskStats.projects}</p>
              </div>
              <div className="p-2 rounded-lg bg-gray-750">
                <FaFolder className="text-gray-400 text-lg" />
              </div>
            </div>
            <div className="mt-3 w-3 h-3 rounded-full bg-purple-500"></div>
          </div>

          <div className="bg-gray-800 rounded-xl p-5 border border-gray-600 shadow-sm hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs uppercase text-gray-400 font-medium tracking-wider">ACTIVE TASKS</p>
                <p className="text-2xl font-bold text-white mt-1">{loadingData ? '...' : taskStats.today}</p>
              </div>
              <div className="p-2 rounded-lg bg-gray-750">
                <FaTasks className="text-gray-400 text-lg" />
              </div>
            </div>
            <div className="mt-3 w-3 h-3 rounded-full bg-purple-500"></div>
          </div>

          <div className="bg-gray-800 rounded-xl p-5 border border-gray-600 shadow-sm hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs uppercase text-gray-400 font-medium tracking-wider">TASK COMPLETED</p>
                <p className="text-2xl font-bold text-white mt-1">{loadingData ? '...' : taskStats.completed}</p>
              </div>
              <div className="p-2 rounded-lg bg-gray-750">
                <FaCheckCircle className="text-gray-400 text-lg" />
              </div>
            </div>
            <div className="mt-3 w-3 h-3 rounded-full bg-purple-500"></div>
          </div>

          <div className="bg-gray-800 rounded-xl p-5 border border-gray-600 shadow-sm hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs uppercase text-gray-400 font-medium tracking-wider">TEAM MEMBERS</p>
                <p className="text-2xl font-bold text-white mt-1">{loadingData ? '...' : 24}</p>
              </div>
              <div className="p-2 rounded-lg bg-gray-750">
                <FaUser className="text-gray-400 text-lg" />
              </div>
            </div>
            <div className="mt-3 w-3 h-3 rounded-full bg-purple-500"></div>
          </div>
        </div>

        {/* Action Tiles / Add Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div
            onClick={() => {
              router.push('/dashboard/tasks/create');
            }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-600 cursor-pointer hover:bg-gray-750 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 text-center group shadow-sm border-dashed border-gray-600 hover:border-purple-500/50 hover:-translate-y-1"
          >
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-gray-750 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 group-hover:bg-gray-700">
                <FaPlus className="text-gray-400 text-xl" />
              </div>
              <h3 className="text-lg font-medium text-white group-hover:text-purple-400 transition-colors">Add Task</h3>
            </div>
          </div>

          <div
            onClick={() => router.push('/dashboard/projects')}
            className="bg-gray-800 rounded-xl p-6 border border-gray-600 cursor-pointer hover:bg-gray-750 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 text-center group shadow-sm border-dashed border-gray-600 hover:border-purple-500/50 hover:-translate-y-1"
          >
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-gray-750 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 group-hover:bg-gray-700">
                <FaFolder className="text-gray-400 text-xl" />
              </div>
              <h3 className="text-lg font-medium text-white group-hover:text-purple-400 transition-colors">Add Project</h3>
            </div>
          </div>
        </div>

        {/* View Options Section (replaces Active Projects) */}
        <div className="mb-8 p-6 bg-gray-800 rounded-xl border border-gray-600 shadow-sm">
          <h2 className="text-lg font-bold font-mono text-white mb-2 tracking-wider">View Options</h2>
          <p className="text-sm text-gray-400 mb-4">Select your preferred project display mode</p>

          <div className="flex flex-wrap gap-3">
            <button
              className={`px-4 py-2.5 rounded-lg border transition-all duration-300 ${
                viewMode === 'list'
                  ? 'bg-purple-600/20 border-purple-500 text-purple-400 shadow-lg shadow-purple-500/20 hover:scale-105'
                  : 'border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-700 hover:scale-105 hover:shadow-md hover:shadow-gray-500/10'
              }`}
              onClick={() => setViewMode('list')}
            >
              <div className="flex items-center">
                <FaList className="mr-2 text-sm" />
                List View
              </div>
            </button>
            <button
              className={`px-4 py-2.5 rounded-lg border transition-all duration-300 ${
                viewMode === 'grid'
                  ? 'bg-purple-600/20 border-purple-500 text-purple-400 shadow-lg shadow-purple-500/20 hover:scale-105'
                  : 'border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-700 hover:scale-105 hover:shadow-md hover:shadow-gray-500/10'
              }`}
              onClick={() => setViewMode('grid')}
            >
              <div className="flex items-center">
                <FaTh className="mr-2 text-sm" />
                Grid View
              </div>
            </button>
            <button
              className={`px-4 py-2.5 rounded-lg border transition-all duration-300 ${
                viewMode === 'compact'
                  ? 'bg-purple-600/20 border-purple-500 text-purple-400 shadow-lg shadow-purple-500/20 hover:scale-105'
                  : 'border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-700 hover:scale-105 hover:shadow-md hover:shadow-gray-500/10'
              }`}
              onClick={() => setViewMode('compact')}
            >
              <div className="flex items-center">
                <FaColumns className="mr-2 text-sm" />
                Combo View
              </div>
            </button>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            <p>• Rounded buttons with subtle glow</p>
            <p>• Active option highlighted with accent</p>
            <p>• Hover: slight scale + inner glow</p>
            <p>• Icons: single-color, system-style</p>
          </div>
        </div>
      </div>
    );
  }
};

export default DashboardPage;