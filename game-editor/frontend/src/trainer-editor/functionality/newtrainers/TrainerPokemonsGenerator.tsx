import Generator from "./Generator"
import { models } from "../../../../bindings/github.com/zenith110/pokemon-engine-tools/models";

interface TrainerPokemonsGeneratorProps {
    pokemonSpeciesList: models.PokemonTrainerEditor[];
    heldItemsList: { Name: string }[];
    pokemonsCount: number;
    dictData: { name: string; classType: string; pokemons: any[] };
    setDictData: (data: { name: string; classType: string; pokemons: any[] }) => void;
}

const TrainerPokemonsGenerator = ({ pokemonSpeciesList, heldItemsList, pokemonsCount, dictData, setDictData}: TrainerPokemonsGeneratorProps) => {
    return(
        <>
        { pokemonsCount >= 1 ? <Generator pokemonSpeciesList={pokemonSpeciesList} heldItemsList={heldItemsList} pokemonsCount={pokemonsCount} dictData={dictData} setDictData={setDictData}/>: <></>}
        </>
    )
}

export default TrainerPokemonsGenerator