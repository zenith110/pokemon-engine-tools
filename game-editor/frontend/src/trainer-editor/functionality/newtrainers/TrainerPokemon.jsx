import { useState} from "react"

import PokemonStats from "./pokemon/PokemonStats"
const TrainerPokemon = ({ pokemonSpeciesList, heldItemsList, pokemonIndex, setPokemonIndex, pokemonsCount, dictData, setDictData}) => {
    const [currentlySelectedPokemon, setCurrentlySelectedPokemon] = useState({})
    const SetData = (e) => {
        const pokemon = pokemonSpeciesList.find((pokemon) => pokemon.Name === e.target.value)
        setCurrentlySelectedPokemon(pokemon)
    }

    return(
        <>
        <p>Pokemon #{pokemonIndex}</p>
        <div className="text-black flex flex-row justify-around text-align center">
        <select name="pokemons" onChange={(e) => SetData(e)} defaultValue={"placeholder"}>
            <option value={"placeholder"} disabled>Select a pokemon</option>
            {pokemonSpeciesList.map((pokemon) =>
                <option value={pokemon.Name} key={pokemon.Name}>{pokemon.Name}</option>
            )}
        </select>
        </div>
        {Object.keys(currentlySelectedPokemon).length >= 1 ? <PokemonStats currentlySelectedPokemon={currentlySelectedPokemon} heldItemsList={heldItemsList} setPokemonIndex={setPokemonIndex} pokemonsCount={pokemonsCount} pokemonIndex={pokemonIndex} dictData={dictData} setDictData={setDictData}/> : <></>}
        <br/>
        </>
    )
}
export default TrainerPokemon