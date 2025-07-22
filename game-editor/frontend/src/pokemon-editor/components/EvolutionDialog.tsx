import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import Select from "react-select";
import { Pokemon } from "../pokemon.model";
import { AddPokemonEvolution, UpdatePokemonEvolution } from "../../../wailsjs/go/pokemoneditor/PokemonEditorApp";
interface EvolutionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    selectedPokemon: Pokemon | undefined;
    pokemonSpecies: Pokemon[];
    onEvolutionUpdate: (evolutions: Pokemon['Evolutions']) => void;
    editingEvolutionIndex?: number;
}

const EvolutionDialog = ({ 
    isOpen, 
    onClose, 
    selectedPokemon, 
    pokemonSpecies, 
    onEvolutionUpdate,
    editingEvolutionIndex 
}: EvolutionDialogProps) => {
    const [evolutionMethod, setEvolutionMethod] = useState<string>("level-up");
    const [evolutionLevel, setEvolutionLevel] = useState<string>("");
    const [selectedStone, setSelectedStone] = useState<string>("");
    const [selectedEvolutionPokemon, setSelectedEvolutionPokemon] = useState<Pokemon | null>(null);
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const evolutionMethods = [
        { value: "level-up", label: "Level Up" },
        { value: "stone", label: "Evolution Stone" },
        { value: "trade", label: "Trade" },
        { value: "friendship", label: "Friendship" },
        { value: "item", label: "Hold Item" },
        { value: "move", label: "Know Move" },
        { value: "location", label: "Location" },
        { value: "gender", label: "Gender" },
        { value: "time", label: "Time of Day" },
        { value: "weather", label: "Weather" }
    ];

    const evolutionStones = [
        { value: "water-stone", label: "Water Stone" },
        { value: "thunder-stone", label: "Thunder Stone" },
        { value: "fire-stone", label: "Fire Stone" },
        { value: "ice-stone", label: "Ice Stone" },
        { value: "dusk-stone", label: "Dusk Stone" },
        { value: "dawn-stone", label: "Dawn Stone" },
        { value: "leaf-stone", label: "Leaf Stone" }
    ];

    useEffect(() => {
        if (isOpen && editingEvolutionIndex !== undefined && selectedPokemon?.Evolutions[editingEvolutionIndex]) {
            const evolution = selectedPokemon.Evolutions[editingEvolutionIndex];
            setEvolutionMethod(evolution.Method1?.[0] || "level-up");
            setEvolutionLevel(evolution.Method2?.[0] || "");
            setSelectedStone(evolution.Method2?.[0] || "");
            
            const pokemon = pokemonSpecies.find(p => p.ID === evolution.ID);
            setSelectedEvolutionPokemon(pokemon || null);
        } else {
            // Reset form for new evolution
            setEvolutionMethod("level-up");
            setEvolutionLevel("");
            setSelectedStone("");
            setSelectedEvolutionPokemon(null);
        }
        setError("");
    }, [isOpen, editingEvolutionIndex, selectedPokemon, pokemonSpecies]);

    const callBackendEvolution = async (action: 'add' | 'update' | 'delete') => {
        if (!selectedPokemon || !selectedEvolutionPokemon) return;

        try {
            setIsLoading(true);
            console.log("Selected Pokemon:", selectedPokemon);
            let evolutionData: any;
            if(selectedPokemon.Evolutions != null && selectedPokemon.Evolutions.length > 0) {
                console.log("Selected Pokemon Evolutions:", selectedPokemon.Evolutions[editingEvolutionIndex]);
                if(selectedPokemon.Evolutions[editingEvolutionIndex] != null && selectedPokemon.Evolutions[editingEvolutionIndex].EvolutionID != null) {
                evolutionData = {
                    NewPokemonEvolutionID: selectedEvolutionPokemon.ID,
                    EvolutionID: selectedPokemon.Evolutions[editingEvolutionIndex].EvolutionID,
                    Name: selectedEvolutionPokemon.Name,
                    Method1: evolutionMethod,
                    Method2: evolutionMethod === "level-up" ? evolutionLevel : (evolutionMethod === "stone" ? selectedStone : "")
                };
                } else {
                    evolutionData = {
                        NewPokemonEvolutionID: selectedEvolutionPokemon.ID,
                        Name: selectedEvolutionPokemon.Name,
                        Method1: evolutionMethod,
                        Method2: evolutionMethod === "level-up" ? evolutionLevel : (evolutionMethod === "stone" ? selectedStone : "")
                    };
                }
            } else {
                evolutionData = {
                    NewPokemonEvolutionID: selectedEvolutionPokemon.ID,
                    Name: selectedEvolutionPokemon.Name,
                    Method1: evolutionMethod,
                    Method2: evolutionMethod === "level-up" ? evolutionLevel : (evolutionMethod === "stone" ? selectedStone : "")
                };
            }
            const request = {
                pokemonId: selectedPokemon.ID,
                evolutionData: evolutionData
            };

            console.log(`Calling backend ${action} evolution:`, request);

            switch (action) {
                case 'add':
                    await AddPokemonEvolution(request);
                    break;
                case 'update':
                    await UpdatePokemonEvolution(request);
                    break;
            }

            console.log(`Backend ${action} evolution completed successfully`);

            // Refresh the Pokemon data from the backend to get the latest evolution data
            const { LoadPokemonById } = await import("../../../wailsjs/go/parsing/ParsingApp");
            const updatedPokemon = await LoadPokemonById(selectedPokemon.ID);
            const pokemon: Pokemon = {
                ...updatedPokemon,
                DexEntry: "",
                Evolutions: updatedPokemon.Evolutions.map(evo => ({
                    ...evo,
                    Method1: evo.Method1 ? [evo.Method1] : [],
                    Method2: evo.Method2 ? [evo.Method2] : []
                }))
            };

            console.log(`Refreshed Pokemon data, evolutions:`, pokemon.Evolutions);
            onEvolutionUpdate(pokemon.Evolutions);
            onClose();

        } catch (error) {
            console.error('Error calling backend evolution function:', error);
            setError(`Failed to ${action} evolution: ${error}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedEvolutionPokemon) {
            setError("Please select a Pokemon to evolve into");
            return;
        }

        else if (evolutionMethod === "level-up" && (!evolutionLevel || parseInt(evolutionLevel) < 1)) {
            setError("Please enter a valid level for level-up evolution");
            return;
        }

        else if (evolutionMethod === "stone" && !selectedStone) {
            setError("Please select an evolution stone");
            return;
        }

        else if (selectedPokemon?.ID === selectedEvolutionPokemon.ID) {
            setError("A Pokemon cannot evolve into itself");
            return;
        }

        const action = editingEvolutionIndex !== undefined ? 'update' : 'add';
        await callBackendEvolution(action);
    };

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            className="relative z-50"
        >
            <div className="fixed inset-0 bg-black/40" aria-hidden="true" />

            <div className="fixed inset-0 flex w-screen items-center justify-center">
                <Dialog.Panel className="mx-auto w-1/2 rounded-xl bg-slate-700 p-4">
                    <Dialog.Title className="bg-slate-600 rounded-t-xl p-4">
                        <div className="flex flex-row justify-between items-center">
                            <div className="text-lg font-medium">
                                {editingEvolutionIndex !== undefined ? "Edit Evolution" : "Add Evolution"}
                            </div>
                            <button onClick={onClose} 
                                    className="p-1 hover:bg-slate-500 rounded-lg transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                            </button>
                        </div>
                    </Dialog.Title>

                    <div className="p-4 space-y-4">
                        {/* Evolution Pokemon Selection */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Evolves Into:</label>
                            <Select
                                options={pokemonSpecies
                                    .filter(p => p.ID !== selectedPokemon?.ID) // Exclude current Pokemon
                                    .map(pokemon => ({ 
                                        value: pokemon.ID, 
                                        label: `${pokemon.ID}: ${pokemon.Name}` 
                                    }))}
                                value={selectedEvolutionPokemon ? { 
                                    value: selectedEvolutionPokemon.ID, 
                                    label: `${selectedEvolutionPokemon.ID}: ${selectedEvolutionPokemon.Name}` 
                                } : null}
                                onChange={(option) => {
                                    const pokemon = pokemonSpecies.find(p => p.ID === option?.value);
                                    setSelectedEvolutionPokemon(pokemon || null);
                                }}
                                placeholder="Select Pokemon to evolve into"
                                isDisabled={isLoading}
                                classNames={{
                                    control: () => "rounded-xl bg-slate-800 border-none hover:border-none",
                                    option: (state) => `bg-slate-800 ${state.isFocused ? 'bg-slate-700' : ''} hover:bg-slate-700`,
                                    menu: () => "bg-slate-800 border border-slate-700",
                                    menuList: () => "bg-slate-800",
                                    singleValue: () => "text-slate-900",
                                    input: () => "text-slate-900 !text-slate-900",
                                    placeholder: () => "text-gray-400"
                                }}
                                styles={{
                                    input: (base) => ({
                                        ...base,
                                        color: 'rgb(15, 23, 42)'
                                    }),
                                    singleValue: (base) => ({
                                        ...base,
                                        color: 'rgb(15, 23, 42)'
                                    }),
                                    option: (base, state) => ({
                                        ...base,
                                        color: 'rgb(226, 232, 240)',
                                        backgroundColor: state.isFocused ? '#334155' : '#1e293b',
                                        ':active': {
                                            backgroundColor: '#334155'
                                        }
                                    })
                                }}
                            />
                        </div>

                        {/* Evolution Method */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Evolution Method:</label>
                            <Select
                                options={evolutionMethods}
                                value={evolutionMethods.find(m => m.value === evolutionMethod)}
                                onChange={(option) => setEvolutionMethod(option?.value || "level-up")}
                                isDisabled={isLoading}
                                classNames={{
                                    control: () => "rounded-xl bg-slate-800 border-none hover:border-none",
                                    option: (state) => `bg-slate-800 ${state.isFocused ? 'bg-slate-700' : ''} hover:bg-slate-700`,
                                    menu: () => "bg-slate-800 border border-slate-700",
                                    menuList: () => "bg-slate-800",
                                    singleValue: () => "text-slate-900",
                                    input: () => "text-slate-900 !text-slate-900",
                                    placeholder: () => "text-gray-400"
                                }}
                                styles={{
                                    input: (base) => ({
                                        ...base,
                                        color: 'rgb(15, 23, 42)'
                                    }),
                                    singleValue: (base) => ({
                                        ...base,
                                        color: 'rgb(15, 23, 42)'
                                    }),
                                    option: (base, state) => ({
                                        ...base,
                                        color: 'rgb(226, 232, 240)',
                                        backgroundColor: state.isFocused ? '#334155' : '#1e293b',
                                        ':active': {
                                            backgroundColor: '#334155'
                                        }
                                    })
                                }}
                            />
                        </div>

                        {/* Stone Selection (for stone evolutions) */}
                        {evolutionMethod === "stone" && (
                            <div>
                                <label className="block text-sm font-medium mb-2">Evolution Stone:</label>
                                <Select
                                    options={evolutionStones}
                                    value={evolutionStones.find(s => s.value === selectedStone)}
                                    onChange={(option) => setSelectedStone(option?.value || "")}
                                    placeholder="Select evolution stone"
                                    isDisabled={isLoading}
                                    classNames={{
                                        control: () => "rounded-xl bg-slate-800 border-none hover:border-none",
                                        option: (state) => `bg-slate-800 ${state.isFocused ? 'bg-slate-700' : ''} hover:bg-slate-700`,
                                        menu: () => "bg-slate-800 border border-slate-700",
                                        menuList: () => "bg-slate-800",
                                        singleValue: () => "text-slate-900",
                                        input: () => "text-slate-900 !text-slate-900",
                                        placeholder: () => "text-gray-400"
                                    }}
                                    styles={{
                                        input: (base) => ({
                                            ...base,
                                            color: 'rgb(15, 23, 42)'
                                        }),
                                        singleValue: (base) => ({
                                            ...base,
                                            color: 'rgb(15, 23, 42)'
                                        }),
                                        option: (base, state) => ({
                                            ...base,
                                            color: 'rgb(226, 232, 240)',
                                            backgroundColor: state.isFocused ? '#334155' : '#1e293b',
                                            ':active': {
                                                backgroundColor: '#334155'
                                            }
                                        })
                                    }}
                                />
                            </div>
                        )}

                        {/* Level Input (for level-up evolutions) */}
                        {evolutionMethod === "level-up" && (
                            <div>
                                <label className="block text-sm font-medium mb-2">Level:</label>
                                <input
                                    type="number"
                                    value={evolutionLevel}
                                    onChange={(e) => setEvolutionLevel(e.target.value)}
                                    min="1"
                                    max="100"
                                    disabled={isLoading}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-slate-500 disabled:opacity-50"
                                    placeholder="Enter level"
                                />
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500 rounded-md text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Loading Message */}
                        {isLoading && (
                            <div className="p-3 bg-blue-500/10 border border-blue-500 rounded-md text-blue-400 text-sm">
                                {editingEvolutionIndex !== undefined ? "Updating evolution..." : "Adding evolution..."}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-2 pt-4">
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className="px-4 py-2 bg-slate-600 hover:bg-slate-500 disabled:opacity-50 text-white rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition-colors"
                            >
                                {isLoading ? "Saving..." : (editingEvolutionIndex !== undefined ? "Update" : "Add")}
                            </button>
                        </div>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

export default EvolutionDialog; 