// frontend/components/dashboard/settings.tsx
'use client';

import React, { useState } from 'react';
import { useAuth } from '../../lib/auth/context';
import { useRouter } from 'next/navigation';
import { FaUser, FaBell, FaLock, FaPalette, FaCog, FaSignOutAlt, FaSave, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';

const DashboardSettings: React.FC = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
  });
  const [theme, setTheme] = useState('dark');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.email.split('@')[0] || '',
    email: user?.email || '',
    bio: '',
    location: '',
  });

  const handleLogout = () => {
    logout();
    router.push('/auth/sign-in');
  };

  const handleSave = () => {
    // Save settings logic would go here
    alert('Settings saved successfully!');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center">
          <FaCog className="text-purple-400 text-2xl mr-3" />
          <h1 className="text-2xl font-bold text-white">Settings</h1>
        </div>
        <p className="text-gray-400 mt-2">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
            <div className="space-y-2">
              {[
                { id: 'profile', label: 'Profile', icon: <FaUser /> },
                { id: 'notifications', label: 'Notifications', icon: <FaBell /> },
                { id: 'security', label: 'Security', icon: <FaLock /> },
                { id: 'appearance', label: 'Appearance', icon: <FaPalette /> },
                { id: 'advanced', label: 'Advanced', icon: <FaCog /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border border-purple-500/30'
                      : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                  }`}
                >
                  <span className="mr-3">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}

              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 text-left text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-colors duration-200 mt-6"
              >
                <FaSignOutAlt className="mr-3" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Profile Settings</h2>

                <div className="space-y-6">
                  <div className="flex items-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl mr-6">
                      {user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white">Change Avatar</h3>
                      <button className="mt-2 px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50 transition-colors duration-200">
                        Upload Image
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter your name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter your email"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Tell us about yourself"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Where are you from?"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSave}
                      className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-500 transition-all duration-300"
                    >
                      <FaSave className="mr-2" />
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Notification Settings</h2>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl">
                    <div>
                      <h3 className="text-lg font-medium text-white">Email Notifications</h3>
                      <p className="text-gray-400">Receive updates via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.email}
                        onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl">
                    <div>
                      <h3 className="text-lg font-medium text-white">Push Notifications</h3>
                      <p className="text-gray-400">Receive push notifications</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.push}
                        onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl">
                    <div>
                      <h3 className="text-lg font-medium text-white">SMS Notifications</h3>
                      <p className="text-gray-400">Receive SMS notifications</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.sms}
                        onChange={(e) => setNotifications({...notifications, sms: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                    </label>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSave}
                      className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-500 transition-all duration-300"
                    >
                      <FaSave className="mr-2" />
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Security Settings</h2>

                <div className="space-y-6">
                  <div className="p-4 bg-gray-700/30 rounded-xl">
                    <h3 className="text-lg font-medium text-white mb-2">Change Password</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                        <div className="relative">
                          <input
                            type="password"
                            className="w-full px-4 py-3 pr-10 rounded-xl bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <FaEyeSlash className="h-5 w-5 text-gray-400" />
                            ) : (
                              <FaEye className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                        <div className="relative">
                          <input
                            type="password"
                            className="w-full px-4 py-3 pr-10 rounded-xl bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <FaEyeSlash className="h-5 w-5 text-gray-400" />
                            ) : (
                              <FaEye className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-700/30 rounded-xl">
                    <h3 className="text-lg font-medium text-white mb-2">Two-Factor Authentication</h3>
                    <p className="text-gray-400 mb-4">Add an extra layer of security to your account</p>
                    <button className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50 transition-colors duration-200">
                      Enable 2FA
                    </button>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSave}
                      className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-500 transition-all duration-300"
                    >
                      <FaSave className="mr-2" />
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Appearance Settings</h2>

                <div className="space-y-6">
                  <div className="p-4 bg-gray-700/30 rounded-xl">
                    <h3 className="text-lg font-medium text-white mb-4">Theme</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { id: 'light', name: 'Light' },
                        { id: 'dark', name: 'Dark' },
                        { id: 'system', name: 'System' },
                      ].map((option) => (
                        <div
                          key={option.id}
                          onClick={() => setTheme(option.id)}
                          className={`cursor-pointer p-4 rounded-xl border-2 ${
                            theme === option.id
                              ? 'border-purple-500 bg-purple-500/10'
                              : 'border-gray-600 bg-gray-700/30 hover:bg-gray-600/30'
                          }`}
                        >
                          <div className="flex items-center">
                            <div
                              className={`w-4 h-4 rounded-full border-2 mr-2 ${
                                theme === option.id ? 'border-purple-500 bg-purple-500' : 'border-gray-500'
                              }`}
                            ></div>
                            <span className="text-white">{option.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-gray-700/30 rounded-xl">
                    <h3 className="text-lg font-medium text-white mb-2">Language</h3>
                    <select className="w-full px-4 py-3 rounded-xl bg-gray-700/50 border border-gray-600 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSave}
                      className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-500 transition-all duration-300"
                    >
                      <FaSave className="mr-2" />
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Advanced Settings</h2>

                <div className="space-y-6">
                  <div className="p-4 bg-gray-700/30 rounded-xl">
                    <h3 className="text-lg font-medium text-white mb-2">Data Export</h3>
                    <p className="text-gray-400 mb-4">Export your data in various formats</p>
                    <button className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50 transition-colors duration-200">
                      Export Data
                    </button>
                  </div>

                  <div className="p-4 bg-gray-700/30 rounded-xl">
                    <h3 className="text-lg font-medium text-white mb-2">Account Deletion</h3>
                    <p className="text-red-400 mb-4">Permanently delete your account and all data</p>
                    <button className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors duration-200 border border-red-500/30">
                      Delete Account
                    </button>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSave}
                      className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-500 transition-all duration-300"
                    >
                      <FaSave className="mr-2" />
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSettings;