import { useState } from "react"
const PokemonStats = ({ pokemonData }) => {
    const [species, setSpecies] = useState(pokemonData.species)
    const [ level, setLevel] = useState(pokemonData.level)
    const [ hp, setHp ] = useState(pokemonData.hp)
    const [ specialAtk, setSpecialAtk ] = useState(pokemonData.specialAtk)
    const [ specialDef, setSpecialDef ] = useState(pokemonData.specialDef)
    const [ speed, setSpeed ] = useState(pokemonData.speed)
    const [ attack, setAttack ] = useState(pokemonData.attack)
    const [ defense, setDefense ] = useState(pokemonData.defense)
    return(
        <>
        <label>Species: </label>
            <select value={species}></select>
        <br/>
        <label>HP: </label>
            <p>{hp}</p>
        <br/>
        <label>Level: </label>
            <p>{level}</p>
        <br/>
        <label>Special Attack: </label>
            <p>{specialAtk}</p>
        <br/>
        <label>Special Defense: </label>
            <p>{specialDef}</p>
        <br/>
        <label>Speed: </label>
            <p>{speed}</p>
        <br/>
        <label>Attack: </label>
            <p>{attack}</p>
        <br/>
        <label>Defense: </label>
            <p>{defense}</p>
        <br/>
        </>
    )
}
export default PokemonStats