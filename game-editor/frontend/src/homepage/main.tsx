import React from "react";
import { useEffect, useState } from "react"
import { ParseProjects, ImportProject} from "../../wailsjs/go/core/App";
import { Project } from "../models/project";

import NewProject from "./NewProject";
import ProjectCard from "./ProjectCard";
import WelcomeMessage from "./WelcomeMessage";
const  HomePage = () => {
    const [projects, setProjects] = useState<Project[]>([])
    const [clickedNewProject, setClickedNewProject] = useState(false)
    useEffect(() => {
        const fetchProjects = async() => {
            let data = await ParseProjects();
            setProjects(data);
        }
        fetchProjects()
    }, [])
    return(
        <div>
            {projects == null ? <WelcomeMessage/> : <div/>}
            
            <button onClick={() => setClickedNewProject(true)}>New Project</button>
            {clickedNewProject ? <NewProject setClickedNewProject={setClickedNewProject}/> : <div/>}
            <br/>
            {projects?.map((project) =>
                <div>
                    <ProjectCard key={project.ID} project={project} />
                </div> 
            )}
            <button onClick={() => ImportProject()}>Import Project</button>
        </div>
    )
}
export default HomePage