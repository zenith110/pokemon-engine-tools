import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

import { ParseTrainers, ParseTrainerClass, ParsePokemonData, ParseHeldItems} from "../../wailsjs/go/main/App";
import Trainer from "./functionality/existingtrainers/Trainer";
//\import { Trainer } from "./trainer.models";

const TrainerEditor = () => {
    const [trainers, setTrainers] = useState([]);
    const [selectedTrainer, setSelectedTrainer] = useState();
    const [classTypes, setClassTypes] = useState([])
    const [heldItems, setHeldItems] = useState([])
    const [pokemonSpecies, setPokemonSpecies] = useState([])
    const navigate = useNavigate();
    
    useEffect(() => { 
        const fetchTrainers = async() => {
            let data = await ParseTrainers()
            setTrainers(data)
        }
        const fetchClassTypes = async() => {
            let data = await ParseTrainerClass()
            setClassTypes(data.Data)
        }
        const fetchPokemonSpecies = async() => {
            let data = await ParsePokemonData()
            setPokemonSpecies(data)
        }
        const heldItems = async() => {
            let data = await ParseHeldItems()
            
            setHeldItems(data)
        }
        fetchPokemonSpecies();
        fetchTrainers();
        fetchClassTypes();
        heldItems();
    }, [selectedTrainer]) 
    return(
        <>
           <div className="text-black flex items-center justify-center">
           <Select name="trainers"
           options={trainers?.map(trainer => ({ value: trainer.id, label: `${trainer.name}`}))} 
           onChange={(e) => {
                const trainerData = trainers.find((trainer) => trainer.id === e?.value);
                setSelectedTrainer(trainerData);
                }}
                isClearable={false}
                isDisabled={false}
                isLoading={false}
                isRtl={false}
                isSearchable={true}
                isMulti={false}
                classNames={{
                    control: () => "rounded-2xl"
                }}
            />
            </div>
            {selectedTrainer ? <Trainer selectedTrainer={selectedTrainer} heldItems={heldItems} pokemonSpecies={pokemonSpecies} setSelectedTrainer={setSelectedTrainer} classTypes={classTypes}/> : <></>}
           <br/>
           <button onClick={() => navigate("new-trainer")} className="file: bg-blueWhale rounded border-1 border-solid w-1/6 border-black">New trainer</button>
           <br/>
        </>
    )
}
export default TrainerEditor