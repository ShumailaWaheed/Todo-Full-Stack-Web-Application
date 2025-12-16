// frontend/components/home/home.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth/context';
import { useRouter } from 'next/navigation';
import { FaTasks, FaChartBar, FaSync, FaLock, FaCheckCircle, FaClock, FaBolt, FaChartLine, FaRegListAlt, FaCog, FaGithub, FaLinkedin, FaGoogle } from 'react-icons/fa';

const Home: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => {
    router.push('/auth/sign-up');
  };

  const handleLearnMore = () => {
    // Scroll to features section
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Sample features data
  const features = [
    {
      title: "Smart Task Management",
      description: "Create, edit, categorize, and prioritize tasks easily",
      icon: <FaRegListAlt className="text-2xl" />
    },
    {
      title: "Progress Tracking",
      description: "Visual progress bars & task status",
      icon: <FaChartLine className="text-2xl" />
    },
    {
      title: "Routine & Todo Tabs",
      description: "Organize tasks with different view modes",
      icon: <FaTasks className="text-2xl" />
    },
    {
      title: "Analytics & Insights",
      description: "Detailed reports and productivity metrics",
      icon: <FaChartBar className="text-2xl" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black relative overflow-hidden">
      {/* Ambient Glow Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Fixed Header - does NOT move on scroll */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur-md py-4 border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <FaTasks className="text-white text-sm" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-sans">
                TasklyPro
              </span>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors duration-200">Features</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">About</a>
              <button
                onClick={handleGetStarted}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg shadow-purple-500/20"
              >
                Start Managing
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section - Centered Layout */}
      <div className="pt-20 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex justify-center">
            <div className="animate-fade-in-up flex flex-col items-center text-center max-w-3xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight font-sans">
                Boost Your Productivity. <br />
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-sans">Stay Organized.</span> <br />
                Achieve More.
              </h1>

              <p className="text-xl text-gray-300 mb-10 max-w-2xl">
                Streamline your tasks, boost efficiency, and achieve more with our premium task management solution.
                Designed for the modern professional.
              </p>


              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up items-center" style={{ animationDelay: '0.4s' }}>
                <button
                  onClick={handleGetStarted}
                  className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl hover:shadow-purple-500/30"
                >
                  Start Managing
                </button>
                <button
                  onClick={handleLearnMore}
                  className="px-8 py-4 bg-gray-800/50 text-gray-300 font-semibold rounded-xl border border-gray-700 hover:bg-gray-700/50 transition-colors duration-300 hover:shadow-lg hover:shadow-gray-500/20"
                >
                  Learn More
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 font-sans">Powerful Features</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to manage your tasks efficiently and stay organized
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300 transform hover:-translate-y-1 group relative shadow-lg hover:shadow-2xl hover:shadow-purple-500/20"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-purple-500/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <div className="text-purple-400 text-xl group-hover:text-purple-300 transition-colors duration-300">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-3 font-sans">{feature.title}</h3>
                  <p className="text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Project-Based Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 font-sans bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Powerful Project Management</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Organize your work with advanced project features and analytics
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
            {/* Tasks Card */}
            <div
              className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300 transform hover:-translate-y-1 group relative shadow-lg hover:shadow-2xl hover:shadow-purple-500/20"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-purple-500/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FaTasks className="text-purple-400 text-xl group-hover:text-purple-300 transition-colors duration-300" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-3 font-sans">Smart Tasks</h3>
                <p className="text-gray-400 mb-4">
                  Create, organize, and prioritize tasks with intelligent suggestions
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span>Priority levels</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-300">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    <span>Due date tracking</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-300">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                    <span>Progress indicators</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Routines Card */}
            <div
              className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-pink-500/30 transition-all duration-300 transform hover:-translate-y-1 group relative shadow-lg hover:shadow-2xl hover:shadow-pink-500/20"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FaRegListAlt className="text-pink-400 text-xl group-hover:text-pink-300 transition-colors duration-300" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-3 font-sans">Routines</h3>
                <p className="text-gray-400 mb-4">
                  Set up recurring tasks and build productive habits
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span>Daily routines</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-300">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    <span>Progress tracking</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Card */}
            <div
              className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300 transform hover:-translate-y-1 group relative shadow-lg hover:shadow-2xl hover:shadow-blue-500/20"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FaChartBar className="text-blue-400 text-xl group-hover:text-blue-300 transition-colors duration-300" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-3 font-sans">Analytics</h3>
                <p className="text-gray-400 mb-4">
                  Get insights into your productivity and task completion
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span>Completion rates</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-300">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    <span>Time tracking</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Proposal Section */}
      <div className="py-20 bg-gradient-to-br from-gray-900/30 to-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Complete Your Project Proposal
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Streamline your project workflow with our comprehensive tools. From initial planning to final execution,
                manage every aspect of your project with precision and efficiency.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center text-gray-300">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  <span>Advanced project planning tools</span>
                </li>
                <li className="flex items-center text-gray-300">
                  <div className="w-2 h-2 bg-pink-500 rounded-full mr-3"></div>
                  <span>Real-time collaboration features</span>
                </li>
                <li className="flex items-center text-gray-300">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span>Progress tracking and analytics</span>
                </li>
                <li className="flex items-center text-gray-300">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Resource management capabilities</span>
                </li>
              </ul>
            </div>
            <div className="relative animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 transform hover:-translate-y-2">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-white">Weekly Goals</h3>
                  <span className="text-2xl font-bold text-purple-400">87%</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-300 mb-2">
                      <span>Project Completion</span>
                      <span>87%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full" style={{width: '87%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-gray-300 mb-2">
                      <span>Tasks Completed</span>
                      <span>13/15</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div className="bg-gradient-to-r from-green-500 to-teal-500 h-3 rounded-full" style={{width: '87%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-gray-300 mb-2">
                      <span>Team Productivity</span>
                      <span>High</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full" style={{width: '92%'}}></div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-700/50">
                  <h4 className="text-lg font-semibold text-white mb-3">Insights</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-400">+23%</div>
                      <div className="text-sm text-gray-400">vs last week</div>
                    </div>
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-400">94%</div>
                      <div className="text-sm text-gray-400">Efficiency</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20 bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              className="text-center animate-fade-in-up"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">10K+</div>
              <div className="text-gray-400">Tasks Completed</div>
            </div>
            <div
              className="text-center animate-fade-in-up"
              style={{ animationDelay: '0.5s' }}
            >
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">99.9%</div>
              <div className="text-gray-400">Uptime</div>
            </div>
            <div
              className="text-center animate-fade-in-up"
              style={{ animationDelay: '0.7s' }}
            >
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">24/7</div>
              <div className="text-gray-400">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 animate-fade-in-up">Ready to boost your productivity?</h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Join thousands of professionals who trust our platform to manage their tasks efficiently.
          </p>
          <button
            onClick={handleGetStarted}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/20 text-lg animate-fade-in-up"
            style={{ animationDelay: '0.4s' }}
          >
            Get Started Today
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center">
            <div className="text-center mb-6">
              <p className="text-gray-500 text-lg">
                © {new Date().getFullYear()} TasklyPro. All rights reserved.
              </p>
            </div>

            {/* Social Icons */}
            <div className="flex space-x-6 mb-6">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full flex items-center justify-center text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-2xl hover:shadow-purple-500/20"
              >
                <FaGithub className="text-xl" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full flex items-center justify-center text-white hover:from-blue-600 hover:to-blue-800 transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-2xl hover:shadow-blue-500/20"
              >
                <FaLinkedin className="text-xl" />
              </a>
              <a
                href="https://google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full flex items-center justify-center text-white hover:from-red-500 hover:to-red-700 transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-2xl hover:shadow-red-500/20"
              >
                <FaGoogle className="text-xl" />
              </a>
            </div>

            <div className="text-center">
              <p className="text-gray-400">
                Connect with us on social media for updates and news
              </p>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default Home;