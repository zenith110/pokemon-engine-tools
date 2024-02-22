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

    const handleStatChange = (stat: string, val: number) => {

        setSelectedPokemon(prevState => ({
            ...(prevState as Pokemon),
            [stat]: val
        }));
    };

    useEffect(() => {
        fetchPokemonSpecies();
    }, [selectedPokemon == undefined]);

    return (

        <div className="flex flex-col grow h-[91.5vh] w-screen border-2 border-red-800">
            <div className="flex flex-row border-4 h-5/6 border-orange-600">
                <div className="flex flex-col border-2 w-5/12 justify-around border-green-500">
                    <div className="rounded-2xl grid grid-rows-2 grid-cols-2 border-2 grow border-yellow-400 bg-offWhite items-stretch text-black">
                        <img src={selectedPokemon? `data:image/png;base64,${selectedPokemon?.FrontSprite}` : ''} alt="Front Sprite" />
                        <img src={selectedPokemon? `data:image/png;base64,${selectedPokemon?.ShinyFront}` : ''} alt="Shiny Front Sprite" />
                        <img src={selectedPokemon? `data:image/png;base64,${selectedPokemon?.BackSprite}` : ''} alt="Back Sprite" />
                        <img src={selectedPokemon ? `data:image/png;base64,${selectedPokemon?.ShinyBack}` : ''} alt="Shiny Back Sprite" />
                    </div>
                    <div className="text-black border-2 border-yellow-500 flex flex-row justify-around py-6">
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
                        <div className="flex flex-row justify-center">
                            <p className="bg-blueWhale px-6 py-3 rounded-l-2xl pl-10 items-center">Type:</p>
                            <button onClick={() => {console.log("Add this later")}} className="bg-tealBlue px-6 py-3 rounded-r-2xl min-w-40">{ selectedPokemon?.Types ? selectedPokemon.Types.join('/') : '???' }</button>  
                        </div> 
                </div>
                
                <div className="border-2 border-yellow-400 w-2/3 flex flex-col">
                    <div className="border-green-500 border-2 flex flex-row justify-around">
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
                            
                            <button onClick={() => {console.log("Add Later")}} className="bg-blueWhale rounded-b-lg py-1 hover:bg-wildBlueYonder"> Edit</button>
                        </div>
                        <div className="flex flex-col mx-4">
                            <h4 className="bg-blueWhale rounded-t-lg py-1 px-8 text-nowrap">Tutor Moves</h4>
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
                            
                            <button onClick={() => {console.log("Add Later")}} className="bg-blueWhale rounded-b-lg py-1 hover:bg-wildBlueYonder"> Edit</button>
                        </div>
                    <div className="flex flex-col mx-4">
                        <h4 className="bg-blueWhale rounded-t-lg py-1 px-6 text-nowrap">TM/HM Moves</h4>
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
                        
                        <button onClick={() => {console.log("Add Later")}} className="bg-blueWhale rounded-b-lg py-1 hover:bg-wildBlueYonder"> Edit</button>
                    </div>
                </div>
                    <div className="border-green-500 border-4 flex flex-row justify-around h-full">
                        <div className="flex flex-col justify-center border-2 border-pink-600 bg-offWhite text-black rounded-xl w-5/12">
                            evolution line here
                        </div>
                        <div className="border-blue-500 border-4 flex flex-col justify-evenly w-5/12">
                            <div>
                                <h4 className="bg-blueWhale rounded-t-lg pt-2">Ability 1</h4>
                                <button onClick={() => console.log("Add Later")} className="bg-tealBlue rounded-b-lg hover:bg-wildBlueYonder w-full py-2">{selectedPokemon ? selectedPokemon?.Abilities[0].Name : "None"}</button>
                            </div>
                            <div>
                                <h4 className="bg-blueWhale rounded-t-lg pt-2">Ability 2 (Optional)</h4>
                                <button onClick={() => console.log("Add Later")} className="bg-tealBlue rounded-b-lg hover:bg-wildBlueYonder w-full py-2">{selectedPokemon && selectedPokemon?.Abilities[1].isHidden == false ? selectedPokemon?.Abilities[1].Name : "None"}</button>
                            </div>
                            <div>
                                <h4 className="bg-blueWhale rounded-t-lg pt-2">Hidden Ability</h4>
                                <button onClick={() => console.log("Add Later")} className="bg-tealBlue rounded-b-lg hover:bg-wildBlueYonder w-full py-2">{selectedPokemon && selectedPokemon?.Abilities.find(ability => ability.isHidden === true)? selectedPokemon?.Abilities.find(ability => ability.isHidden === true)?.Name : "None"}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-row justify-around h-1/4">
                <div className="h-1/6 pt-8 grow-[.4]">
                    <div className="grid grid-cols-6 bg-blueWhale rounded-t-xl text-center divide-black divide-x gap-y-4 py-2">
                        <h3>HP</h3>
                        <h3>Attack</h3>
                        <h3>Defense</h3>
                        <h3>Sp. Atk</h3>
                        <h3>Sp. Def</h3>
                        <h3>Speed</h3>
                    </div>
                    <div className="grid grid-cols-6 bg-tealBlue rounded-b-xl py-4">
                        <input value={selectedPokemon ? selectedPokemon?.HP : 0} type="number" className="flex shrink bg-tealBlue text-center" onChange={(e) => handleStatChange('HP', parseInt(e.target.value))} max={255} min={5}/>
                        <input value={selectedPokemon ? selectedPokemon?.Attack : 0} type="number" className="flex shrink bg-tealBlue text-center" onChange={(e) => handleStatChange('Attack', parseInt(e.target.value))} max={255} min={5}/>
                        <input value={selectedPokemon ? selectedPokemon?.Defense : 0} type="number" className="flex shrink bg-tealBlue text-center" onChange={(e) => handleStatChange('Defense', parseInt(e.target.value))} max={255} min={5}/>
                        <input value={selectedPokemon ? selectedPokemon?.SpecialAttack : 0} type="number" className="flex shrink bg-tealBlue text-center" onChange={(e) => handleStatChange('SpecialAttack', parseInt(e.target.value))} max={255} min={5}/>
                        <input value={selectedPokemon ? selectedPokemon?.SpecialDefense : 0} type="number" className="flex shrink bg-tealBlue text-center" onChange={(e) => handleStatChange('SpecialDefense', parseInt(e.target.value))} max={255} min={5}/>
                        <input value={selectedPokemon ? selectedPokemon?.Speed : 0} type="number" className="flex shrink bg-tealBlue text-center" onChange={(e) => handleStatChange('Speed', parseInt(e.target.value))} max={255} min={5}/>
                    </div>
                </div>
                <div className="flex flex-row items-center">
                    <button onClick={() => console.log("Add Later")} className="px-12 py-1 mr-[6vw] bg-blueWhale rounded-lg  hover:bg-wildBlueYonder">Save</button>
                    <button onClick={() => console.log("Add Later")} className="px-12 py-1 bg-blueWhale rounded-lg  hover:bg-wildBlueYonder">Reset</button> 
                </div>
            </div>
        </div>
);
}