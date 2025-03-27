import { useNavigate } from "react-router-dom";
import { ParsePokemonData } from "../../wailsjs/go/parsing/ParsingApp";
import { useEffect, useState } from "react";
import { Pokemon } from "./pokemon.model";
import Select from "react-select";
import React from "react";
import { Dialog } from "@headlessui/react";

export default function PokemonEditor():React.ReactElement {
    const [pokemonSpecies, setPokemonSpecies] = useState<Pokemon[]>([]);
    const [selectedPokemon, setSelectedPokemon] = useState<Pokemon>();
    const [abilities, setAbilities] = useState<string[]>([]);
    const [hiddenAbility, setHiddenAbility] = useState<string>();
    const [isTypeModalOpen, setIsTypeModalOpen] = useState<boolean>(false);
    const [selectValue, setSelectValue] = useState<{ value: string; label: string } | null>(null);
    const [currentEvoIndex, setCurrentEvoIndex] = useState<number>(0);
    const [currentAbilityIndex, setCurrentAbilityIndex] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const pokemonTypes: string[] = ["Bug", "Dark", "Dragon", "Electric", "Fairy", "Fighting", "Fire", "Flying", "Ghost", "Grass", "Ground", "Ice", "Normal", "Poison", "Psychic", "Rock", "Steel", "Water"];
    const regex: RegExp = /^[0-9\b]{0,3}$/;
    

    const getCurrentAbility = () => {
        if (!selectedPokemon) return { title: "Select a Pokemon", ability: "None", subtitle: "" };
        
        if (currentAbilityIndex === 0) {
            return {
                title: "Ability 1",
                ability: abilities[0] || "None",
                subtitle: abilities.length > 1 ? "Has second ability" : hiddenAbility ? "Has hidden ability" : "No other abilities"
            };
        } else if (currentAbilityIndex === 1 && abilities.length > 1) {
            return {
                title: "Ability 2",
                ability: abilities[1],
                subtitle: hiddenAbility ? "Has hidden ability" : "No other abilities"
            };
        } else if ((currentAbilityIndex === 1 && !abilities[1]) || currentAbilityIndex === 2) {
            return {
                title: "Hidden Ability",
                ability: hiddenAbility || "None",
                subtitle: "No other abilities"
            };
        }
        return { title: "No Abilities", ability: "None", subtitle: "" };
    };

    const handlePrevAbility = () => {
        if (currentAbilityIndex > 0) {
            setCurrentAbilityIndex(currentAbilityIndex - 1);
        }
    };

    const handleNextAbility = () => {
        const maxIndex = abilities.length + (hiddenAbility ? 1 : 0) - 1;
        if (currentAbilityIndex < maxIndex) {
            setCurrentAbilityIndex(currentAbilityIndex + 1);
        }
    };

    const updatePokemonSelection = (pokemon: Pokemon) => {
        setSelectedPokemon(pokemon);
        setSelectValue({ value: pokemon.ID, label: `${pokemon.ID}: ${pokemon.Name}` });
        setAbilities(
            pokemon.Abilities
                .filter(ability => !ability.IsHidden)
                .map(ability => ability.Name) as string[]
        );
        setHiddenAbility(
            pokemon.Abilities
                .find(ability => ability.IsHidden)
                ?.Name
        );
        setCurrentEvoIndex(0);
        setCurrentAbilityIndex(0);
    };

    const fetchPokemonSpecies = async() => {
        setIsLoading(true);
        try {
            let data = await ParsePokemonData();
            if (data) {
                const mappedData = data.map(pokemon => ({
                    ...pokemon,
                    DexEntry: "",
                    ID: String(pokemon.ID),
                    Evolutions: pokemon.Evolutions ? pokemon.Evolutions.map(evo => ({
                        ...evo,
                        Method1: evo.Method1 ? [evo.Method1] : [],
                        Method2: evo.Method2 ? [evo.Method2] : []
                    })) : []
                }));
                setPokemonSpecies(mappedData);

                // Load last selected Pokemon from localStorage
                const lastSelectedId = localStorage.getItem('lastSelectedPokemonId');
                if (lastSelectedId) {
                    const lastSelected = mappedData.find(pokemon => pokemon.ID === lastSelectedId);
                    if (lastSelected) {
                        updatePokemonSelection(lastSelected);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching Pokemon data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatChange = (stat: string, val: number) => {
        setSelectedPokemon(prevState => {
            const newState = {
            ...(prevState as Pokemon),
            [stat]: val
            };
            // Save to localStorage whenever stats change
            if (newState.ID) {
                localStorage.setItem('lastSelectedPokemonId', newState.ID);
            }
            return newState;
        });
    };

    useEffect(() => {
        fetchPokemonSpecies();
    }, [selectedPokemon == undefined]);

    // Save to localStorage whenever selectedPokemon changes
    useEffect(() => {
        if (selectedPokemon?.ID) {
            localStorage.setItem('lastSelectedPokemonId', selectedPokemon.ID);
        }
    }, [selectedPokemon]);

    if (isLoading) {
        return (
            <div className="flex flex-col grow h-[91.5vh] w-screen bg-slate-800 p-4 gap-4 relative">
                <div className="absolute inset-0 bg-slate-800/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 border-4 border-tealBlue border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-white text-lg font-medium">Loading Pokemon Data...</p>
                        <p className="text-gray-400 text-sm">Please wait while we fetch the latest data from your pokemon.toml</p>
                    </div>
                </div>
                {/* Keep the layout structure to prevent layout shift */}
                <div className="flex flex-row h-5/6 gap-4">
                    <div className="flex flex-col w-5/12 gap-4 bg-slate-700 rounded-xl p-4">
                        <div className="rounded-xl grid grid-rows-2 grid-cols-2 grow bg-slate-600 items-stretch">
                            <div className="p-2"></div>
                            <div className="p-2"></div>
                            <div className="p-2"></div>
                            <div className="p-2"></div>
                        </div>
                        <div className="flex flex-row justify-around gap-4 py-2">
                            <div className="grow h-10 bg-slate-600 rounded-xl"></div>
                            <div className="w-32 h-10 bg-slate-600 rounded-xl"></div>
                        </div>
                    </div>
                    <div className="flex flex-col w-7/12 gap-4">
                        <div className="bg-slate-700 rounded-xl p-6 h-full"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col grow h-[91.5vh] w-screen bg-slate-800 p-4 gap-4">
            <div className="flex flex-row h-5/6 gap-4">
                <div className="flex flex-col w-5/12 gap-4 bg-slate-700 rounded-xl p-4">
                    <div className="rounded-xl grid grid-rows-2 grid-cols-2 grow bg-slate-600 items-stretch">
                        <img src={selectedPokemon? `data:image/png;base64,${selectedPokemon?.FrontSprite}` : ''} alt="Front Sprite" className="p-2" />
                        <img src={selectedPokemon? `data:image/png;base64,${selectedPokemon?.ShinyFront}` : ''} alt="Shiny Front Sprite" className="p-2" />
                        <img src={selectedPokemon? `data:image/png;base64,${selectedPokemon?.BackSprite}` : ''} alt="Back Sprite" className="p-2" />
                        <img src={selectedPokemon ? `data:image/png;base64,${selectedPokemon?.ShinyBack}` : ''} alt="Shiny Back Sprite" className="p-2" />
                    </div>
                    <div className="flex flex-row justify-around gap-4 py-2">
                        <Select
                            options={pokemonSpecies.map(pokemon => ({ value: pokemon.ID, label: `${pokemon.ID}: ${pokemon.Name}`}))}
                            value={selectValue}
                            onChange={(e) => {
                                const selected: Pokemon | undefined = pokemonSpecies.find(pokemon => pokemon.ID === (e?.value));
                                if (selected) {
                                    updatePokemonSelection(selected);
                                }
                            }}
                            isClearable={false}
                            isDisabled={false}
                            isLoading={false}
                            isRtl={false}
                            isSearchable={true}
                            isMulti={false}
                            className="grow"
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
                        <button onClick={() => console.log("TO BE ADDED")} 
                                className="bg-slate-600 rounded-xl px-4 hover:bg-slate-500 transition-colors">
                            New Pokemon
                        </button>
                    </div>
                    <div className="flex flex-row justify-center">
                        <div className="flex flex-row w-full gap-2">
                            <p className="bg-slate-600 px-6 py-3 rounded-l-xl items-center">Type:</p>
                            <button onClick={() => { setIsTypeModalOpen(true) }} 
                                    className="bg-slate-600 px-6 py-3 rounded-r-xl grow hover:bg-slate-500 transition-colors">
                                {selectedPokemon?.Types ? selectedPokemon.Types.join('/') : '???'}
                            </button>  
                        </div>
                    </div>
                    <Dialog
                        open={isTypeModalOpen}
                        onClose={() => setIsTypeModalOpen(false)}
                        className="relative z-50"
                    >
                        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />

                        <div className="fixed inset-0 flex w-screen items-center justify-center">
                            
                            <Dialog.Panel className="mx-auto w-1/2 rounded-xl bg-slate-700 p-4">
                                <Dialog.Title className="bg-slate-600 rounded-t-xl p-4">
                                    <div className="flex flex-row justify-between items-center">
                                        <div className="text-lg font-medium">Edit Type</div>
                                        <button onClick={() => setIsTypeModalOpen(false)} 
                                                className="p-1 hover:bg-slate-500 rounded-lg transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                            </svg>
                                        </button>
                                    </div>
                                </Dialog.Title>

                                <div className="flex flex-row justify-around gap-4 p-4">
                                    <div className="flex flex-row items-center gap-2">
                                        <h3>Type 1:</h3>
                                        <Select
                                            isClearable={false}
                                            isDisabled={false}
                                            isLoading={false}
                                            isRtl={false}
                                            isSearchable={false}
                                            isMulti={false}
                                            options={pokemonTypes.map(type => ({ value: type, label: type }))}
                                            defaultValue={{ value: selectedPokemon?.Types[0], label: selectedPokemon?.Types[0] }}
                                            classNames={{
                                                control: () => "rounded-xl bg-slate-800 border-none hover:border-none min-w-[150px]",
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
                                            onChange={(e) => { 
                                                setSelectedPokemon(prevState => ({
                                                    ...(prevState as Pokemon),
                                                    Types: [e?.value as string, prevState?.Types[1] as string]
                                                }));
                                            }}
                                        />
                                    </div>
                                    <div className="flex flex-row items-center gap-2">
                                        <h3>Type 2 (Optional):</h3>
                                        <Select
                                            isClearable={false}
                                            isDisabled={false}
                                            isLoading={false}
                                            isRtl={false}
                                            isSearchable={false}
                                            isMulti={false} 
                                            options={[ { value: "None", label: "None" }, ...pokemonTypes.map(type => ({ value: type, label: type}))]}
                                            defaultValue={{ value: selectedPokemon?.Types[1] ? selectedPokemon?.Types[1] : "None", label: selectedPokemon?.Types[1] ? selectedPokemon?.Types[1] : "None" }}
                                            classNames={{
                                                control: () => "rounded-xl bg-slate-800 border-none hover:border-none min-w-[150px]",
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
                                            onChange={(e) => { 
                                                if (e?.value === "None") {
                                                    setSelectedPokemon(prevState => ({
                                                        ...(prevState as Pokemon),
                                                        Types: [prevState?.Types[0] as string]
                                                    }));
                                                } else {
                                                    setSelectedPokemon(prevState => ({
                                                        ...(prevState as Pokemon),
                                                        Types: [prevState?.Types[0] as string, e?.value as string]
                                                    }));
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-row items-center justify-center py-4">
                                    <button onClick={() => setIsTypeModalOpen(false)} 
                                            className="px-12 py-2 bg-slate-600 rounded-xl hover:bg-slate-500 transition-colors">
                                        Save
                                    </button>
                                </div>
                            </Dialog.Panel>
                            </div>
                    </Dialog>
                </div>
                
                <div className="border-yellow-400 mt-2 w-2/3 flex flex-col gap-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col">
                            <h4 className="bg-slate-600 rounded-t-xl py-2 px-4 text-center font-medium">Level-Up Moves</h4>
                            <div className="max-h-24 min-h-24 overflow-auto overscroll-none bg-slate-700 p-2">
                                {selectedPokemon?.Moves.length ?? 0 > 0 ? 
                                    selectedPokemon?.Moves
                                        .filter(move => move.Method === "level-up")
                                        .sort((a, b) => a.Level - b.Level)
                                        .map((move, index) => (
                                            <p className="hover:bg-slate-600 rounded px-2 py-1 transition-colors" key={index}>
                                                {move.Name} - level: {move.Level}
                                            </p>
                                        ))
                                    : <p className="text-gray-400 text-center py-2">No Moves</p>
                                } 
                            </div>
                            <button onClick={() => {console.log("Add Later")}} 
                                    className="bg-slate-600 rounded-b-xl py-2 hover:bg-slate-500 transition-colors">
                                Edit
                            </button>
                        </div>
                        <div className="flex flex-col">
                            <h4 className="bg-slate-600 rounded-t-xl py-2 px-4 text-center font-medium">Tutor/Egg Moves</h4>
                            <div className="max-h-24 min-h-24 overflow-auto overscroll-none bg-slate-700 p-2">
                                {selectedPokemon?.Moves.length ?? 0 > 0 ? 
                                    selectedPokemon?.Moves
                                        .filter(move => move.Method === "tutor" || move.Method === "egg")
                                        .map((move, index) => (
                                            <p className="hover:bg-slate-600 rounded px-2 py-1 transition-colors" key={index}>
                                                {move.Name}
                                            </p>
                                        ))
                                    : <p className="text-gray-400 text-center py-2">No Moves</p>
                                } 
                            </div>
                            <button onClick={() => {console.log("Add Later")}} 
                                    className="bg-slate-600 rounded-b-xl py-2 hover:bg-slate-500 transition-colors">
                                Edit
                            </button>
                        </div>
                        <div className="flex flex-col">
                            <h4 className="bg-slate-600 rounded-t-xl py-2 px-4 text-center font-medium">TM/HM Moves</h4>
                            <div className="max-h-24 min-h-24 overflow-auto overscroll-none bg-slate-700 p-2">
                                {selectedPokemon?.Moves.length ?? 0 > 0 ? 
                                    selectedPokemon?.Moves
                                        .filter(move => move.Method === "machine")
                                        .map((move, index) => (
                                            <p className="hover:bg-slate-600 rounded px-2 py-1 transition-colors" key={index}>
                                                {move.Name}
                                            </p>
                                        ))
                                    : <p className="text-gray-400 text-center py-2">No Moves</p>
                                } 
                            </div>
                            <button onClick={() => {console.log("Add Later")}} 
                                    className="bg-slate-600 rounded-b-xl py-2 hover:bg-slate-500 transition-colors">
                                Edit
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-row justify-between gap-4">
                        <div className="flex flex-col bg-slate-700 rounded-xl p-4 w-5/12">
                            <div className="flex flex-col items-center">
                                <h3 className="text-lg font-medium mb-4">Evolution Chain</h3>
                                <div className="flex flex-row items-center justify-center gap-4">
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
                                        {selectedPokemon?.Evolutions && selectedPokemon.Evolutions.length > 0 ? (
                                            (() => {
                                                const evolution = pokemonSpecies.find(p => p.ID === selectedPokemon.Evolutions[currentEvoIndex]?.ID);
                                                return (
                                                    <div className="flex flex-col items-center">
                                                        <button 
                                                            onClick={() => {
                                                                if (evolution) {
                                                                    updatePokemonSelection(evolution);
                                                                }
                                                            }}
                                                            className="bg-slate-600 p-2 rounded-xl hover:bg-slate-500 transition-colors"
                                                        >
                                                            <img 
                                                                src={`data:image/gif;base64,${evolution?.Icon || ''}`} 
                                                                alt={`${evolution?.Name || 'Evolution'}`}
                                                                className="w-16 h-16"
                                                            />
                                                        </button>
                                                        <div className="text-center mt-2">
                                                            <div className="font-medium text-white">{evolution?.Name || 'Unknown'}</div>
                                                            <div className="text-sm text-gray-300">
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
                                                                onClick={() => {
                                                                    if (evolution) {
                                                                        updatePokemonSelection(evolution);
                                                                    }
                                                                }}
                                                                className="mt-2 bg-slate-600 hover:bg-slate-500 px-4 py-2 rounded-xl text-sm transition-colors"
                                                            >
                                                                Jump to Evolution
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })()
                                        ) : (
                                            <p className="text-gray-400">No evolutions</p>
                                        )}
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
                        <div className="flex flex-col bg-slate-700 rounded-xl p-4 w-5/12">
                            <div className="flex flex-col items-center">
                                <h3 className="text-lg font-medium mb-4">Abilities</h3>
                                <div className="flex flex-row items-center justify-center gap-4 w-full">
                                    <button 
                                        onClick={handlePrevAbility}
                                        disabled={!selectedPokemon || currentAbilityIndex === 0}
                                        className={`p-2 rounded-xl transition-colors duration-200 ${
                                            !selectedPokemon || currentAbilityIndex === 0
                                            ? 'bg-slate-600 cursor-not-allowed opacity-50' 
                                            : 'bg-slate-600 hover:bg-slate-500'
                                        }`}
                                        title="Previous Ability"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>

                                    <div className="flex flex-col items-center flex-grow">
                                        <div className="bg-slate-600 w-full rounded-t-xl py-2 px-4 text-center font-medium">
                                            {getCurrentAbility().title}
                                        </div>
                                        <div className="bg-slate-900 w-full py-3 px-4 text-center">
                                            {getCurrentAbility().ability}
                                        </div>
                                        <div className="bg-slate-600 w-full rounded-b-xl py-1 px-4 text-center text-sm text-gray-300">
                                            {getCurrentAbility().subtitle}
                                        </div>
                                    </div>

                                    <button 
                                        onClick={handleNextAbility}
                                        disabled={!selectedPokemon || currentAbilityIndex >= (abilities.length + (hiddenAbility ? 1 : 0) - 1)}
                                        className={`p-2 rounded-xl transition-colors duration-200 ${
                                            !selectedPokemon || currentAbilityIndex >= (abilities.length + (hiddenAbility ? 1 : 0) - 1)
                                            ? 'bg-slate-600 cursor-not-allowed opacity-50' 
                                            : 'bg-slate-600 hover:bg-slate-500'
                                        }`}
                                        title="Next Ability"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-row justify-between items-center h-1/4 gap-4">
                <div className="grow bg-slate-700 rounded-xl">
                    <div className="grid grid-cols-6 bg-slate-600 rounded-t-xl text-center py-2 font-medium">
                        <h3>HP</h3>
                        <h3>Attack</h3>
                        <h3>Defense</h3>
                        <h3>Sp. Atk</h3>
                        <h3>Sp. Def</h3>
                        <h3>Speed</h3>
                    </div>
                    <div className="grid grid-cols-6 rounded-b-xl py-4">
                        <input value={selectedPokemon ? selectedPokemon?.HP : 0} 
                               type="number" 
                               className="bg-slate-700 text-center focus:outline-none" 
                               onChange={(e) => {
                                    if (e.target.value === '' || regex.test(e.target.value)) {
                                        if (parseInt(e.target.value) <= 255 && parseInt(e.target.value) >= 5) {
                                            handleStatChange('HP', parseInt(e.target.value));
                                        } else if(parseInt(e.target.value) > 255) {
                                            handleStatChange('HP', 255);
                                        } else if(parseInt(e.target.value) < 5) {
                                            handleStatChange('HP', 5);
                                        }
                                    }
                               }} 
                               max={255} 
                               min={5}
                        />
                        <input value={selectedPokemon ? selectedPokemon?.Attack : 0} 
                               type="number" 
                               className="bg-slate-700 text-center focus:outline-none" 
                               onChange={(e) => {
                                    if (e.target.value === '' || regex.test(e.target.value)) {
                                        if (parseInt(e.target.value) <= 255 && parseInt(e.target.value) >= 5) {
                                            handleStatChange('Attack', parseInt(e.target.value));
                                        } else if(parseInt(e.target.value) > 255) {
                                            handleStatChange('Attack', 255);
                                        } else if(parseInt(e.target.value) < 5) {
                                            handleStatChange('Attack', 5);
                                        }
                                    }
                               }} 
                               max={255} 
                               min={5}
                        />
                        <input value={selectedPokemon ? selectedPokemon?.Defense : 0} 
                               type="number" 
                               className="bg-slate-700 text-center focus:outline-none" 
                               onChange={(e) => {
                                    if (e.target.value === '' || regex.test(e.target.value)) {
                                        if (parseInt(e.target.value) <= 255 && parseInt(e.target.value) >= 5) {
                                            handleStatChange('Defense', parseInt(e.target.value));
                                        } else if(parseInt(e.target.value) > 255) {
                                            handleStatChange('Defense', 255);
                                        } else if(parseInt(e.target.value) < 5) {
                                            handleStatChange('Defense', 5);
                                        }
                                    }
                               }} 
                               max={255} 
                               min={5}
                        />
                        <input value={selectedPokemon ? selectedPokemon?.SpecialAttack : 0} 
                               type="number" 
                               className="bg-slate-700 text-center focus:outline-none" 
                               onChange={(e) => {
                                    if (e.target.value === '' || regex.test(e.target.value)) {
                                        if (parseInt(e.target.value) <= 255 && parseInt(e.target.value) >= 5) {
                                            handleStatChange('SpecialAttack', parseInt(e.target.value));
                                        } else if(parseInt(e.target.value) > 255) {
                                            handleStatChange('SpecialAttack', 255);
                                        } else if(parseInt(e.target.value) < 5) {
                                            handleStatChange('SpecialAttack', 5);
                                        }
                                    }
                               }} 
                               max={255} 
                               min={5}
                        />
                        <input value={selectedPokemon ? selectedPokemon?.SpecialDefense : 0} 
                               type="number" 
                               className="bg-slate-700 text-center focus:outline-none" 
                               onChange={(e) => {
                                    if (e.target.value === '' || regex.test(e.target.value)) {
                                        if (parseInt(e.target.value) <= 255 && parseInt(e.target.value) >= 5) {
                                            handleStatChange('SpecialDefense', parseInt(e.target.value));
                                        } else if(parseInt(e.target.value) > 255) {
                                            handleStatChange('SpecialDefense', 255);
                                        } else if(parseInt(e.target.value) < 5) {
                                            handleStatChange('SpecialDefense', 5);
                                        }
                                    }
                               }} 
                               max={255} 
                               min={5}
                        />
                        <input value={selectedPokemon ? selectedPokemon?.Speed : 0} 
                               type="number" 
                               className="bg-slate-700 text-center focus:outline-none" 
                               onChange={(e) => {
                                    if (e.target.value === '' || regex.test(e.target.value)) {
                                        if (parseInt(e.target.value) <= 255 && parseInt(e.target.value) >= 5) {
                                            handleStatChange('Speed', parseInt(e.target.value));
                                        } else if(parseInt(e.target.value) > 255) {
                                            handleStatChange('Speed', 255);
                                        } else if(parseInt(e.target.value) < 5) {
                                            handleStatChange('Speed', 5);
                                        }
                                    }
                               }} 
                               max={255} 
                               min={5}
                        />
                    </div>
                </div>
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
        </div>
    );
}