// frontend/app/dashboard/settings/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth/context';
import { useTheme } from '../../../lib/theme/context';
import { useRouter } from 'next/navigation';
import { apiService } from '../../../lib/api';
import { useToast } from '../../../components/ui/toast';
import { FaUser, FaBell, FaLock, FaPalette, FaCog, FaSignOutAlt, FaSave } from 'react-icons/fa';

const SettingsPage: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: user?.email.split('@')[0] || '',
    email: user?.email || '',
    bio: '',
    location: '',
  });

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || user.email.split('@')[0] || '',
        email: user.email || ''
      }));

      // Set profile image if available
      if (user.profile_image) {
        setProfileImage(user.profile_image);
      }
    }
  }, [user]);

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (profileImage && profileImage.startsWith('blob:')) {
        URL.revokeObjectURL(profileImage);
      }
    };
  }, [profileImage]);

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.')) {
      try {
        if (user) {
          // Delete the user account via API
          await apiService.deleteUser(user.id);
          // Then logout and redirect
          logout();
          router.push('/auth/sign-in');
          addToast({
            type: 'success',
            title: 'Account Deleted',
            message: 'Your account has been successfully deleted.'
          });
        }
      } catch (error) {
        console.error('Failed to delete account:', error);
        addToast({
          type: 'error',
          title: 'Deletion Failed',
          message: 'Could not delete your account. Please try again.'
        });
      }
    }
  };

  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSave = async () => {
    try {
      if (user) {
        // Update user profile via API
        const updatedUser = await apiService.updateUserProfile(user.id, {
          email: formData.email,
          name: formData.name,
          bio: formData.bio,
          location: formData.location
        });

        // If there's a new image file to upload, upload it separately
        if (imageFile) {
          await apiService.uploadProfileImage(user.id, imageFile);
        }

        // Update the auth context with the new user data
        // This ensures the changes reflect immediately in the app
        const updatedUserData = {
          ...user,
          email: updatedUser.email || formData.email,
          name: updatedUser.name || formData.name,
          bio: updatedUser.bio || formData.bio,
          location: updatedUser.location || formData.location,
          profile_image: updatedUser.profile_image || user.profile_image,
          updated_at: updatedUser.updated_at || new Date().toISOString()
        };

        // Update the user in the auth context to reflect changes globally
        updateUser(updatedUserData);

        // Update the local state to reflect the changes immediately
        setFormData({
          name: updatedUserData.name || user.email.split('@')[0] || '',
          email: updatedUserData.email || user.email || '',
          bio: updatedUserData.bio || '',
          location: updatedUserData.location || '',
        });

        // If we uploaded an image, we should get the updated profile image URL
        if (imageFile) {
          // Get updated user profile to reflect the new image
          try {
            const freshUser = await apiService.getUserProfile(user.id);
            setProfileImage(freshUser.profile_image || null);
          } catch (err) {
            console.error('Could not fetch updated profile image:', err);
          }
        }

        addToast({
          type: 'success',
          title: 'Settings Saved',
          message: 'Your profile settings have been successfully updated.'
        });
      }
    } catch (error) {
      console.error('Failed to save settings:', error);

      // Try to get a more specific error message
      let errorMessage = 'Could not save your settings. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      addToast({
        type: 'error',
        title: 'Update Failed',
        message: errorMessage
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 lg:p-8 animate-in fade-in duration-1000">
      {/* Header: Personal Neural Settings */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-[#8b5cf6] animate-pulse shadow-[0_0_10px_#8b5cf6]"></div>
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Settings</span>
          </div>
          <h1 className="text-xl sm:text-3xl lg:text-5xl font-black text-white tracking-tighter">
            Account <span className="text-[#8b5cf6]">Settings</span>
          </h1>
          <p className="text-sm text-white/30 mt-2 font-medium max-w-xl leading-relaxed">
            Customize your account preferences and personal information
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Primary (Configuration Panel) */}
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-[#0a0a0f] border border-white/5 rounded-xl sm:rounded-[2rem] p-3 sm:p-6 overflow-hidden">
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
                  className={`w-full flex items-center px-4 py-3 rounded-2xl text-left transition-all duration-500 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-[#8b5cf6]/20 to-[#ec4899]/20 text-[#8b5cf6] border border-[#8b5cf6]/30 shadow-[0_0_20px_rgba(139,92,246,0.3)]'
                      : 'text-white/40 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="mr-3">{tab.icon}</span>
                  <span className="font-black text-[10px] uppercase tracking-widest">{tab.label}</span>
                </button>
              ))}

              <button
                onClick={handleDeleteAccount}
                className="w-full flex items-center px-4 py-3 rounded-2xl text-left text-[#ef4444] hover:bg-[#ef4444]/10 hover:text-[#ef4444] transition-colors duration-200 mt-6"
              >
                <FaSignOutAlt className="mr-3 text-sm" />
                <span className="font-black text-[10px] uppercase tracking-widest">Delete Account</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Secondary (Settings Content) */}
        <div className="lg:col-span-9">
          <div className="bg-[#0a0a0f] border border-white/5 rounded-xl sm:rounded-[2rem] p-4 sm:p-8 overflow-hidden">
            {activeTab === 'profile' && (
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 rounded-lg bg-[#8b5cf6]/20 border border-[#8b5cf6]/30 flex items-center justify-center">
                    <FaUser className="text-[#8b5cf6] text-sm" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter">Profile Information</h2>
                    <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Manage your personal information</p>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Avatar Section - moved to the top of profile fields */}
                  <div className="flex items-center gap-6">
                    {profileImage ? (
                      <div className="relative">
                        <img
                          src={profileImage}
                          alt="Profile"
                          className="w-20 h-20 rounded-xl object-cover border-2 border-white/10"
                        />
                        <button
                          onClick={() => {
                            setProfileImage(null);
                            setImageFile(null);
                          }}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#ef4444] flex items-center justify-center text-white text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#ec4899] flex items-center justify-center text-white font-bold text-xl">
                        {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-black text-white/80 mb-2 uppercase tracking-wider">Profile Picture</h3>
                      <label className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-white/60 hover:text-white uppercase tracking-widest transition-all cursor-pointer inline-block">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              // Check file size (limit to 2MB)
                              if (file.size > 2 * 1024 * 1024) {
                                addToast({
                                  type: 'error',
                                  title: 'File Size Exceeded',
                                  message: 'File size too large. Please select an image under 2MB.'
                                });
                                return;
                              }

                              // Check file type
                              if (!file.type.startsWith('image/')) {
                                addToast({
                                  type: 'error',
                                  title: 'Invalid File Type',
                                  message: 'Invalid file type. Please select an image file.'
                                });
                                return;
                              }

                              // Store the file for later upload
                              setImageFile(file);

                              // Create a preview URL for display
                              const previewUrl = URL.createObjectURL(file);
                              setProfileImage(previewUrl);

                              // Clean up the preview URL when component unmounts or image changes
                              // This will be handled by React's cleanup in a useEffect if needed
                            }
                          }}
                        />
                        {profileImage ? 'Change Photo' : 'Upload Photo'}
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="text-[9px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2 mb-3">
                          <FaUser className="text-[#8b5cf6] text-[10px]" />
                          Display Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-[11px] font-bold text-white placeholder:text-white/10 focus:border-[#8b5cf6]/50 focus:bg-white/[0.06] transition-all outline-none"
                          placeholder="ENTER YOUR DISPLAY NAME"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2 mb-3">
                          <FaUser className="text-[#8b5cf6] text-[10px]" />
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-[11px] font-bold text-white placeholder:text-white/10 focus:border-[#8b5cf6]/50 focus:bg-white/[0.06] transition-all outline-none"
                          placeholder="ENTER YOUR EMAIL ADDRESS"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-[9px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2 mb-3">
                          <FaUser className="text-[#8b5cf6] text-[10px]" />
                          About You
                        </label>
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-[11px] font-medium text-white placeholder:text-white/10 focus:border-[#8b5cf6]/50 focus:bg-white/[0.06] transition-all outline-none resize-none"
                          placeholder="TELL US ABOUT YOURSELF..."
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2 mb-3">
                          <FaUser className="text-[#8b5cf6] text-[10px]" />
                          Location
                        </label>
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-[11px] font-bold text-white placeholder:text-white/10 focus:border-[#8b5cf6]/50 focus:bg-white/[0.06] transition-all outline-none"
                          placeholder="ENTER YOUR LOCATION"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-8 mt-8 border-t border-white/5">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#8b5cf6]/80 text-white text-[9px] font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all"
                    >
                      <FaSave className="text-[10px]" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 rounded-lg bg-[#8b5cf6]/20 border border-[#8b5cf6]/30 flex items-center justify-center">
                    <FaBell className="text-[#8b5cf6] text-sm" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter">Communication Matrix</h2>
                    <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Configure your alert parameters</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-6 bg-white/[0.03] border border-white/10 rounded-2xl">
                    <div>
                      <h3 className="text-[12px] font-black text-white uppercase tracking-tight mb-1">Email Alerts</h3>
                      <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Receive system notifications via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.email}
                        onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8b5cf6]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-white/[0.03] border border-white/10 rounded-2xl">
                    <div>
                      <h3 className="text-[12px] font-black text-white uppercase tracking-tight mb-1">Push Alerts</h3>
                      <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Receive real-time push notifications</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.push}
                        onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8b5cf6]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-white/[0.03] border border-white/10 rounded-2xl">
                    <div>
                      <h3 className="text-[12px] font-black text-white uppercase tracking-tight mb-1">SMS Alerts</h3>
                      <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Receive critical alerts via SMS</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.sms}
                        onChange={(e) => setNotifications({...notifications, sms: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8b5cf6]"></div>
                    </label>
                  </div>

                  <div className="flex justify-end pt-6 mt-6 border-t border-white/5">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#8b5cf6]/80 text-white text-[9px] font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all"
                    >
                      <FaSave className="text-[10px]" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 rounded-lg bg-[#8b5cf6]/20 border border-[#8b5cf6]/30 flex items-center justify-center">
                    <FaLock className="text-[#8b5cf6] text-sm" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter">Neural Shield</h2>
                    <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Configure your security parameters</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl">
                    <h3 className="text-[12px] font-black text-white uppercase tracking-tight mb-4">Authentication Vector</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-[9px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2 mb-3">
                          <FaLock className="text-[#8b5cf6] text-[10px]" />
                          Current Authentication Vector
                        </label>
                        <input
                          type="password"
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-[11px] font-bold text-white placeholder:text-white/10 focus:border-[#8b5cf6]/50 focus:bg-white/[0.06] transition-all outline-none"
                          placeholder="ENTER CURRENT AUTHENTICATION VECTOR"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2 mb-3">
                          <FaLock className="text-[#8b5cf6] text-[10px]" />
                          New Authentication Vector
                        </label>
                        <input
                          type="password"
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-[11px] font-bold text-white placeholder:text-white/10 focus:border-[#8b5cf6]/50 focus:bg-white/[0.06] transition-all outline-none"
                          placeholder="DEFINE NEW AUTHENTICATION VECTOR"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl">
                    <h3 className="text-[12px] font-black text-white uppercase tracking-tight mb-2">Identity Verification Matrix</h3>
                    <p className="text-[9px] font-bold text-white/30 mb-4 uppercase tracking-widest">Enhance account security with multi-factor authentication</p>
                    <button className="px-6 py-3 bg-white/[0.05] border border-white/10 text-[10px] font-black text-white/60 hover:text-white uppercase tracking-widest transition-all">
                      Activate Multi-Factor Authentication
                    </button>
                  </div>

                  <div className="flex justify-end pt-6 mt-6 border-t border-white/5">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#8b5cf6]/80 text-white text-[9px] font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all"
                    >
                      <FaSave className="text-[10px]" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 rounded-lg bg-[#8b5cf6]/20 border border-[#8b5cf6]/30 flex items-center justify-center">
                    <FaPalette className="text-[#8b5cf6] text-sm" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter">Visual Matrix</h2>
                    <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Configure your interface aesthetics</p>
                  </div>
                </div>

                <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                  <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                    <h3 className="text-lg font-bold text-white mb-4">Display Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { id: 'light', name: 'Quantum Light' },
                        { id: 'dark', name: 'Neural Dark' },
                        { id: 'system', name: 'System Default' },
                      ].map((option) => (
                        <div
                          key={option.id}
                          onClick={() => {
                            if (option.id !== theme.mode) {
                              toggleTheme();
                            }
                          }}
                          className={`cursor-pointer p-4 rounded-xl border-2 ${
                            option.id === theme.mode
                              ? 'border-[#8b5cf6] bg-[#8b5cf6]/10'
                              : 'border-gray-600 bg-gray-700/30 hover:bg-gray-600/30'
                          }`}
                        >
                          <div className="flex items-center">
                            <div
                              className={`w-4 h-4 rounded-full border-2 mr-2 ${
                                option.id === theme.mode ? 'border-[#8b5cf6] bg-[#8b5cf6]' : 'border-gray-500'
                              }`}
                            ></div>
                            <span className="text-white">{option.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                    <h3 className="text-lg font-bold text-white mb-4">Neural Accent</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                      {[
                        { name: 'Cosmic Purple', value: 'from-purple-500 to-pink-500', preview: 'bg-gradient-to-r from-[#8b5cf6] to-[#ec4899]' },
                        { name: 'Digital Blue', value: 'from-blue-500 to-teal-500', preview: 'bg-gradient-to-r from-blue-500 to-cyan-500' },
                        { name: 'Cyber Green', value: 'from-green-500 to-yellow-500', preview: 'bg-gradient-to-r from-green-500 to-emerald-500' },
                        { name: 'Neon Pink', value: 'from-red-500 to-orange-500', preview: 'bg-gradient-to-r from-pink-500 to-rose-500' },
                        { name: 'Quantum Indigo', value: 'from-indigo-500 to-purple-500', preview: 'bg-gradient-to-r from-indigo-500 to-violet-500' },
                      ].map((color) => (
                        <div
                          key={color.value}
                          onClick={() => {
                            // Update the theme accent color
                            // We need to import the setAccentColor function from the theme context
                          }}
                          className="flex flex-col items-center cursor-pointer"
                        >
                          <div className={`w-10 h-10 rounded-full ${color.preview}`}></div>
                          <span className="text-xs mt-1 text-gray-400 text-center">{color.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                    <h3 className="text-lg font-bold text-white mb-2">Linguistic Protocol</h3>
                    <select className="w-full px-4 py-3 rounded-xl bg-gray-700/50 border border-gray-600 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option>English (EN)</option>
                      <option>Spanish (ES)</option>
                      <option>French (FR)</option>
                      <option>German (DE)</option>
                      <option>Mandarin Chinese (ZH)</option>
                      <option>Hindi (HI)</option>
                    </select>
                  </div>

                  <div className="flex justify-end pt-6 mt-6 border-t border-white/5">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#8b5cf6]/80 text-white text-[9px] font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all"
                    >
                      <FaSave className="text-[10px]" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 rounded-lg bg-[#8b5cf6]/20 border border-[#8b5cf6]/30 flex items-center justify-center">
                    <FaCog className="text-[#8b5cf6] text-sm" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter">Neural Core</h2>
                    <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Configure your system parameters</p>
                  </div>
                </div>

                <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                  <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                    <h3 className="text-lg font-bold text-white mb-2">Data Portals</h3>
                    <p className="text-gray-400 text-sm mb-4">Export your neural data in various quantum formats</p>
                    <button className="px-6 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-[10px] font-black text-white/60 hover:text-white uppercase tracking-widest transition-all">
                      Initiate Data Export
                    </button>
                  </div>

                  <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                    <h3 className="text-lg font-bold text-white mb-2">Account Deletion</h3>
                    <p className="text-[#ef4444] text-sm mb-4">Permanently delete your account and erase all data</p>
                    <button
                      onClick={handleDeleteAccount}
                      className="px-6 py-3 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30 text-[10px] font-black text-[#ef4444] hover:bg-[#ef4444]/20 uppercase tracking-widest transition-all"
                    >
                      Delete Account
                    </button>
                  </div>

                  <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                    <h3 className="text-lg font-bold text-white mb-2">Diagnostic Utilities</h3>
                    <p className="text-gray-400 text-sm mb-4">Run system diagnostics and performance analysis</p>
                    <div className="flex gap-3">
                      <button className="px-6 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-[10px] font-black text-white/60 hover:text-white uppercase tracking-widest transition-all">
                        Run Diagnostics
                      </button>
                      <button className="px-6 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-[10px] font-black text-white/60 hover:text-white uppercase tracking-widest transition-all">
                        Clear Cache
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end pt-6 mt-6 border-t border-white/5">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#8b5cf6]/80 text-white text-[9px] font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all"
                    >
                      <FaSave className="text-[10px]" />
                      <span>Save Changes</span>
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

export default SettingsPage;