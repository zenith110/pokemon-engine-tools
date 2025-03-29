import { useState } from "react"
import { UpdateTrainer, UpdateTrainerSprite } from "../../../../wailsjs/go/trainereditor/TrainerEditorApp";
import UpdatingPokemon from "./UpdatingPokemon";
import NewPokemon from "./NewPokemon";
import NewTrainerClass from "./NewTrainerClass";
import { models } from "../../../../wailsjs/go/models";

interface TrainerProps {
    selectedTrainer: models.TrainerJson;
    heldItems: { Name: string }[];
    pokemonSpecies: { Name: string; ID: string; }[];
    setSelectedTrainer: (trainer: models.TrainerJson) => void;
    classTypes: models.Data[];
    setClassTypes: (classTypes: models.Data[]) => void;
}

const Trainer = ({ selectedTrainer, heldItems, pokemonSpecies, setSelectedTrainer, classTypes, setClassTypes}: TrainerProps) => {
    const [trainerName, setTrainerName] = useState(selectedTrainer?.name)
    const [trainerClass, setTrainerClass] = useState(selectedTrainer?.classType)
    const [trainerSprite, setTrainerSprite] = useState(selectedTrainer?.spritename)
    const [isNewPokemonModalOpen, setIsNewPokemonModalOpen] = useState(false);
    const [isNewTrainerClassModalOpen, setIsNewTrainerClassModalOpen] = useState(false);
    
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
                        <div className="flex items-center space-x-2 w-full">
                            <div className="flex-grow">
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
                            <button
                                onClick={() => setIsNewTrainerClassModalOpen(true)}
                                className="mt-6 px-3 py-1 bg-tealBlue text-white rounded-lg hover:bg-wildBlueYonder transition-colors duration-200 flex items-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
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
                    {selectedTrainer?.pokemons.length < 6 && (
                        <button 
                            onClick={() => setIsNewPokemonModalOpen(true)}
                            className="bg-slate-700 rounded-lg p-4 shadow-md flex flex-col items-center justify-center hover:bg-slate-600 transition-colors duration-200 min-h-[200px]"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-tealBlue mb-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            <span className="text-white font-medium">New Pokemon</span>
                        </button>
                    )}
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

            <NewPokemon
                selectedTrainer={selectedTrainer}
                pokemonSpecies={pokemonSpecies}
                setSelectedTrainer={setSelectedTrainer}
                heldItems={heldItems}
                isOpen={isNewPokemonModalOpen}
                onRequestClose={() => setIsNewPokemonModalOpen(false)}
            />

            <NewTrainerClass
                classTypes={classTypes}
                setClassTypes={setClassTypes}
                isOpen={isNewTrainerClassModalOpen}
                onRequestClose={() => setIsNewTrainerClassModalOpen(false)}
            />
        </div>
    )
}

export default Trainer