import { useState } from "react"
import { UpdateTrainer, UpdateTrainerSprite } from "../../../../wailsjs/go/trainereditor/TrainerEditorApp";
import UpdatingPokemon from "./UpdatingPokemon";
import { models } from "../../../../wailsjs/go/models";

interface TrainerProps {
    selectedTrainer: models.TrainerJson;
    heldItems: { Name: string }[];
    pokemonSpecies: models.PokemonTrainerEditor[];
    setSelectedTrainer: (trainer: models.TrainerJson) => void;
    classTypes: models.Data[];
}

const Trainer = ({ selectedTrainer, heldItems, pokemonSpecies, setSelectedTrainer, classTypes}: TrainerProps) => {
    const [trainerName, setTrainerName] = useState(selectedTrainer?.name)
    const [trainerClass, setTrainerClass] = useState(selectedTrainer?.classType)
    const [trainerSprite, setTrainerSprite] = useState(selectedTrainer?.spritename)
    
    return(
        <div className="bg-slate-700 rounded-xl p-6 space-y-6">
            {/* Trainer Info Section */}
            <div className="flex flex-col items-center space-y-4">
                <button 
                    onClick={async() => {
                        let sprite = await UpdateTrainerSprite()
                        setTrainerSprite(sprite)
                    }}
                    className="hover:opacity-80 transition-opacity"
                >
                    <img 
                        src={selectedTrainer? `data:image/png;base64,${selectedTrainer?.sprite}` : ''} 
                        alt="Trainer Sprite" 
                        className="w-24 h-24 object-contain"
                    />
                </button>

                <div className="w-full max-w-xs space-y-2">
                    <div className="flex flex-col items-center space-y-1">
                        <label className="text-white text-sm">Trainer name</label>
                        <input 
                            defaultValue={selectedTrainer?.name? selectedTrainer.name : ''} 
                            onChange={(e) => setTrainerName(e.target.value)}
                            className="px-3 py-1 rounded-lg bg-white text-slate-800 w-full"
                        />
                    </div>

                    <div className="flex flex-col items-center space-y-1">
                        <label className="text-white text-sm">Trainer class</label>
                        <select 
                            name="trainerClasses" 
                            defaultValue={selectedTrainer?.classType? selectedTrainer.classType : 'placeholder'} 
                            onChange={(e) => setTrainerClass(e.target.value)}
                            className="px-3 py-1 rounded-lg bg-slate-800 text-white w-full border border-slate-600 focus:border-slate-500 focus:outline-none"
                        >
                            <option value={"placeholder"} disabled className="bg-slate-800 text-white">Select a trainer class</option>
                            {classTypes.map((trainerClass) =>
                                <option value={trainerClass.Name} key={trainerClass.Name} className="bg-slate-800 text-white">{trainerClass.Name}</option>
                            )}
                        </select>
                    </div>
                </div>
            </div>

            {/* Pokemon Case Section */}
            <div className="bg-slate-800 rounded-xl p-4 shadow-inner">
                <h2 className="text-white text-lg font-semibold mb-4 text-center">Pokemon Team</h2>
                <div className="grid grid-cols-2 gap-4">
                    {selectedTrainer?.pokemons.map((pokemon, index) => (
                        <div key={index} className="bg-slate-700 rounded-lg p-4 shadow-md">
                            <UpdatingPokemon 
                                selectedTrainer={selectedTrainer} 
                                pokemonSpecies={pokemonSpecies} 
                                setSelectedTrainer={setSelectedTrainer} 
                                index={index} 
                                pokemon={pokemon} 
                                heldItems={heldItems}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-center">
                <button 
                    className="px-6 py-2 bg-tealBlue text-white rounded-xl hover:bg-wildBlueYonder transition-colors duration-200"
                    onClick={()=> {
                        let updatedTrainer: models.TrainerJson = {
                            "name": trainerName,
                            "sprite": trainerSprite,
                            "spritename": selectedTrainer.spritename,
                            "classType": trainerClass,
                            "id": selectedTrainer.id,
                            "pokemons": selectedTrainer.pokemons,
                            "convertValues": () => {}
                        }
                        UpdateTrainer(updatedTrainer)
                    }}
                >
                    Save Changes
                </button>
            </div>
        </div>
    )
}

export default Trainer