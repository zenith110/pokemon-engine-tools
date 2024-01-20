import { useState } from "react";
import TrainerPokemon from "./TrainerPokemon"
const Generator = ({ pokemonSpeciesList, heldItemsList, pokemonsCount, dictData, setDictData}) => {
    const [pokemonIndex, setPokemonIndex] = useState(1)
    const parentStyle={
        position: 'relative',
        overflow: 'hidden'
    }
    const divStyle={
        overflowY: 'scroll',
        border:'1px solid red',
        width:'500px',
        marginLeft: 'auto',
        marginRight: 'auto',
        height:'500px',
        position:'relative',
        textAlign: 'center',
        justifyContent: 'center'
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