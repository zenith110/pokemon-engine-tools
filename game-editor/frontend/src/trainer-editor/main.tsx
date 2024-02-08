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
           <button onClick={() => setNewTrainer(true)} className="file: bg-blueWhale rounded border-1 border-solid w-1/6 border-black">Create new trainer</button>
           <br/>
           <br/>
           <button onClick={() => setEditTrainers(true)} className="file: bg-blueWhale rounded border-1 border-solid w-1/6 border-black">Edit trainers</button>
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