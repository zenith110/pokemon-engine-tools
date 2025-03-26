import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';

import { GrabProjectWorkspace, CreateProject} from "../../wailsjs/go/core/App";
const NewProject = ({ setClickedNewProject }: { setClickedNewProject: (value: boolean) => void }) => {
    const [projectName, setProjectName] = useState("");
    const [projectDirectory, setProjectDirectory] = useState("")
    const [status, setStatus] = useState("");
    return(
        <div>
            <label>Project name:</label>
            <br/>
            <input onChange={(e) => setProjectName(e.target.value)} className="text-black"></input>
            <br/>
            <button onClick={async() => {
                let data = await GrabProjectWorkspace();
                setProjectDirectory(data)
            }}>Project Directory</button>
            <br/>
            <button onClick={async() => {
                let data = {
                    "name": projectName,
                    "directory": projectDirectory,
                    "id": uuidv4()
                }
                setStatus(`${projectName} is being created!`)
                let gitRepoCreationStatus = await CreateProject(data)
                if(gitRepoCreationStatus === true){
                    setStatus(`${projectName} has been created!`)
                    setClickedNewProject(false)
                }
            }}>Submit</button>
            <p>{status}</p>
        </div>
    )
}
export default NewProject