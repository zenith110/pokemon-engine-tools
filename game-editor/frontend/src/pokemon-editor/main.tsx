import { useNavigate } from "react-router-dom";
import { ParsePokemonData } from "../../wailsjs/go/main/App";
import { useEffect, useState } from "react";
import { Pokemon } from "./pokemon.model";
import Select from "react-select";
import React from "react";

export default function PokemonEditor():React.ReactElement {
    const navigate = useNavigate();
    const [pokemonSpecies, setPokemonSpecies] = useState<Pokemon[]>([]);
    const [selectedPokemon, setSelectedPokemon] = useState<Pokemon>();
    const fetchPokemonSpecies = async() => {
        let data = await ParsePokemonData();
        setPokemonSpecies(data);
        console.log("list of Pokemon: ", pokemonSpecies);
    }

    useEffect(() => {
        fetchPokemonSpecies();
    }, [selectedPokemon]);

    return (
        <div className="flex flex-row h-dvh border-2 border-red-800">

            <div className="h-screen flex flex-col border-4">
                <div className="h-1/2  rounded-md grid grid-rows-2 grid-cols-2 items-stretch border-2 border-pink-400">
                    <img className="" src={selectedPokemon? `data:image/png;base64,${selectedPokemon?.FrontSprite}` : ''} alt="pokemon sprite" />
                    <img src={selectedPokemon? `data:image/png;base64,${selectedPokemon?.ShinyFront}` : ''} alt="pokemon sprite" />
                    <img src={selectedPokemon? `data:image/png;base64,${selectedPokemon?.BackSprite}` : ''} alt="pokemon sprite" />
                    <img src={selectedPokemon? `data:image/png;base64,${selectedPokemon?.ShinyBack}` : ''} alt="pokemon sprite" />
                </div>

                <div className="h-fit text-black border-2 flex flex-row justify-between pt-12">
                    <Select
                        options={pokemonSpecies.map(pokemon => ({ value: pokemon.ID, label: pokemon.ID + ": " +pokemon.Name }))}
                        onChange={async (e) => {
                            const selected: Pokemon | undefined = pokemonSpecies.find(pokemon => pokemon.ID === (e?.value));
                            setSelectedPokemon(selected);
                            console.log("selected pokemon: ", selectedPokemon);
                            await fetch(`${selectedPokemon?.FrontSprite}`)
                        }}
                        isClearable={false}
                        isDisabled={false}
                        isLoading={false}
                        isRtl={false}
                        isSearchable={true}
                        isMulti={false}
                        className="w-1/2"
                    />
                    <button onClick={() => console.log("TO BE ADDED")} className="bg-blueWhale rounded hover:bg-wildBlueYonder w-5/12 text-white">New Pokemon</button>
                </div>

                <div className="h-3/12 pt-12 ">
                    <div className="grid grid-cols-6 bg-blueWhale rounded-t-xl text-center divide-black divide-x gap-y-4 py-1">
                        <h3>HP</h3>
                        <h3>Attack</h3>
                        <h3>Defense</h3>
                        <h3>Sp. Atk</h3>
                        <h3>Sp. Def</h3>
                        <h3>Speed</h3>
                    </div>
                    <div className="grid grid-cols-6 bg-tealBlue rounded-b-xl py-2">
                        <p>{selectedPokemon ? selectedPokemon?.HP : 0}</p>
                        <p>{selectedPokemon ? selectedPokemon?.Attack : 0}</p>
                        <p>{selectedPokemon ? selectedPokemon?.Defense : 0}</p>
                        <p>{selectedPokemon ? selectedPokemon?.SpecialAttack : 0}</p>
                        <p>{selectedPokemon ? selectedPokemon?.SpecialDefense : 0}</p>
                        <p>{selectedPokemon ? selectedPokemon?.Speed : 0}</p>
                    </div>
                </div>
            </div>


        </div>
);
}