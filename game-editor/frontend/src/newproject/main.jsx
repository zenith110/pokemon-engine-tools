import { useState } from "react"
const NewProject = () => {
    const [projectName, setProjectName] = useState("");
    const [projectDirectory, setProjectDirectory] = useState("")

    return(
        <div>
            <label>Project name:</label>
            <input onChange={(e) => setProjectName(e.target.value)}></input>
            <br/>
            <label>Project Directory:</label>
            <button></button>
        </div>
    )
}
export default NewProject