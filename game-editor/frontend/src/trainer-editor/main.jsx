import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UpdatingPokemon from "./UpdatingPokemon";


import { ParseTrainers, ParseTrainerClass, UpdateTrainer, ParsePokemonData, UpdateTrainerSprite, ParseHeldItems} from "../../wailsjs/go/main/App";

//\import { Trainer } from "./trainer.models";

const TrainerEditor = () => {
    const [trainers, setTrainers] = useState([]);
    const [selectedTrainer, setSelectedTrainer] = useState();
    const [classTypes, setClassTypes] = useState([])
    const [trainerName, setTrainerName] = useState("")
    const [trainerClass, setTrainerClass] = useState("")
    const [pokemonSpecies, setPokemonSpecies] = useState([])
    const [trainerSprite, setTrainerSprite] = useState("")
    const [heldItems, setHeldItems] = useState([])
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
            console.log(data)
            setHeldItems(data)
        }
        fetchPokemonSpecies();
        fetchTrainers();
        fetchClassTypes();
        heldItems();
    }, []) 
    return(
        <>
           <div className="text-black flex items-center justify-center">
           <select name="trainers" onChange={(e) => {
                const trainerData = trainers.find((trainer) => trainer.id === e.target.value);
                setSelectedTrainer(trainerData);
           }} defaultValue={selectedTrainer?.classType ? selectedTrainer?.classType : "placeholder"}>
            <option value={"placeholder"} disabled>Select a trainer</option>
            {trainers?.map((trainer) =>
                <option value={trainer.id} key={trainer.id}>{trainer.name}</option>
            )}
            </select>
            </div>
            <div className="text-black flex items-center justify-center">
                <button onClick={async() => {
                    let sprite = await UpdateTrainerSprite()
                    setTrainerSprite(sprite)
                }}><img src={selectedTrainer? `data:image/png;base64,${selectedTrainer?.sprite}` : ''} alt="Trainer Sprite" /></button>
            </div>
            <br/>
            <div className="text-white flex items-center justify-center">
                <label>Trainer name: </label>
            </div>
            <div className="text-black flex items-center justify-center">
                <input defaultValue={selectedTrainer?.name? selectedTrainer.name : ''} onChange={(e) => setTrainerName(e.target.value)}/>
            </div>
            <br/>
            <label>Trainer class</label>
            <div className="text-black flex items-center justify-center">
                <select name="trainerClasses" defaultValue={selectedTrainer?.classType? selectedTrainer.classType : 'placeholder'} onChange={(e) => setTrainerClass(e.target.value)}>
                <option value={"placeholder"} disabled>Select a trainer class</option>
                {classTypes.map((trainerClass) =>
                    <option value={trainerClass.Name} key={trainerClass.id}>{trainerClass.Name}</option>
                )}
                </select>
            </div>
            {selectedTrainer?.pokemons.map((pokemon, index) =>
                <UpdatingPokemon selectedTrainer={selectedTrainer} pokemonSpecies={pokemonSpecies} setSelectedTrainer={setSelectedTrainer} index={index} pokemon={pokemon} heldItems={heldItems}/>
            )}
           <br/>
           <button className="file: bg-blueWhale rounded border-1 border-solid w-1/6 border-black" onClick={()=> {
                let updatedTrainer = {
                    "name": trainerName,
                    "sprite": trainerSprite,
                    "classType": trainerClass,
                    "id": selectedTrainer.id,
                    "pokemons": selectedTrainer.pokemons
                }
                console.log(updatedTrainer)
                UpdateTrainer(updatedTrainer)
           }}>Save</button>
           <br/>
           <br/>
           <button onClick={() => navigate("new-trainer")} className="file: bg-blueWhale rounded border-1 border-solid w-1/6 border-black">New trainer</button>
           <br/>
        </>
    )
}
export default TrainerEditor