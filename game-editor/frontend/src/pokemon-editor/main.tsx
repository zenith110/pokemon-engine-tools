import { useNavigate } from "react-router-dom";
import { ParsePokemonData } from "../../wailsjs/go/main/App";
import { useEffect, useState } from "react";
import { Pokemon } from "./pokemon.model";
import Select from "react-select";

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
    }, [selectedPokemon]);

    return (
        <div>
            <div className="text-black border-2 w-6/12">
                <Select
                    options={pokemonSpecies.map(pokemon => ({ value: pokemon.ID, label: pokemon.ID + ": " +pokemon.Name }))}
                    onChange={async (e) => {
                        const selected: Pokemon | undefined = pokemonSpecies.find(pokemon => pokemon.ID === (e?.value));
                        await setSelectedPokemon(selected);
                        console.log("selected pokemon: ", selectedPokemon);
                    }}
                    isClearable={false}
                    isDisabled={false}
                    isLoading={false}
                    isRtl={false}
                    isSearchable={true}
                    isMulti={false}
                />
            </div>
            <p>{selectedPokemon?.Name}</p>
            <div className="grid grid-flow-row grid-cols-6 grid-rows-2 max-w-fit border-2 rounded-xl text-center">
                    <h3 className="bg-blueWhale rounded-tl-lg">HP</h3>
                    <h3 className="bg-blueWhale">Attack</h3>
                    <h3 className="bg-blueWhale">Defense</h3>
                    <h3 className="bg-blueWhale">Sp. Atk</h3>
                    <h3 className="bg-blueWhale">Sp. Def</h3>
                    <h3 className="bg-blueWhale rounded-tr-lg">Speed</h3>
                    <p>100</p>
                    <p>100</p>
                    <p>100</p>
                    <p>100</p>
                    <p>100</p>
                    <p>100</p>
            </div>
        </div>
);
}