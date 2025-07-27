import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Button,
  } from "@material-tailwind/react";
import { Project } from "../models/project";
import { SelectProject } from "../../bindings/github.com/zenith110/pokemon-engine-tools/tools-core/App";
import { useProjects } from "../contexts/ProjectContext";

const ProjectCard = ({ project }: { project: Project }) => {
    const { refreshProjects, hasSelectedProject } = useProjects();
    
    let finalDate = ""
    if(project.LastUsed === "N/A"){
        finalDate = "Has not been selected yet"
    }
    else{
        var date = new Date(project.LastUsed)
        finalDate = `Last used on ${date.toDateString()} at ${date.toLocaleTimeString()}`
    }

    // Check if this project is currently selected
    const isSelected = hasSelectedProject && project.LastUsed !== "N/A" && project.FolderLocation !== "";

    const handleSelectProject = async () => {
        try {
            await SelectProject(project);
            // Refresh the projects context instead of reloading the page
            await refreshProjects();
        } catch (error) {
            console.error('Error selecting project:', error);
        }
    };

    return(
        <div>
            <Card placeholder="" className="mt-3 w-96 h-22 text-black content-center relative" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                {/* Selected indicator */}
                {isSelected && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                        Selected
                    </div>
                )}
                
                <CardHeader placeholder="" color="blue-gray" className="h-10 mt-0 w-15 text-black" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                    <h1>Project: {project.Name}</h1>
                </CardHeader>
                <CardBody placeholder="" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                    <Button placeholder="" className="text-black" onClick={handleSelectProject} onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>Select</Button>
                    <br/>
                </CardBody>
                <CardFooter placeholder="" className="text-black" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                 {finalDate}
                </CardFooter>
            </Card>
        </div>
    )
}

export default ProjectCard