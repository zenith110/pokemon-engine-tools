import { useState } from "react"
import { models } from "../../../../bindings/github.com/zenith110/pokemon-engine-tools/models";
import PokemonStats from "./pokemon/PokemonStats"

interface TrainerPokemonProps {
    pokemonSpeciesList: models.PokemonTrainerEditor[];
    heldItemsList: { Name: string }[];
    pokemonIndex: number;
    setPokemonIndex: (index: number) => void;
    pokemonsCount: number;
    dictData: { name: string; classType: string; pokemons: any[] };
    setDictData: (data: { name: string; classType: string; pokemons: any[] }) => void;
}

const TrainerPokemon = ({ pokemonSpeciesList, heldItemsList, pokemonIndex, setPokemonIndex, pokemonsCount, dictData, setDictData}: TrainerPokemonProps) => {
    const [currentlySelectedPokemon, setCurrentlySelectedPokemon] = useState<models.PokemonTrainerEditor | null>(null)
    const SetData = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const pokemon = pokemonSpeciesList.find((pokemon) => pokemon.Name === e.target.value)
        if (pokemon) {
            setCurrentlySelectedPokemon(pokemon)
        }
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
        {currentlySelectedPokemon ? <PokemonStats currentlySelectedPokemon={currentlySelectedPokemon} heldItemsList={heldItemsList} setPokemonIndex={setPokemonIndex} pokemonsCount={pokemonsCount} pokemonIndex={pokemonIndex} dictData={dictData}/> : <></>}
        <br/>
        </>
    )
}
export default TrainerPokemon