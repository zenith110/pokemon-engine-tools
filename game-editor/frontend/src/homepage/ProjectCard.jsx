import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Button,
  } from "@material-tailwind/react";

import { SelectProject } from "../../wailsjs/go/main/App";
const ProjectCard = ({ project }) => {
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
            <Card className="mt-3 w-96 h-22 text-black content-center">
            <CardHeader color="blue-gray" className="h-10 mt-0 w-15 text-black">
                <h1>Project: {project.Name}</h1>
            </CardHeader>
            <CardBody>
                <Button  className="text-black" onClick={async() => {
                    await SelectProject(project)
                }}>Select</Button>
                <br/>
            </CardBody>
            <CardFooter className="text-black">
             {finalDate}
            </CardFooter>
            </Card>
        </div>
    )
}

export default ProjectCard