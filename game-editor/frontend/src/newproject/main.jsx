import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';

import { GrabProjectWorkspace, CreateProject} from "../../wailsjs/go/main/App";
const NewProject = () => {
    const [projectName, setProjectName] = useState("");
    const [projectDirectory, setProjectDirectory] = useState("")

    return(
        <div>
            <label>Project name:</label>
            <input onChange={(e) => setProjectName(e.target.value)}></input>
            <br/>
            <label>Project Directory:</label>
            <button onClick={async() => {
                let data = await GrabProjectWorkspace();
                setProjectDirectory(data)
            }}></button>
            <button onClick={async() => {
                let data = {
                    "name": projectName,
                    "directory": projectDirectory,
                    "id": uuidv4()
                }
                await CreateProject(data)
            }}>Submit</button>
        </div>
    )
}
export default NewProject