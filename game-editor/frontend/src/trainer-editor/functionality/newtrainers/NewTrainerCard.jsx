import { useState, useEffect } from "react"
import { ParsePokemonData, ParseHeldItems, ParseTrainerClass, GrabTrainerSprites} from "../../../../wailsjs/go/main/App"
import TrainerPokemonsGenerator from "./TrainerPokemonsGenerator"
import TrainerClasses from "./TrainerClasses";
import TrainerSprites from "./TrainerSprites";
import { useNavigate } from "react-router-dom";

const NewTrainerCard = () => {
    const navigate = useNavigate();
    const [classTypes, setClassTypes] = useState([])
    const [pokemonSpecies, setPokemonSpecies] = useState([])
    const [pokemonCount, setPokemonCount] = useState(0)
    const [heldItemsList, setHeldItemList] = useState([])
    const [trainerSprites, setTrainerSprites] = useState([])
    const [dictData, setDictData ] = useState({
        "name": "",
        "classType": "",
        "pokemons": []
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
        <input type="number"  min="1" max="6" onChange={(event) => setPokemonCount(event.target.value)}/>
        
        <br/>
        {
            pokemonSpecies.length >= 1 && heldItemsList.length >= 1 ? <TrainerPokemonsGenerator pokemonSpeciesList={pokemonSpecies} heldItemsList={heldItemsList} pokemonsCount={pokemonCount} dictData={dictData} setDictData={setDictData}/> : <></>
        }
        <button className="file: bg-blueWhale rounded border-1 border-solid w-1/6 border-black" onClick={() => navigate(-1)}>Go Back</button>
        </div>
    )
}
export default NewTrainerCard