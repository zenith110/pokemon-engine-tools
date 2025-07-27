import { useState } from "react";
import TrainerPokemon from "./TrainerPokemon"
import { models } from "../../../../bindings/github.com/zenith110/pokemon-engine-tools/models";

interface GeneratorProps {
    pokemonSpeciesList: models.PokemonTrainerEditor[];
    heldItemsList: { Name: string }[];
    pokemonsCount: number;
    dictData: any;
    setDictData: (data: any) => void;
}

const Generator = ({ pokemonSpeciesList, heldItemsList, pokemonsCount, dictData, setDictData}: GeneratorProps) => {
    const [pokemonIndex, setPokemonIndex] = useState(1)
    const parentStyle = {
        position: 'relative' as const,
        overflow: 'hidden' as const
    }
    const divStyle = {
        overflowY: 'scroll' as const,
        border: '1px solid red',
        width: '500px',
        marginLeft: 'auto',
        marginRight: 'auto',
        height: '500px',
        position: 'relative' as const,
        textAlign: 'center' as const,
        justifyContent: 'center' as const
    };
    return(
        <>
        <div style={parentStyle}>
        <div style={divStyle}> 
            <TrainerPokemon  pokemonSpeciesList={pokemonSpeciesList} heldItemsList={heldItemsList} key={pokemonIndex} pokemonIndex={pokemonIndex} setPokemonIndex={setPokemonIndex} pokemonsCount={pokemonsCount} dictData={dictData} setDictData={setDictData}/>
        </div>
        </div>
        <br/>
        <br/>
        </>
    )
}
export default Generator