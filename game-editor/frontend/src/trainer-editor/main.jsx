import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";
import { ParseTrainers } from "../../wailsjs/go/main/App";

//\import { Trainer } from "./trainer.models";

const TrainerEditor = () => {
    const [trainers, setTrainers] = useState([]);
    const [selectedTrainer, setSelectedTrainer] = useState();
    const navigate = useNavigate();
    useEffect(() => { 
        const fetchTrainers = async() => {
            let data = await ParseTrainers()
            setTrainers(data)
        }
        fetchTrainers()
        
    }, []) 
    return(
        <>
           <div className="text-black flex items-center justify-center">
           <select name="trainers" onChange={(e) => {
                const trainerData = trainers.find((trainer) => trainer.id === e.target.value);
                setSelectedTrainer(trainerData);
           }} defaultValue={"placeholder"}>
            <option value={"placeholder"} disabled>Select a trainer sprite</option>
            {trainers?.map((trainer) =>
                <option value={trainer.id} key={trainer.id}>{trainer.name}</option>
            )}
            </select>
            </div>
            <div className="text-black flex items-center justify-center">
                <img src={selectedTrainer? `data:image/png;base64,${selectedTrainer?.sprite}` : ''} alt="Trainer Sprite" />
            </div>
            <div className="text-white flex items-center justify-center">
                <label>Trainer name: {selectedTrainer?.name? selectedTrainer.name : ''}</label>
            </div>
            <label>Class type: {selectedTrainer?.classType? selectedTrainer.classType : ''}</label>
            {selectedTrainer?.pokemons.map((pokemon) =>
                <div className="text-black flex items-center justify-center">
                    <img src={pokemon? `data:image/png;base64,${pokemon?.front}` : ''} alt="Sprite" />
                </div>
            )}
           <br/>
           <button onClick={() => navigate("new-trainer")} className="file: bg-blueWhale rounded border-1 border-solid w-1/6 border-black">New trainer</button>
           <br/>
        </>
    )
}
export default TrainerEditor