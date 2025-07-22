import { useState, useEffect } from "react";
import { ParsePokemonData, LoadPokemonById } from "../../../wailsjs/go/parsing/ParsingApp";
import { Pokemon } from "../pokemon.model";

export const usePokemonData = () => {
    const [pokemonSpecies, setPokemonSpecies] = useState<Pokemon[]>([]);
    const [selectedPokemon, setSelectedPokemon] = useState<Pokemon>();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const fetchPokemonSpecies = async() => {
        setIsLoading(true);
        try {
            let data = await ParsePokemonData();
            if (data) {
                // Create a minimal Pokemon array for the dropdown
                const minimalPokemons = data.map(pokemon => ({
                    Name: pokemon.Name,
                    ID: pokemon.ID,
                    Types: [],
                    DexEntry: "",
                    FrontSprite: "",
                    BackSprite: "",
                    ShinyFront: "",
                    ShinyBack: "",
                    Icon: "",
                    Cry: "",
                    HP: 0,
                    Attack: 0,
                    Defense: 0,
                    SpecialAttack: 0,
                    SpecialDefense: 0,
                    Speed: 0,
                    Moves: [],
                    Abilities: [],
                    Evolutions: {}
                })) as Pokemon[];
                setPokemonSpecies(minimalPokemons);

                // Load last selected Pokemon from localStorage or first Pokemon
                const lastSelectedId = localStorage.getItem('lastSelectedPokemonId');
                const pokemonId = lastSelectedId || "001"; // Default to first Pokemon if no last selected
                const trainerEditor = await LoadPokemonById(pokemonId);
                if (trainerEditor) {
                    const pokemon: Pokemon = {
                        ...trainerEditor,
                        DexEntry: "",
                        Evolutions: trainerEditor.Evolutions.map(evo => ({
                            ...evo,
                            Method1: evo.Method1 ? [evo.Method1] : [],
                            Method2: evo.Method2 ? [evo.Method2] : []
                        }))
                    };
                    updatePokemonSelection(pokemon);
                }
            }
        } catch (error) {
            console.error('Error fetching Pokemon data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updatePokemonSelection = (pokemon: Pokemon) => {
        setSelectedPokemon(pokemon);
        // Save to localStorage whenever selectedPokemon changes
        if (pokemon.ID) {
            localStorage.setItem('lastSelectedPokemonId', pokemon.ID);
        }
    };

    useEffect(() => {
        fetchPokemonSpecies();
    }, []);

    return {
        pokemonSpecies,
        selectedPokemon,
        isLoading,
        updatePokemonSelection,
        fetchPokemonSpecies
    };
}; 