import { useNavigate } from "react-router-dom";
import { ParsePokemonData } from "../../wailsjs/go/main/App";
import { useEffect, useState } from "react";
import { Pokemon } from "./pokemon.model";

// interface Pokemon {
//     ID: string;
//     Species: string;
//     Types: string[];
//     DexEntry: string;
//     Abilities: {
//         Name: string;
//         isHidden: boolean;
//     }[];
//     Moves: {
//         Name: string;
//         Level: number;
//         Method: string;
//     }[];
//     Evolutions: {
//         Name: string;
//         Methods: string[];
//         ID: string;
//     }[];
//     Stats: {
//         Hp: number;
//         Attack: number;
//         Defense: number;
//         SpecialAttack: number;
//         SpecialDefense: number;
//         Speed: number;
//     };
//     AssetData: {
//         Front: string;
//         Back: string;
//         ShinyFront: string;
//         ShinyBack: string;
//         Icon: string;
//     };
// }

// interface Abilities {
//     Name: string;
//     isHidden: boolean;
// }

// interface Moves {
//     Name: string;
//     Level: number;
//     Method: string;
// }

// interface Evolutions {
//     Name: string;
//     Methods: string[];
//     ID: string;
// }

// interface Stats {
//     Hp: number;
//     Attack: number;
//     Defense: number;
//     SpecialAttack: number;
//     SpecialDefense: number;
//     Speed: number;
// }

// interface AssetData {
//     Front: string;
//     Back: string;
//     ShinyFront: string;
//     ShinyBack: string;
//     Icon: string;
// }

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