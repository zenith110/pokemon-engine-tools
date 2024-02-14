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
        <div className="flex flex-row h-[44rem] border-2 border-red-800 ml-2 mt-1">

            <div className="h-full flex flex-col border-4 w-96">
                <div className="h-1/2  rounded-2xl grid grid-rows-2 grid-cols-2 items-stretch border-2 border-pink-400 bg-offWhite">
                    <img className="" src={selectedPokemon? `data:image/png;base64,${selectedPokemon?.FrontSprite}` : ''} alt="pokemon sprite" />
                    <img src={selectedPokemon? `data:image/png;base64,${selectedPokemon?.ShinyFront}` : ''} alt="pokemon sprite" />
                    <img src={selectedPokemon? `data:image/png;base64,${selectedPokemon?.BackSprite}` : ''} alt="pokemon sprite" />
                    <img src={selectedPokemon ? `data:image/png;base64,${selectedPokemon?.ShinyBack}` : ''} alt="pokemon sprite" />
                </div>

                <div className="h-fit text-black border-2 border-black flex flex-row justify-around py-6">
                    <Select
                        options={pokemonSpecies.map(pokemon => ({ value: pokemon.ID, label: `${pokemon.ID}: ${pokemon.Name}`}))}
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
                        classNames={{
                            control: () => "rounded-2xl"
                        }}
                    />
                    <button onClick={() => console.log("TO BE ADDED")} className="bg-blueWhale rounded-lg hover:bg-wildBlueYonder w-5/12 text-white">New Pokemon</button>
                </div>

                <div className="flex flex-row border-2 border-green-600 justify-center px-10">
                    <div className="flex flex-row justify-between">
                      <p className="bg-blueWhale px-6 py-3 rounded-l-2xl pl-10">Type:</p>
                        <button onClick={() => {console.log("Add this later")}} className="bg-tealBlue px-6 py-3 rounded-r-2xl">{ selectedPokemon?.Types ? selectedPokemon.Types.join('/') : 'Dragon/Fighting' }</button>  
                    </div>
                    
                </div>

                <div className="h-3/12 pt-12">
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
            
            <div>
                <div className="flex flex-row">
                    <div className="flex flex-col mx-4">
                        <h4 className="bg-blueWhale rounded-t-lg py-1 px-4">Level-Up Moves</h4>
                        <div className="max-h-24 min-h-24 overflow-auto overscroll-none bg-tealBlue">
                           {selectedPokemon?.Moves.length ?? 0 > 0 ? 
                                selectedPokemon?.Moves
                                    .filter(move => move.Method === "level-up")
                                    .sort((a, b) => a.Level - b.Level)
                                    .map((move, index) => (
                                        <p className="bg-tealBlue" key={index}>{move.Name} - Level: {move.Level}</p>
                                    ))
                            
                                : <p>No Moves</p>
                            } 
                        </div>
                        
                        <button onClick={() => {console.log("Add Later")}} className="bg-blueWhale rounded-b-lg py-1"> Edit</button>
                    </div>
                    
                    <div className="flex flex-col mx-4">
                        <h4 className="bg-blueWhale rounded-t-lg py-1 px-8">Tutor Moves</h4>
                        <div className="h-24 overflow-auto w-full overscroll-none bg-tealBlue">
                           {selectedPokemon?.Moves.length ?? 0 > 0 ? 
                                selectedPokemon?.Moves
                                    .filter(move => move.Method === "tutor")
                                    .map((move, index) => (
                                        <p className="" key={index}>{move.Name}</p>
                                    ))
                            
                                : <p>No Moves</p>
                            } 
                        </div>
                        
                        <button onClick={() => {console.log("Add Later")}} className="bg-blueWhale rounded-b-lg py-1"> Edit</button>
                    </div>

                    <div className="flex flex-col mx-4">
                        <h4 className="bg-blueWhale rounded-t-lg py-1 px-6">TM/HM Moves</h4>
                        <div className="h-24 overflow-auto w-full overscroll-none bg-tealBlue">
                           {selectedPokemon?.Moves.length ?? 0 > 0 ? 
                                selectedPokemon?.Moves
                                    .filter(move => move.Method === "machine")
                                    .map((move, index) => (
                                        <p className="" key={index}>{move.Name}</p>
                                    ))
                            
                                : <p>No Moves</p>
                            } 
                        </div>
                        
                        <button onClick={() => {console.log("Add Later")}} className="bg-blueWhale rounded-b-lg py-1"> Edit</button>
                    </div>
                </div>
            </div>

        </div>
);
}