import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { ParseProjects } from '../../wailsjs/go/core/App';
import { Project } from '../models/project';

interface ProjectContextType {
  projects: Project[];
  hasSelectedProject: boolean;
  isLoading: boolean;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [hasSelectedProject, setHasSelectedProject] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const hasFetchedRef = useRef(false);

  const fetchProjects = async () => {
    // Prevent duplicate API calls in StrictMode
    if (hasFetchedRef.current) {
      return;
    }
    hasFetchedRef.current = true;

    try {
      setIsLoading(true);
      const data = await ParseProjects();
      setProjects(data);
      // Check if any project has been used (has a LastUsed date that's not "N/A")
      const hasUsedProject = data.some(project => project.LastUsed !== "N/A");
      setHasSelectedProject(hasUsedProject);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
      setHasSelectedProject(false);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProjects = async () => {
    // Reset the ref for manual refresh
    hasFetchedRef.current = false;
    await fetchProjects();
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const value: ProjectContextType = {
    projects,
    hasSelectedProject,
    isLoading,
    refreshProjects,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}; 