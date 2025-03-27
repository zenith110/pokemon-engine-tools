import { useState, useEffect } from "react"
import { ParsePokemonData, ParseHeldItems, ParseTrainerClass, GrabTrainerSprites} from "../../../../wailsjs/go/parsing/ParsingApp"
import TrainerPokemonsGenerator from "./TrainerPokemonsGenerator"
import TrainerClasses from "./TrainerClasses";
import TrainerSprites from "./TrainerSprites";
import { useNavigate } from "react-router-dom";
import { models } from "../../../../wailsjs/go/models";

interface DictData {
    name: string;
    classType: string;
    pokemons: any[];
    sprite?: string;
}

const NewTrainerCard = () => {
    const navigate = useNavigate();
    const [classTypes, setClassTypes] = useState<models.Data[]>([])
    const [pokemonSpecies, setPokemonSpecies] = useState<models.PokemonTrainerEditor[]>([])
    const [pokemonCount, setPokemonCount] = useState<number>(0)
    const [heldItemsList, setHeldItemList] = useState<models.HeldItem[]>([])
    const [trainerSprites, setTrainerSprites] = useState<models.TrainerSprite[]>([])
    const [dictData, setDictData] = useState<DictData>({
        name: "",
        classType: "",
        pokemons: []
    })
    useEffect(() => { 
        const fetchClassTypes = async() => {
            let data = await ParseTrainerClass()
            setClassTypes(data.Data)
        }
        const fetchPokemonSpecies = async() => {
            let data = await ParsePokemonData()
            setPokemonSpecies(data)
        }
        const fetchHeldItemListData = async() => {
            let data = await ParseHeldItems()
            setHeldItemList(data)
        }
        const fetchTrainerSprites = async() => {
            let data = await GrabTrainerSprites()
            setTrainerSprites(data)
        }
        fetchTrainerSprites()
        fetchHeldItemListData()
        fetchClassTypes()
        fetchPokemonSpecies()
    }, []) 
    
    return(
        <div className="text-black">
        <label>Trainer name: </label>
        <br/>
        <input type="text" onChange={(event) => setDictData(dictData => ({...dictData, name: event.target.value}))}></input>
        <br/>
        <TrainerSprites trainerSprites={trainerSprites} dictData={dictData} setDictData={setDictData}/>
        <br/>
        <label>Select trainer class: </label>
        <TrainerClasses trainerClasses={classTypes} dictData = {dictData} setDictData={setDictData}/>
        <br/>
        <label>Total amount of pokemon: </label>
        <input type="number"  min="1" max="6" onChange={(event) => setPokemonCount(Number(event.target.value))}/>
        
        <br/>
        {
            pokemonSpecies.length >= 1 && heldItemsList.length >= 1 ? <TrainerPokemonsGenerator pokemonSpeciesList={pokemonSpecies} heldItemsList={heldItemsList} pokemonsCount={pokemonCount} dictData={dictData} setDictData={setDictData}/> : <></>
        }
        <button className="file: bg-blueWhale rounded border-1 border-solid w-1/6 border-black" onClick={() => navigate(-1)}>Go Back</button>
        </div>
    )
}
export default NewTrainerCard