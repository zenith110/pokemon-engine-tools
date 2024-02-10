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
        <div className="grid">
            <div className="text-black border-2 w-1/4">
                <Select
                    options={pokemonSpecies.map(pokemon => ({ value: pokemon.ID, label: pokemon.ID + ": " +pokemon.Name }))}
                    onChange={async (e) => {
                        const selected: Pokemon | undefined = pokemonSpecies.find(pokemon => pokemon.ID === (e?.value));
                        await setSelectedPokemon(selected);
                        console.log("selected pokemon: ", selectedPokemon);
                        await fetch(`${selectedPokemon?.FrontSprite}`)        
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
            <div className="w-1/2 h-1/6">
                <div className="grid grid-cols-6 bg-blueWhale rounded-t-xl text-center divide-black divide-x gap-y-4">
                    <h3>HP</h3>
                    <h3>Attack</h3>
                    <h3>Defense</h3>
                    <h3>Sp. Atk</h3>
                    <h3>Sp. Def</h3>
                    <h3>Speed</h3>
                </div>
                <div className="grid grid-cols-6 bg-tealBlue rounded-b-xl">
                    <p>{selectedPokemon ? selectedPokemon?.HP : 0}</p>
                    <p>{selectedPokemon ? selectedPokemon?.Attack : 0}</p>
                    <p>{selectedPokemon ? selectedPokemon?.Defense : 0}</p>
                    <p>{selectedPokemon ? selectedPokemon?.SpecialAttack : 0}</p>
                    <p>{selectedPokemon ? selectedPokemon?.SpecialDefense : 0}</p>
                    <p>{selectedPokemon ? selectedPokemon?.Speed : 0}</p>
                </div>
                 <img src={selectedPokemon? `data:image/png;base64,${selectedPokemon?.FrontSprite}` : ''} alt="pokemon sprite" />
                 <img src={selectedPokemon? `data:image/png;base64,${selectedPokemon?.BackSprite}` : ''} alt="pokemon sprite" />
                 <img src={selectedPokemon? `data:image/png;base64,${selectedPokemon?.ShinyFront}` : ''} alt="pokemon sprite" />
                 <img src={selectedPokemon? `data:image/png;base64,${selectedPokemon?.ShinyBack}` : ''} alt="pokemon sprite" />
                 <img src={selectedPokemon? `data:image/png;base64,${selectedPokemon?.Icon}` : ''} alt="pokemon sprite" />
            </div>
        </div>
);
}