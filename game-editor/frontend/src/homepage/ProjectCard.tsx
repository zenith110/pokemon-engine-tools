import React from "react";
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Button,
  } from "@material-tailwind/react";
import { Project } from "../models/project";
import { SelectProject } from "../../wailsjs/go/core/App";
const ProjectCard = ({ project }: { project: Project }) => {
    let finalDate = ""
    if(project.LastUsed === "N/A"){
        finalDate = "Has not been selected yet"
    }
    else{
        var date = new Date(project.LastUsed)
        finalDate = `Last used on ${date.toDateString()} at ${date.toLocaleTimeString()}`
    }
    return(
        <div>
            <Card placeholder="" className="mt-3 w-96 h-22 text-black content-center" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
            <CardHeader placeholder="" color="blue-gray" className="h-10 mt-0 w-15 text-black" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                <h1>Project: {project.Name}</h1>
            </CardHeader>
            <CardBody placeholder="" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                <Button placeholder="" className="text-black" onClick={async() => {
                    await SelectProject(project)
                }} onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>Select</Button>
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