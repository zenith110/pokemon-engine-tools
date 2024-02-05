import { useState } from "react";
import { useNavigate } from "react-router-dom";

import LoadTrainers from "./functionality/existingtrainers/LoadTrainers";
import NewTrainerCard from "./functionality/newtrainers/NewTrainerCard";

const TrainerEditor:React.FC = () => {
    const [newTrainer, setNewTrainer] = useState(false)
    const [editTrainers, setEditTrainers] = useState(false)
    const navigate = useNavigate();
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
           <button onClick={() => navigate(-1)}>Go back to main menu</button>
        </>
    )
}
export default TrainerEditor