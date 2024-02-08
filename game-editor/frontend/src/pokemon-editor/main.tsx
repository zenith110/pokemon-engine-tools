import { useNavigate } from "react-router-dom";
import { ParsePokemonData } from "../../wailsjs/go/main/App";
import { useEffect, useState } from "react";
import { Pokemon } from "./pokemon.model";

export default function PokemonEditor():React.ReactElement {
    const navigate = useNavigate();
    const [pokemonSpecies, setPokemonSpecies] = useState<Pokemon[]>([]);
    const [selectedPokemon, setSelectedPokemon] = useState<Pokemon>();

    const fetchPokemonSpecies = async() => {
        let data = await ParsePokemonData();
        setPokemonSpecies(data);
    }

    useEffect(() => {
        fetchPokemonSpecies();
        console.log("list of Pokemon: ", pokemonSpecies);
    }, []);

    return (
        <div>
            <div>
                <select
                    onChange={(e) => {
                        let selected = e.target.value;
                        const selectedPokemonObj = pokemonSpecies.find(pokemon => pokemon.Name === selected);
                        setSelectedPokemon(selectedPokemonObj);
                        console.log(selectedPokemon);
                    }}
                >
                    {pokemonSpecies.map((pokemon, index) => (
                        <option key={index} value={pokemon.Name}>
                            {pokemon.Name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
);
}