import React, { useState } from "react";
import { Pokemon } from "./pokemon.model";
import { usePokemonData } from "./hooks/usePokemonData";
import { useEvolutionManagement } from "./hooks/useEvolutionManagement";
import LoadingScreen from "./components/LoadingScreen";
import PokemonSelector from "./components/PokemonSelector";
import PokemonSprites from "./components/PokemonSprites";
import PokemonInfo from "./components/PokemonInfo";
import MovesSection from "./components/MovesSection";
import AbilitiesSection from "./components/AbilitiesSection";
import StatsSection from "./components/StatsSection";
import EvolutionDialog from "./components/EvolutionDialog";
import TypeDialog from "./components/TypeDialog";
import { DeletePokemonEvolution } from "../../wailsjs/go/pokemoneditor/PokemonEditorApp";
import { LoadPokemonById } from "../../wailsjs/go/parsing/ParsingApp";

export default function PokemonEditor(): React.ReactElement {
    const { pokemonSpecies, selectedPokemon, isLoading, updatePokemonSelection } = usePokemonData();
    const [currentAbilityIndex, setCurrentAbilityIndex] = useState<number>(0);
    const [isTypeModalOpen, setIsTypeModalOpen] = useState<boolean>(false);
    
    const evolutionManagement = useEvolutionManagement(selectedPokemon);
    const { 
        currentEvoIndex, 
        setCurrentEvoIndex,
        isEvolutionDialogOpen, 
        setIsEvolutionDialogOpen,
        editingEvolutionIndex,
        setEditingEvolutionIndex
    } = evolutionManagement;

    // Ability navigation handlers
    const handlePrevAbility = () => {
        if (currentAbilityIndex > 0) {
            setCurrentAbilityIndex(currentAbilityIndex - 1);
        }
    };

    const handleNextAbility = () => {
        const abilities = selectedPokemon?.Abilities
            .filter(ability => !ability.IsHidden)
            .map(ability => ability.Name) as string[] || [];
        const hiddenAbility = selectedPokemon?.Abilities
            .find(ability => ability.IsHidden)?.Name;
        const maxIndex = abilities.length + (hiddenAbility ? 1 : 0) - 1;
        
        if (currentAbilityIndex < maxIndex) {
            setCurrentAbilityIndex(currentAbilityIndex + 1);
        }
    };

    // Stat change handler
    const handleStatChange = (stat: string, val: number) => {
        if (selectedPokemon) {
            const updatedPokemon = {
                ...selectedPokemon,
                [stat]: val
            };
            updatePokemonSelection(updatedPokemon);
        }
    };

    // Type change handler
    const handleTypeChange = (types: string[]) => {
        if (selectedPokemon) {
            const updatedPokemon = {
                ...selectedPokemon,
                Types: types
            };
            updatePokemonSelection(updatedPokemon);
        }
    };

    // Evolution update handler
    const handleEvolutionUpdate = (evolutions: Pokemon['Evolutions']) => {
        if (selectedPokemon) {
            const updatedPokemon = {
                ...selectedPokemon,
                Evolutions: evolutions
            };
            updatePokemonSelection(updatedPokemon);
        }
    };

    // Evolution management handlers
    const handleAddEvolution = () => {
        setEditingEvolutionIndex(undefined);
        setIsEvolutionDialogOpen(true);
    };

    const handleEditEvolution = (index: number) => {
        setEditingEvolutionIndex(index);
        setIsEvolutionDialogOpen(true);
    };

    const handleDeleteEvolution = async () => {
        if (selectedPokemon?.Evolutions && selectedPokemon.Evolutions[currentEvoIndex]) {
            const evolution = selectedPokemon.Evolutions[currentEvoIndex];
            console.log("Selected evolution:", selectedPokemon);
            const evolutionName = pokemonSpecies.find(p => p.ID === evolution.ID)?.Name || 'Unknown';
            if (confirm(`Are you sure you want to delete the evolution to ${evolutionName}?`)) {
                try {
                    // Call backend to delete the evolution
                    console.log("Deleting evolution:", evolution);
                    const evolutionData = {
                        PokemonID: evolution.ID,
                        Name: evolution.Name,
                        Method1: evolution.Method1?.[0] || "",
                        Method2: evolution.Method2?.[0] || "", 
                        EvolutionID: evolution.EvolutionID
                    };

                    const request = {
                        pokemonId: selectedPokemon.ID,
                        evolutionData: evolutionData
                    };

                    console.log("Calling backend delete evolution:", request);
                    await DeletePokemonEvolution(request);
                    console.log("Backend delete evolution completed successfully");

                    // Refresh Pokemon data from backend to get the latest evolution data
                    const updatedPokemon = await LoadPokemonById(selectedPokemon.ID);
                    let pokemon: Pokemon;
                    if(updatedPokemon.Evolutions.length != null && updatedPokemon.Evolutions.length > 0) {
                    pokemon = {
                        ...updatedPokemon,
                        DexEntry: "",
                        Evolutions: updatedPokemon.Evolutions.map(evo => ({
                            ...evo,
                            Method1: evo.Method1 ? [evo.Method1] : [],
                            Method2: evo.Method2 ? [evo.Method2] : []
                        }))
                    };
                } else {
                    pokemon = {
                        ...updatedPokemon,
                        DexEntry: "",
                        Evolutions: []
                    };
                }

                    console.log("Refreshed Pokemon data after deletion, evolutions:", pokemon.Evolutions);
                    
                    // Update the selected Pokemon with the refreshed data
                    updatePokemonSelection(pokemon);
                    
                    // Reset to first evolution if we deleted the current one and there are others
                    if (pokemon.Evolutions.length > 0 && currentEvoIndex >= pokemon.Evolutions.length) {
                        setCurrentEvoIndex(0);
                    }
                } catch (error) {
                    console.error('Error deleting evolution:', error);
                    alert(`Failed to delete evolution: ${error}`);
                }
            }
        }
    };

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <div className="flex flex-col grow h-[91.5vh] w-screen bg-slate-800 p-4 gap-2">
            <div className="flex flex-row h-[70vh] gap-4">
                {/* Left Panel - Pokemon Selection and Sprites */}
                <div className="flex flex-col w-5/12 gap-2 bg-slate-700 rounded-xl p-4">
                    <PokemonSprites selectedPokemon={selectedPokemon} />
                    <PokemonSelector 
                        pokemonSpecies={pokemonSpecies}
                        selectedPokemon={selectedPokemon}
                        onPokemonSelect={updatePokemonSelection}
                    />
                    <PokemonInfo 
                        selectedPokemon={selectedPokemon}
                        onTypeChange={handleTypeChange}
                    />
                </div>
                
                {/* Right Panel - Moves, Evolutions, and Abilities */}
                <div className="w-7/12 flex flex-col gap-4">
                    <MovesSection selectedPokemon={selectedPokemon} />
                    
                    <div className="flex flex-row justify-between gap-2 h-[25vh]">
                        {/* Evolution Chain */}
                        {selectedPokemon?.Evolutions && selectedPokemon.Evolutions.length > 0 && selectedPokemon.Evolutions[currentEvoIndex] && (
                            <div className="flex flex-col bg-slate-700 rounded-xl p-2 w-1/2">
                                <div className="flex flex-col items-center h-full">
                                    <div className="flex flex-row items-center justify-between w-full mb-2">
                                        <h3 className="text-lg font-medium">Evolution Chain</h3>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleAddEvolution}
                                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs transition-colors"
                                                title="Add Evolution"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={handleDeleteEvolution}
                                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs transition-colors"
                                                title="Delete Evolution"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex flex-row items-center justify-center gap-4 flex-grow">
                                        <button 
                                            onClick={() => {
                                                if (currentEvoIndex > 0) {
                                                    setCurrentEvoIndex(currentEvoIndex - 1);
                                                }
                                            }}
                                            disabled={currentEvoIndex === 0}
                                            className={`p-2 rounded-xl transition-colors duration-200 ${
                                                currentEvoIndex === 0 
                                                ? 'bg-slate-600 cursor-not-allowed opacity-50' 
                                                : 'bg-slate-600 hover:bg-slate-500'
                                            }`}
                                            title="Previous Evolution"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>

                                        <div className="flex flex-col items-center">
                                            {(() => {
                                                const evolution = pokemonSpecies.find(p => p.ID === selectedPokemon.Evolutions[currentEvoIndex]?.ID);
                                                return (
                                                    <div className="flex flex-col items-center">
                                                        <button 
                                                            onClick={() => handleEditEvolution(currentEvoIndex)}
                                                            className="bg-slate-600 p-2 rounded-xl hover:bg-slate-500 transition-colors"
                                                            title="Click to edit this evolution"
                                                        >
                                                            <img 
                                                                src={`data:image/gif;base64,${selectedPokemon.Evolutions[currentEvoIndex]?.Icon || ''}`} 
                                                                alt={`${selectedPokemon.Evolutions[currentEvoIndex]?.Name || 'Evolution'}`}
                                                                className="w-12 h-12"
                                                            />
                                                        </button>
                                                        <div className="text-center mt-1">
                                                            <div className="font-medium text-white text-sm">{evolution?.Name || 'Unknown'}</div>
                                                            <div className="text-xs text-gray-300">
                                                                {selectedPokemon.Evolutions[currentEvoIndex]?.Method1?.map((method, i) => {
                                                                    if (method === "level-up" && selectedPokemon.Evolutions[currentEvoIndex]?.Method2?.[i]) {
                                                                        return `Level-up at level ${selectedPokemon.Evolutions[currentEvoIndex].Method2[i]}`;
                                                                    }
                                                                    return method;
                                                                }).join(', ')}
                                                                {(!selectedPokemon.Evolutions[currentEvoIndex]?.Method1?.length && selectedPokemon.Evolutions[currentEvoIndex]?.Method2?.length > 0) && (
                                                                    <span>Level-up at level {selectedPokemon.Evolutions[currentEvoIndex].Method2.join(', ')}</span>
                                                                )}
                                                            </div>
                                                            <button 
                                                                onClick={async () => {
                                                                    if (evolution) {
                                                                        const evo = await LoadPokemonById(evolution.ID);
                                                                        const pokemon: Pokemon = {
                                                                            ...evo,
                                                                            DexEntry: "",
                                                                            Evolutions: evo.Evolutions.map(evo => ({
                                                                                ...evo,
                                                                                Method1: evo.Method1 ? [evo.Method1] : [],
                                                                                Method2: evo.Method2 ? [evo.Method2] : []
                                                                            }))
                                                                        };
                                                                        updatePokemonSelection(pokemon);
                                                                    }
                                                                }}
                                                                className="mt-1 bg-slate-600 hover:bg-slate-500 px-3 py-1 rounded-xl text-xs transition-colors"
                                                            >
                                                                Jump to Evolution
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>

                                        <button 
                                            onClick={() => {
                                                if (selectedPokemon?.Evolutions && currentEvoIndex < selectedPokemon.Evolutions.length - 1) {
                                                    setCurrentEvoIndex(currentEvoIndex + 1);
                                                }
                                            }}
                                            disabled={!selectedPokemon?.Evolutions || currentEvoIndex >= selectedPokemon.Evolutions.length - 1}
                                            className={`p-2 rounded-xl transition-colors duration-200 ${
                                                !selectedPokemon?.Evolutions || currentEvoIndex >= selectedPokemon.Evolutions.length - 1
                                                ? 'bg-slate-600 cursor-not-allowed opacity-50' 
                                                : 'bg-slate-600 hover:bg-slate-500'
                                            }`}
                                            title="Next Evolution"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {(!selectedPokemon?.Evolutions || selectedPokemon.Evolutions.length === 0) && (
                            <div className="flex flex-col bg-slate-700 rounded-xl p-2 w-1/2">
                                <div className="flex flex-col items-center justify-center h-full">
                                    <h3 className="text-lg font-medium mb-4">Evolution Chain</h3>
                                    <p className="text-gray-400 text-center mb-4">No evolutions defined</p>
                                    <button 
                                        onClick={handleAddEvolution}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors flex items-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add Evolution
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        <AbilitiesSection
                            selectedPokemon={selectedPokemon}
                            currentAbilityIndex={currentAbilityIndex}
                            onPrevAbility={handlePrevAbility}
                            onNextAbility={handleNextAbility}
                        />
                    </div>
                </div>
            </div>
            
            {/* Bottom Section - Stats and Actions */}
            <div className="flex flex-row justify-between items-center h-[20vh] gap-4">
                <StatsSection 
                    selectedPokemon={selectedPokemon}
                    onStatChange={handleStatChange}
                />
                <div className="flex flex-row gap-4">
                    <button onClick={() => console.log("Add Later")} 
                            className="px-12 py-2 bg-slate-600 rounded-xl hover:bg-slate-500 transition-colors">
                        Save
                    </button>
                    <button onClick={() => console.log("Add Later")} 
                            className="px-12 py-2 bg-slate-600 rounded-xl hover:bg-slate-500 transition-colors">
                        Reset
                    </button> 
                </div>
            </div>
            
            {/* Dialogs */}
            <EvolutionDialog
                isOpen={isEvolutionDialogOpen}
                onClose={() => setIsEvolutionDialogOpen(false)}
                selectedPokemon={selectedPokemon}
                pokemonSpecies={pokemonSpecies}
                onEvolutionUpdate={handleEvolutionUpdate}
                editingEvolutionIndex={editingEvolutionIndex}
            />
            
            <TypeDialog
                isOpen={isTypeModalOpen}
                onClose={() => setIsTypeModalOpen(false)}
                selectedPokemon={selectedPokemon}
                onTypeChange={handleTypeChange}
            />
        </div>
    );
}