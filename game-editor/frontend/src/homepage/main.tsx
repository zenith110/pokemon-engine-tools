import React from "react";
import { useEffect, useState } from "react"
import { ParseProjects, ImportProject} from "../../wailsjs/go/core/App";
import { Project } from "../models/project";

import NewProject from "./NewProject";
import ProjectCard from "./ProjectCard";
import WelcomeMessage from "./WelcomeMessage";

const HomePage = () => {
    const [projects, setProjects] = useState<Project[]>([])
    const [clickedNewProject, setClickedNewProject] = useState(false)
    const [currentProjectIndex, setCurrentProjectIndex] = useState(0)

    useEffect(() => {
        const fetchProjects = async() => {
            let data = await ParseProjects();
            setProjects(data);
        }
        fetchProjects()
    }, [])

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
            setProjects(updatedProjects);
            
            // Adjust currentProjectIndex if necessary
            if (currentProjectIndex >= updatedProjects.length) {
                setCurrentProjectIndex(Math.max(0, updatedProjects.length - 1));
            }
        }
    };

    return(
        <div className="flex flex-col items-center min-h-screen bg-slate-800 p-6">
            <div className="w-full max-w-3xl bg-slate-700 rounded-2xl shadow-lg p-6">
                <div className="flex flex-col items-center space-y-6">
                    <h1 className="text-2xl font-bold text-white mb-4">Project Manager</h1>
                    
                    <div className="flex items-center justify-center w-full relative px-12">
                        <button 
                            onClick={handlePrevProject}
                            disabled={currentProjectIndex === 0}
                            className={`absolute left-0 p-2 rounded-full ${currentProjectIndex === 0 ? 'bg-slate-600 text-gray-400' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

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

                        <button 
                            onClick={handleNextProject}
                            disabled={currentProjectIndex === (projects?.length || 0) - 1}
                            className={`absolute right-0 p-2 rounded-full ${currentProjectIndex === (projects?.length || 0) - 1 ? 'bg-slate-600 text-gray-400' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex items-center space-x-4 mt-6">
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
                            onClick={() => ImportProject()} 
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