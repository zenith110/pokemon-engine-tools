import { useState } from "react";
import Modal from 'react-modal';
import { models } from "../../../../wailsjs/go/models";

interface NewPokemonProps {
    selectedTrainer: models.TrainerJson;
    pokemonSpecies: models.PokemonTrainerEditor[];
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
    
    // Pokemon stats
    const [move1, setMove1] = useState("");
    const [move2, setMove2] = useState("");
    const [move3, setMove3] = useState("");
    const [move4, setMove4] = useState("");
    const [heldItem, setHeldItem] = useState("");
    const [hp, setHp] = useState(0);
    const [attack, setAttack] = useState(0);
    const [defense, setDefense] = useState(0);
    const [specialAttack, setSpecialAttack] = useState(0);
    const [specialDefense, setSpecialDefense] = useState(0);
    const [speed, setSpeed] = useState(0);
    const [level, setLevel] = useState(5);
    const [species, setSpecies] = useState("");
    const [id, setId] = useState("");
    const [front, setFront] = useState("");
    const [icon, setIcon] = useState("");
    const [cry, setCry] = useState("");

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
                            <button 
                                onClick={() => {
                                    if (selectedPokemon) {
                                        var test = new Audio(`data:audio/wav;base64,${cry}`)
                                        test.play();
                                    }
                                }}
                                className="hover:opacity-80 transition-opacity mb-4 bg-slate-700 p-4 rounded-xl"
                            >
                                <img 
                                    src={selectedPokemon ? `data:image/gif;base64,${front}` : ''} 
                                    alt="Sprite" 
                                    className="w-32 h-32 object-contain"
                                />
                            </button>

                            <select 
                                name="pokemons" 
                                defaultValue="placeholder"
                                onChange={(e) => {
                                    const pokemonData = pokemonSpecies.find((pokemon) => pokemon.Name === e.target.value)
                                    if (pokemonData) {
                                        setSpecies(pokemonData.Name);
                                        setSelectedPokemon(pokemonData);
                                        setId(pokemonData.ID);
                                        setFront(pokemonData.FrontSprite);
                                        setIcon(pokemonData.Icon);
                                        setHp(pokemonData.HP);
                                        setAttack(pokemonData.Attack);
                                        setDefense(pokemonData.Defense);
                                        setSpecialAttack(pokemonData.SpecialAttack);
                                        setSpecialDefense(pokemonData.SpecialDefense);
                                        setSpeed(pokemonData.Speed);
                                    }
                                }}
                                className="w-full px-3 py-2 rounded-lg bg-slate-800 text-white border border-slate-600 focus:border-slate-500 focus:outline-none [&>*]:bg-slate-800"
                            >
                                <option value="placeholder" disabled className="text-gray-400">Select a pokemon</option>
                                {pokemonSpecies.map((pokemon) =>
                                    <option value={pokemon.Name} key={pokemon.ID} className="hover:bg-slate-700">{pokemon.Name}</option>
                                )}
                            </select>
                        </div>

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
                                            value={move.value} 
                                            onChange={(e) => move.setter(e.target.value)}
                                            className="w-full px-2 py-1 rounded-lg bg-slate-800 text-white border border-slate-600 focus:border-slate-500 focus:outline-none [&>*]:bg-slate-800"
                                        >
                                            <option value="" disabled className="text-gray-400">Select a move</option>
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
                                    { label: "HP", value: hp, setter: setHp },
                                    { label: "Attack", value: attack, setter: setAttack },
                                    { label: "Defense", value: defense, setter: setDefense },
                                    { label: "Sp. Attack", value: specialAttack, setter: setSpecialAttack },
                                    { label: "Sp. Defense", value: specialDefense, setter: setSpecialDefense },
                                    { label: "Speed", value: speed, setter: setSpeed }
                                ].map((stat, idx) => (
                                    <div key={idx}>
                                        <label className="block text-sm mb-1 text-gray-300">{stat.label}</label>
                                        <input 
                                            type="number" 
                                            value={stat.value} 
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
                                        value={level} 
                                        onChange={(e) => setLevel(Number(e.target.value))}
                                        className="w-full px-2 py-1 rounded-lg bg-white text-slate-800 text-center"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1 text-gray-300">Held Item</label>
                                    <select 
                                        name="heldItem" 
                                        value={heldItem || "placeholder"}
                                        onChange={(e) => setHeldItem(e.target.value)}
                                        className="w-full px-2 py-1 rounded-lg bg-slate-800 text-white border border-slate-600 focus:border-slate-500 focus:outline-none [&>*]:bg-slate-800"
                                    >
                                        <option value="placeholder" disabled className="text-gray-400">Select a held item</option>
                                        {heldItems.map((item) =>
                                            <option value={item.Name} key={item.Name} className="hover:bg-slate-700">{item.Name}</option> 
                                        )}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end space-x-4">
                            <button 
                                onClick={onRequestClose}
                                className="px-6 py-2 bg-slate-600 text-white rounded-xl hover:bg-slate-500 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    if (!selectedPokemon) return;

                                    const newPokemon: models.PokemonJson = {
                                        species,
                                        attack,
                                        defense,
                                        speed,
                                        specialAttack,
                                        specialDefense,
                                        hp,
                                        moves: [move1, move2, move3, move4],
                                        icon,
                                        front,
                                        id,
                                        level,
                                        heldItem,
                                        cry
                                    };

                                    const updatedTrainer = { ...selectedTrainer };
                                    updatedTrainer.pokemons = [...updatedTrainer.pokemons, newPokemon];
                                    setSelectedTrainer({
                                        ...updatedTrainer,
                                        convertValues: selectedTrainer.convertValues
                                    });
                                    onRequestClose();
                                }}
                                disabled={!selectedPokemon}
                                className="px-6 py-2 bg-tealBlue text-white rounded-xl hover:bg-wildBlueYonder transition-colors duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed"
                            >
                                Add Pokemon
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default NewPokemon; 