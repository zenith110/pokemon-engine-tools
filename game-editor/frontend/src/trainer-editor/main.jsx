import { useState } from "react"
import LoadTrainers from "./functionality/existingtrainers/LoadTrainers"
import NewTrainerCard from "./functionality/newtrainers/NewTrainerCard"
const TrainerEditor = () => {
    const [newTrainer, setNewTrainer] = useState(false)
    const [editTrainers, setEditTrainers] = useState(false)
    return(
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
        </>
    )
}
export default TrainerEditor