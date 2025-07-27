import React from "react";
import { useState, useEffect } from "react"
import { ImportProject} from "../../bindings/github.com/zenith110/pokemon-engine-tools/tools-core/App";
import { useProjects } from "../contexts/ProjectContext";

import NewProject from "./NewProject";
import ProjectCard from "./ProjectCard";
import WelcomeMessage from "./WelcomeMessage";

const HomePage = () => {
    const { projects, refreshProjects, hasSelectedProject } = useProjects();
    const [clickedNewProject, setClickedNewProject] = useState(false)
    const [currentProjectIndex, setCurrentProjectIndex] = useState(0)

    // Set the current project index to the last used project when projects load
    useEffect(() => {
        if (projects && projects.length > 0 && hasSelectedProject) {
            // Find the project with the most recent LastUsed date
            const lastUsedProject = projects.reduce((latest, current) => {
                if (current.LastUsed === "N/A") return latest;
                if (latest.LastUsed === "N/A") return current;
                
                const currentDate = new Date(current.LastUsed);
                const latestDate = new Date(latest.LastUsed);
                return currentDate > latestDate ? current : latest;
            });
            
            // Find the index of the last used project
            const lastUsedIndex = projects.findIndex(p => p.ID === lastUsedProject.ID);
            if (lastUsedIndex !== -1) {
                setCurrentProjectIndex(lastUsedIndex);
            }
        }
    }, [projects, hasSelectedProject]);

    const handlePrevProject = () => {
        setCurrentProjectIndex((prev) => (prev > 0 ? prev - 1 : prev));
    };

    const handleNextProject = () => {
        setCurrentProjectIndex((prev) => (prev < (projects?.length || 0) - 1 ? prev + 1 : prev));
    };

    const handleRemoveProject = () => {
        if (projects && projects.length > 0) {
            const updatedProjects = [...projects];
            updatedProjects.splice(currentProjectIndex, 1);
            // Note: This would need to be handled by the backend to actually remove the project
            // For now, we'll just refresh the projects list
            refreshProjects();
            
            // Adjust currentProjectIndex if necessary
            if (currentProjectIndex >= updatedProjects.length) {
                setCurrentProjectIndex(Math.max(0, updatedProjects.length - 1));
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-4">
                        Pokemon Game Engine Editor
                    </h1>
                    <p className="text-slate-300 text-lg">
                        Welcome to your project management dashboard
                    </p>
                </div>

                <div className="flex flex-col items-center space-y-8">
                    {/* Project Navigation */}
                    {projects?.length > 1 && (
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handlePrevProject}
                                disabled={currentProjectIndex === 0}
                                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            <span className="text-white">
                                {currentProjectIndex + 1} of {projects.length}
                            </span>
                            <button
                                onClick={handleNextProject}
                                disabled={currentProjectIndex === projects.length - 1}
                                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    )}

                    <div className="flex flex-col items-center w-full space-y-4">
                        {projects?.length > 0 ? (
                            <>
                                <ProjectCard key={projects[currentProjectIndex].ID} project={projects[currentProjectIndex]} />
                                <button 
                                    onClick={handleRemoveProject}
                                    className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200 flex items-center space-x-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <span>Remove Project</span>
                                </button>
                            </>
                        ) : (
                            <WelcomeMessage />
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-8">
                        <button 
                            onClick={() => setClickedNewProject(true)}
                            className="px-6 py-2 bg-tealBlue text-white rounded-xl hover:bg-wildBlueYonder transition-colors duration-200 flex items-center space-x-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            <span>New Project</span>
                        </button>

                        <button 
                            onClick={async () => {
                                await ImportProject();
                                // Refresh the projects list
                                await refreshProjects();
                            }} 
                            className="px-6 py-2 bg-tealBlue text-white rounded-xl hover:bg-wildBlueYonder transition-colors duration-200 flex items-center space-x-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            <span>Import Project</span>
                        </button>
                    </div>

                    {clickedNewProject && <NewProject setClickedNewProject={setClickedNewProject}/>}
                </div>
            </div>
        </div>
    )
}

export default HomePage