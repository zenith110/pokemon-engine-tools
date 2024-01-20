
import NewTrainerCard from "./trainer-editor/functionality/newtrainers/NewTrainerCard"
import { useState } from "react"
import { SetDataFolder } from "../wailsjs/go/main/App"
import LoadTrainers from "./trainer-editor/functionality/existingtrainers/LoadTrainers"
function App() {
    const [newTrainer, setNewTrainer] = useState(false)
    const [editTrainers, setEditTrainers] = useState(false)
    const OptionsMenu = async() => {
        await SetDataFolder()

    }
    return (
        <>
           <button onClick={() => setNewTrainer(true)}>Create new trainer</button>
           <button onClick={() => setEditTrainers(true)}>Edit trainers</button>
           <br/>
           {
            newTrainer ? <NewTrainerCard setNewTrainer={setNewTrainer}/> : <></>
           }
           {
            editTrainers ? <LoadTrainers /> : <></>
           }
           <button onClick={() => OptionsMenu()}>Select Folder</button>
        </>
    )
}

export default App
