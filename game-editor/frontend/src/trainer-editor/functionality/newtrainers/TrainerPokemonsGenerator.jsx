import Generator from "./Generator"
const TrainerPokemonsGenerator = ({ pokemonSpeciesList, heldItemsList, pokemonsCount, dictData, setDictData}) => {
    return(
        <>
        { pokemonsCount >= 1 ? <Generator pokemonSpeciesList={pokemonSpeciesList} heldItemsList={heldItemsList} pokemonsCount={pokemonsCount} dictData={dictData} setDictData={setDictData}/>: <></>}
        </>
    )
}

export default TrainerPokemonsGenerator