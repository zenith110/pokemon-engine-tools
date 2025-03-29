import { useState } from "react";
import Modal from 'react-modal';
import { models } from "../../../../wailsjs/go/models";
import { LoadPokemonById } from "../../../../wailsjs/go/parsing/ParsingApp";

interface NewPokemonProps {
    selectedTrainer: models.TrainerJson;
    pokemonSpecies: { Name: string; ID: string; }[];  // Updated type
    setSelectedTrainer: (trainer: models.TrainerJson) => void;
    heldItems: { Name: string }[];
    isOpen: boolean;
    onRequestClose: () => void;
}

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#1e293b', // slate-800
        borderRadius: '1.5rem',
        border: 'none',
        padding: '2rem',
        maxWidth: '90vw',
        width: '600px',
        maxHeight: '90vh',
        overflowY: 'auto' as const,
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.75)'
    }
};

const NewPokemon = ({ selectedTrainer, pokemonSpecies, setSelectedTrainer, heldItems, isOpen, onRequestClose }: NewPokemonProps) => {
    const [selectedPokemon, setSelectedPokemon] = useState<models.PokemonTrainerEditor | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [move1, setMove1] = useState<string>("");
    const [move2, setMove2] = useState<string>("");
    const [move3, setMove3] = useState<string>("");
    const [move4, setMove4] = useState<string>("");
    const [heldItem, setHeldItem] = useState<string>("");
    const [level, setLevel] = useState<number>(1);

    const loadPokemonData = async (pokemonId: string) => {
        setIsLoading(true);
        try {
            const pokemonData = await LoadPokemonById(pokemonId);
            if (pokemonData) {
                setSelectedPokemon(pokemonData);
            }
        } catch (error) {
            console.error('Error loading Pokemon data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            style={customStyles}
            contentLabel="New Pokemon Modal"
        >
            <div className="text-white">
                <div className="flex flex-col items-center">
                    <div className="w-full max-w-2xl bg-slate-700 rounded-xl p-6 shadow-lg">
                        <h2 className="text-2xl font-bold text-white mb-6 text-center">Add New Pokemon</h2>

                        {/* Pokemon Preview Section */}
                        <div className="flex flex-col items-center mb-6 bg-slate-800 rounded-xl p-4">
                            {isLoading ? (
                                <div className="flex flex-col items-center space-y-4 p-8">
                                    <div className="w-8 h-8 border-4 border-tealBlue border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-sm text-gray-400">Loading Pokemon data...</p>
                                </div>
                            ) : selectedPokemon ? (
                                <>
                                    <img 
                                        src={`data:image/png;base64,${selectedPokemon.FrontSprite}`} 
                                        alt="Front Sprite" 
                                        className="w-32 h-32 object-contain mb-4"
                                    />
                                    <img 
                                        src={`data:image/gif;base64,${selectedPokemon.Icon}`} 
                                        alt="Icon" 
                                        className="w-16 h-16 object-contain mb-4"
                                    />
                                </>
                            ) : (
                                <div className="w-32 h-32 flex items-center justify-center bg-slate-700 rounded-xl mb-4">
                                    <p className="text-gray-400">Select a Pokemon</p>
                                </div>
                            )}

                            <select 
                                name="pokemons" 
                                defaultValue={"placeholder"} 
                                onChange={async (e) => {
                                    const pokemonData = pokemonSpecies.find((pokemon) => pokemon.Name === e.target.value);
                                    if (pokemonData) {
                                        await loadPokemonData(pokemonData.ID);
                                    }
                                }}
                                className="w-full px-3 py-2 rounded-lg bg-slate-800 text-white border border-slate-600 focus:border-slate-500 focus:outline-none [&>*]:bg-slate-800"
                            >
                                <option value={"placeholder"} disabled className="text-gray-400">Select a pokemon</option>
                                {pokemonSpecies.map((pokemon) =>
                                    <option value={pokemon.Name} key={pokemon.ID} className="hover:bg-slate-700">{pokemon.Name}</option>
                                )}
                            </select>
                        </div>

                        {selectedPokemon && (
                            <>
                                {/* Moves Section */}
                                <div className="bg-slate-800 rounded-xl p-4 mb-6">
                                    <h3 className="text-lg font-semibold mb-4 text-center">Moves</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { label: "Move 1", value: move1, setter: setMove1 },
                                            { label: "Move 2", value: move2, setter: setMove2 },
                                            { label: "Move 3", value: move3, setter: setMove3 },
                                            { label: "Move 4", value: move4, setter: setMove4 }
                                        ].map((move, idx) => (
                                            <div key={idx}>
                                                <label className="block text-sm mb-1 text-gray-300">{move.label}</label>
                                                <select 
                                                    defaultValue={"placeholder"} 
                                                    onChange={(e) => move.setter(e.target.value)}
                                                    className="w-full px-2 py-1 rounded-lg bg-slate-800 text-white border border-slate-600 focus:border-slate-500 focus:outline-none [&>*]:bg-slate-800"
                                                >
                                                    <option value={"placeholder"} disabled className="text-gray-400">Select a move</option>
                                                    {selectedPokemon.Moves?.map((m) =>
                                                        <option value={m.Name} key={m.Name} className="hover:bg-slate-700">{m.Name}</option> 
                                                    )}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Stats Section */}
                                <div className="bg-slate-800 rounded-xl p-4 mb-6">
                                    <h3 className="text-lg font-semibold mb-4 text-center">Stats</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm mb-1 text-gray-300">HP</label>
                                            <input 
                                                type="number" 
                                                defaultValue={selectedPokemon.HP} 
                                                disabled
                                                className="w-full px-2 py-1 rounded-lg bg-slate-700 text-white text-center"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm mb-1 text-gray-300">Attack</label>
                                            <input 
                                                type="number" 
                                                defaultValue={selectedPokemon.Attack} 
                                                disabled
                                                className="w-full px-2 py-1 rounded-lg bg-slate-700 text-white text-center"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm mb-1 text-gray-300">Defense</label>
                                            <input 
                                                type="number" 
                                                defaultValue={selectedPokemon.Defense} 
                                                disabled
                                                className="w-full px-2 py-1 rounded-lg bg-slate-700 text-white text-center"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm mb-1 text-gray-300">Sp. Attack</label>
                                            <input 
                                                type="number" 
                                                defaultValue={selectedPokemon.SpecialAttack} 
                                                disabled
                                                className="w-full px-2 py-1 rounded-lg bg-slate-700 text-white text-center"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm mb-1 text-gray-300">Sp. Defense</label>
                                            <input 
                                                type="number" 
                                                defaultValue={selectedPokemon.SpecialDefense} 
                                                disabled
                                                className="w-full px-2 py-1 rounded-lg bg-slate-700 text-white text-center"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm mb-1 text-gray-300">Speed</label>
                                            <input 
                                                type="number" 
                                                defaultValue={selectedPokemon.Speed} 
                                                disabled
                                                className="w-full px-2 py-1 rounded-lg bg-slate-700 text-white text-center"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Info Section */}
                                <div className="bg-slate-800 rounded-xl p-4 mb-6">
                                    <h3 className="text-lg font-semibold mb-4 text-center">Additional Info</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm mb-1 text-gray-300">Level</label>
                                            <input 
                                                type="number" 
                                                defaultValue={1} 
                                                onChange={(e) => setLevel(Number(e.target.value))}
                                                className="w-full px-2 py-1 rounded-lg bg-white text-slate-800 text-center"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm mb-1 text-gray-300">Held Item</label>
                                            <select 
                                                name="heldItem" 
                                                defaultValue={"placeholder"} 
                                                onChange={(e) => setHeldItem(e.target.value)}
                                                className="w-full px-2 py-1 rounded-lg bg-slate-800 text-white border border-slate-600 focus:border-slate-500 focus:outline-none [&>*]:bg-slate-800"
                                            >
                                                <option value={"placeholder"} disabled className="text-gray-400">Select a held item</option>
                                                {heldItems.map((heldItem) =>
                                                    <option value={heldItem.Name} key={heldItem.Name} className="hover:bg-slate-700">{heldItem.Name}</option> 
                                                )}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Save Button */}
                        <div className="flex justify-center space-x-4">
                            <button 
                                onClick={onRequestClose}
                                className="px-6 py-2 bg-slate-600 text-white rounded-xl hover:bg-slate-500 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    if (selectedPokemon) {
                                        let newPokemon: models.PokemonJson = {
                                            species: selectedPokemon.Name,
                                            attack: selectedPokemon.Attack,
                                            defense: selectedPokemon.Defense,
                                            speed: selectedPokemon.Speed,
                                            specialAttack: selectedPokemon.SpecialAttack,
                                            specialDefense: selectedPokemon.SpecialDefense,
                                            hp: selectedPokemon.HP,
                                            moves: [move1, move2, move3, move4],
                                            icon: selectedPokemon.Icon,
                                            front: selectedPokemon.FrontSprite,
                                            id: selectedPokemon.ID,
                                            level: level,
                                            heldItem: heldItem,
                                            cry: selectedPokemon.Cry
                                        }
                                        selectedTrainer.pokemons.push(newPokemon)
                                        setSelectedTrainer(selectedTrainer)
                                        onRequestClose()
                                    }
                                }}
                                disabled={!selectedPokemon}
                                className={`px-6 py-2 text-white rounded-xl transition-colors duration-200 ${
                                    selectedPokemon 
                                        ? 'bg-tealBlue hover:bg-wildBlueYonder' 
                                        : 'bg-gray-500 cursor-not-allowed'
                                }`}
                            >
                                Add Pokemon
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default NewPokemon; 