// frontend/app/dashboard/projects/create/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProjectForm from '../../../../components/projects/project-form';
import { apiService } from '../../../../lib/api';
import { useAuth } from '../../../../lib/auth/context';
import { useToast } from '../../../../components/ui/toast';
import { ProjectCreate, ProjectUpdate } from '../../../../lib/types';

const CreateProjectPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { addToast } = useToast();

  const handleCreateProject = async (projectData: ProjectCreate | ProjectUpdate) => {
    if (!user) return;

    // Type guard to ensure ProjectCreate for creation
    const dataToCreate = projectData as ProjectCreate;

    try {
      await apiService.createProject(user.id, dataToCreate);

      addToast({
        type: 'success',
        title: 'Project Created',
        message: 'The project has been successfully created.'
      });

      // Redirect back to dashboard after successful creation
      // The dashboard will automatically refresh data when page becomes visible
      setTimeout(() => {
        router.push('/dashboard/projects');
      }, 1500); // Wait 1.5 seconds to show the success message
    } catch (err) {
      console.error('Failed to create project:', err);
      addToast({
        type: 'error',
        title: 'Creation Failed',
        message: 'Could not create the project. Please try again.'
      });
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/projects');
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-lg">Please log in to create projects</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg border border-gray-700 p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 shadow-lg shadow-purple-500/20">
              Create Project
            </h3>
            <p className="mt-1 text-sm text-gray-400">
              Fill out the form to create a new project.
            </p>
          </div>
          <div className="mt-5 md:col-span-2 md:mt-0">
            <ProjectForm
              onSubmit={handleCreateProject}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectPage;