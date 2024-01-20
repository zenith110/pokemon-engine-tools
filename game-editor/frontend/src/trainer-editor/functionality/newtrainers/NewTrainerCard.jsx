import { useState, useEffect } from "react"
import { ParsePokemonData, ParseHeldItems, ParseTrainerClass} from "../../../../wailsjs/go/main/App"
import TrainerPokemonsGenerator from "./TrainerPokemonsGenerator"
import TrainerClasses from "./TrainerClasses";
const NewTrainerCard = ({ setNewTrainer }) => {
    const [classTypes, setClassTypes] = useState([])
    const [pokemonSpecies, setPokemonSpecies] = useState([])
    const [pokemonCount, setPokemonCount] = useState(0)
    const [heldItemsList, setHeldItemList] = useState([])
    const [dictData, setDictData ] = useState({
        "name": "",
        "setNewTrainer": setNewTrainer,
        "classType": "",
        "pokemons": []
    })
    useEffect(() => { 
        const fetchClassTypes = async() => {
            let data = await ParseTrainerClass()
            setClassTypes(data.Data)
        }
        const fetchSprites = () => {

        }
        const fetchPokemonSpecies = async() => {
            let data = await ParsePokemonData()
            console.log(data)
            setPokemonSpecies(data)
        }
        const fetchHeldItemListData = async() => {
            let data = await ParseHeldItems()
            setHeldItemList(data)
        }
        fetchHeldItemListData()
        fetchClassTypes()
        fetchSprites()
        fetchPokemonSpecies()
    }, []) 
    
    return(
        <>
        <label>Trainer name: </label>
        <input type="text" onChange={(event) => setDictData(dictData => ({...dictData, name: event.target.value}))}></input>
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
        </>
    )
}
export default NewTrainerCard