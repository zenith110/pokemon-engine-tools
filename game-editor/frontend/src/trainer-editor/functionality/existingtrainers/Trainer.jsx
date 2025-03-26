import { useState } from "react"
import { UpdateTrainer, UpdateTrainerSprite } from "../../../../wailsjs/go/trainereditor/TrainerEditorApp";
import UpdatingPokemon from "./UpdatingPokemon";
const Trainer = ({ selectedTrainer, heldItems, pokemonSpecies, setSelectedTrainer, classTypes}) => {
    const [trainerName, setTrainerName] = useState(selectedTrainer?.name)
    const [trainerClass, setTrainerClass] = useState(selectedTrainer?.classType)
    const [trainerSprite, setTrainerSprite] = useState(selectedTrainer?.spritename)
    return(
        <div>
            <div className="text-black flex items-center justify-center">
                <button onClick={async() => {
                    let sprite = await UpdateTrainerSprite()
                    setTrainerSprite(sprite)
                }}><img src={selectedTrainer? `data:image/png;base64,${selectedTrainer?.sprite}` : ''} alt="Trainer Sprite" /></button>
            </div>
            <br/>
            <div className="text-white flex items-center justify-center">
                <label>Trainer name: </label>
            </div>
            <div className="text-black flex items-center justify-center">
                <input defaultValue={selectedTrainer?.name? selectedTrainer.name : ''} onChange={(e) => setTrainerName(e.target.value)}/>
            </div>
            <br/>
            <label>Trainer class</label>
            <div className="text-black flex items-center justify-center">
                <select name="trainerClasses" defaultValue={selectedTrainer?.classType? selectedTrainer.classType : 'placeholder'} onChange={(e) => setTrainerClass(e.target.value)}>
                <option value={"placeholder"} disabled>Select a trainer class</option>
                {classTypes.map((trainerClass) =>
                    <option value={trainerClass.Name} key={trainerClass.id}>{trainerClass.Name}</option>
                )}
                </select>
            </div>
            {selectedTrainer?.pokemons.map((pokemon, index) =>
                <UpdatingPokemon selectedTrainer={selectedTrainer} pokemonSpecies={pokemonSpecies} setSelectedTrainer={setSelectedTrainer} index={index} pokemon={pokemon} heldItems={heldItems}/>
            )}
           <br/>
           <button className="file: bg-blueWhale rounded border-1 border-solid w-1/6 border-black" onClick={()=> {
                let updatedTrainer = {
                    "name": trainerName,
                    "sprite": trainerSprite,
                    "classType": trainerClass,
                    "id": selectedTrainer.id,
                    "pokemons": selectedTrainer.pokemons
                }
                UpdateTrainer(updatedTrainer)
           }}>Save</button>
        </div>
    )
}
export default Trainer