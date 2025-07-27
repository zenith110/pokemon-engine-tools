import { useState } from "react";
import Modal from 'react-modal';
import { models } from "../../../../bindings/github.com/zenith110/pokemon-engine-tools/models";
import { LoadPokemonById } from "../../../../bindings/github.com/zenith110/pokemon-engine-tools/parsing/ParsingApp";

interface UpdatingPokemonProps {
    selectedTrainer: models.TrainerJson;
    pokemonSpecies: { Name: string; ID: string; }[];  // Changed to only include minimal data
    setSelectedTrainer: (trainer: models.TrainerJson) => void;
    index: number;
    pokemon: models.PokemonJson;
    heldItems: { Name: string }[];
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

const UpdatingPokemon = ({ selectedTrainer, pokemonSpecies, setSelectedTrainer, index, pokemon, heldItems}: UpdatingPokemonProps) => {
    const [selectedPokemon, setSelectedPokemon] = useState<models.PokemonTrainerEditor | null>(null);
    const [clickedPokemon, setClickedPokemon] = useState<models.PokemonJson | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // Clicked pokemon releated stats
    const [move1, setMove1] = useState(pokemon?.moves[0])
    const [move2, setMove2] = useState(pokemon?.moves[1])
    const [move3, setMove3] = useState(pokemon?.moves[2])
    const [move4, setMove4] = useState(pokemon?.moves[3]) 
    const [heldItem, setHeldItem] = useState(pokemon?.heldItem)
    const [hp, setHp] = useState(pokemon?.hp)
    const [attack, setAttack] = useState(pokemon?.attack)
    const [defense, setDefense] = useState(pokemon?.defense)
    const [specialAttack, setSpecialAttack] = useState(pokemon?.specialAttack)
    const [specialDefense, setSpecialDefense] = useState(pokemon?.specialDefense)
    const [speed, setSpeed] = useState(pokemon?.speed)
    const [level, setLevel] = useState(pokemon?.level)
    const [species, setSpecies] = useState(pokemon?.species)
    const [modalIsOpen, setIsOpen] = useState(false);
    const [id, setId] = useState(pokemon?.id)
    
    const openModal = () => {
        setIsOpen(true);
    }

    const closeModal = () => {
        setIsOpen(false);
        setSelectedPokemon(null); // Clear selected Pokemon data when closing modal
    }

    const loadPokemonData = async (pokemonId: string) => {
        setIsLoading(true);
        try {
            const pokemonData = await LoadPokemonById(pokemonId);
            if (pokemonData) {
                setSelectedPokemon(pokemonData);
                setSpecies(pokemonData.Name);
                setId(pokemonData.ID);
                // Update clickedPokemon with the new Pokemon's data
                setClickedPokemon({
                    species: pokemonData.Name,
                    attack: pokemonData.Attack,
                    defense: pokemonData.Defense,
                    speed: pokemonData.Speed,
                    specialAttack: pokemonData.SpecialAttack,
                    specialDefense: pokemonData.SpecialDefense,
                    hp: pokemonData.HP,
                    moves: [move1, move2, move3, move4],
                    icon: pokemonData.Icon,
                    front: pokemonData.FrontSprite,
                    id: pokemonData.ID,
                    level: level,
                    heldItem: heldItem,
                    cry: pokemonData.Cry
                });
            }
        } catch (error) {
            console.error('Error loading Pokemon data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return(
        <div className="flex flex-col items-center">
            <div className="relative group">
                <button 
                    onClick={async (e) => {
                        setClickedPokemon(pokemon);
                        openModal();
                        // Load the Pokemon data when opening the modal
                        await loadPokemonData(pokemon.id);
                    }}
                    className="w-24 h-24 bg-slate-600 rounded-xl p-2 hover:bg-slate-500 transition-colors duration-200 flex items-center justify-center shadow-inner border-2 border-slate-500 relative"
                >
                    <img 
                        src={pokemon? `data:image/gif;base64,${pokemon?.icon}` : ''} 
                        alt="Sprite" 
                        className="w-20 h-20 object-contain"
                    />
                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                        <span className="text-xs text-white bg-slate-700 px-2 py-1 rounded-full border border-slate-500">
                            Lv. {pokemon?.level}
                        </span>
                    </div>
                </button>
            </div>
            
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                style={customStyles}
                contentLabel="Pokemon Modal"
            >
                <div className="text-white">
                    <div className="flex flex-col items-center">
                        <div className="w-full max-w-2xl bg-slate-700 rounded-xl p-6 shadow-lg">
                            <h2 className="text-2xl font-bold text-white mb-6 text-center">Edit Pokemon</h2>

                            {/* Pokemon Preview Section */}
                            <div className="flex flex-col items-center mb-6 bg-slate-800 rounded-xl p-4">
                                {isLoading ? (
                                    <div className="flex flex-col items-center space-y-4 p-8">
                                        <div className="w-8 h-8 border-4 border-tealBlue border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-sm text-gray-400">Loading Pokemon data...</p>
                                    </div>
                                ) : (
                                    <>
                                        <button 
                                            onClick={() => {
                                                if (clickedPokemon) {
                                                    var test = new Audio(`data:audio/wav;base64,${clickedPokemon.cry}`)
                                                    test.play();
                                                }
                                            }}
                                            className="hover:opacity-80 transition-opacity mb-4 bg-slate-700 p-4 rounded-xl"
                                        >
                                            <img 
                                                src={clickedPokemon? `data:image/gif;base64,${clickedPokemon?.front}` : ''} 
                                                alt="Sprite" 
                                                className="w-32 h-32 object-contain"
                                            />
                                        </button>

                                        <select 
                                            name="pokemons" 
                                            value={species || "placeholder"} 
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
                                    </>
                                )}
                            </div>

                            {/* Moves Section */}
                            <div className="bg-slate-800 rounded-xl p-4 mb-6">
                                <h3 className="text-lg font-semibold mb-4 text-center">Moves</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: "Move 1", value: pokemon?.moves[0], setter: setMove1 },
                                        { label: "Move 2", value: pokemon?.moves[1], setter: setMove2 },
                                        { label: "Move 3", value: pokemon?.moves[2], setter: setMove3 },
                                        { label: "Move 4", value: pokemon?.moves[3], setter: setMove4 }
                                    ].map((move, idx) => (
                                        <div key={idx}>
                                            <label className="block text-sm mb-1 text-gray-300">{move.label}</label>
                                            <select 
                                                defaultValue={move.value} 
                                                onChange={(e) => move.setter(e.target.value)}
                                                className="w-full px-2 py-1 rounded-lg bg-slate-800 text-white border border-slate-600 focus:border-slate-500 focus:outline-none [&>*]:bg-slate-800"
                                            >
                                                <option value={"placeholder"} disabled className="text-gray-400">Select a move</option>
                                                {selectedPokemon?.Moves?.map((m) =>
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
                                    {[
                                        { label: "HP", value: clickedPokemon?.hp, setter: setHp },
                                        { label: "Attack", value: clickedPokemon?.attack, setter: setAttack },
                                        { label: "Defense", value: clickedPokemon?.defense, setter: setDefense },
                                        { label: "Sp. Attack", value: clickedPokemon?.specialAttack, setter: setSpecialAttack },
                                        { label: "Sp. Defense", value: clickedPokemon?.specialDefense, setter: setSpecialDefense },
                                        { label: "Speed", value: clickedPokemon?.speed, setter: setSpeed }
                                    ].map((stat, idx) => (
                                        <div key={idx}>
                                            <label className="block text-sm mb-1 text-gray-300">{stat.label}</label>
                                            <input 
                                                type="number" 
                                                defaultValue={stat.value} 
                                                onChange={(e) => stat.setter(Number(e.target.value))}
                                                className="w-full px-2 py-1 rounded-lg bg-white text-slate-800 text-center"
                                            />
                                        </div>
                                    ))}
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
                                            defaultValue={clickedPokemon?.level} 
                                            onChange={(e) => setLevel(Number(e.target.value))}
                                            className="w-full px-2 py-1 rounded-lg bg-white text-slate-800 text-center"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm mb-1 text-gray-300">Held Item</label>
                                        <select 
                                            name="heldItem" 
                                            defaultValue={pokemon?.heldItem ? pokemon?.heldItem : "placeholder"} 
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

                            {/* Save Button */}
                            <div className="flex justify-center space-x-4">
                                <button 
                                    onClick={closeModal}
                                    className="px-6 py-2 bg-slate-600 text-white rounded-xl hover:bg-slate-500 transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={async () => {
                                        let updatedSelectedPokemon: models.PokemonJson = {
                                            species: species, 
                                            attack: attack, 
                                            defense: defense,
                                            speed: speed, 
                                            specialAttack: specialAttack,
                                            specialDefense: specialDefense, 
                                            hp: hp,
                                            moves: [
                                                move1, move2, move3, move4
                                            ],
                                            icon: pokemon?.icon,
                                            front: pokemon?.front,
                                            id: id,
                                            level: level,
                                            heldItem: heldItem,
                                            cry: pokemon.cry
                                        }
                                        
                                        selectedTrainer.pokemons[index] = updatedSelectedPokemon
                                        setSelectedTrainer(selectedTrainer)
                                        
                                        closeModal()
                                    }}
                                    className="px-6 py-2 bg-tealBlue text-white rounded-xl hover:bg-wildBlueYonder transition-colors duration-200"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default UpdatingPokemon;