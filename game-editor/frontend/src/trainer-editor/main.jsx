import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";
import ReactDOM from 'react-dom';
import Modal from 'react-modal';

import { ParseTrainers, ParseTrainerClass, UpdateTrainer, ParsePokemonData} from "../../wailsjs/go/main/App";

const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
    },
  };

//\import { Trainer } from "./trainer.models";

const TrainerEditor = () => {
    const [trainers, setTrainers] = useState([]);
    const [selectedTrainer, setSelectedTrainer] = useState();
    const [classTypes, setClassTypes] = useState([])
    const [editedTrainer, setEditedTrainer] = useState()
    const [trainerName, setTrainerName] = useState("")
    const [trainerClass, setTrainerClass] = useState("")
    const [pokemons, setPokemons] = useState([])
    const [pokemonSpecies, setPokemonSpecies] = useState([])
    const [selectedPokemon, setSelectedPokemon] = useState({});
    const [clickedPokemon, setClickedPokemon] = useState({});
    // Clicked pokemon releated stats
    const [move1, setMove1] = useState("")
    const [move2, setMove2] = useState("")
    const [move3, setMove3] = useState("")
    const [move4, setMove4] = useState("") 
    const [heldItem, setHeldItem] = useState("")
    const [hp, setHp] = useState(0)
    const [attack, setAttack] = useState(0)
    const [defense, setDefense] = useState(0)
    const [specialAtk, setSpecialAtk] = useState(0)
    const [specialDef, setSpecialDef] = useState(0)
    const [speed, setSpeed] = useState(0)
    const [level, setLevel] = useState(0)

    const navigate = useNavigate();
    let subtitle;
    const [modalIsOpen, setIsOpen] = useState(false);
    const openModal = () => {
        setIsOpen(true);
    }

    const closeModal = () => {
        setIsOpen(false);
    }
    
    useEffect(() => { 
        const fetchTrainers = async() => {
            let data = await ParseTrainers()
            setTrainers(data)
        }
        const fetchClassTypes = async() => {
            let data = await ParseTrainerClass()
            setClassTypes(data.Data)
        }
        const fetchPokemonSpecies = async() => {
            let data = await ParsePokemonData()
            setPokemonSpecies(data)
        }
        fetchPokemonSpecies();
        fetchTrainers()
        fetchClassTypes()
    }, []) 
    return(
        <>
           <div className="text-black flex items-center justify-center">
           <select name="trainers" onChange={(e) => {
                const trainerData = trainers.find((trainer) => trainer.id === e.target.value);
                console.log(selectedTrainer)
                setSelectedTrainer(trainerData);
           }} defaultValue={"placeholder"}>
            <option value={"placeholder"} disabled>Select a trainer</option>
            {trainers?.map((trainer) =>
                <option value={trainer.id} key={trainer.id}>{trainer.name}</option>
            )}
            </select>
            </div>
            <div className="text-black flex items-center justify-center">
                <img src={selectedTrainer? `data:image/png;base64,${selectedTrainer?.sprite}` : ''} alt="Trainer Sprite" />
            </div>
            <br/>
            <div className="text-white flex items-center justify-center">
                <label>Trainer name: </label>
            </div>
            <div className="text-black flex items-center justify-center">
                <input defaultValue={selectedTrainer?.name? selectedTrainer.name : ''} onChange={(e) => setTrainerName(e.target.value)}/>
            </div>
            <br/>
            <label>Trainer class</label>
            <div className="text-black flex items-center justify-center">
                <select name="trainerClasses" defaultValue={selectedTrainer?.classType? selectedTrainer.classType : ''} onChange={(e) => setClassTypes(e.target.value)}>
                <option value={"placeholder"} disabled>Select a trainer class</option>
                {classTypes.map((trainerClass) =>
                    <option value={trainerClass.Name} key={trainerClass.id}>{trainerClass.Name}</option>
                )}
                </select>
            </div>
            {selectedTrainer?.pokemons.map((pokemon, index) =>
                <div className="text-black flex items-center justify-center">
                    <button onClick={(e) => {
                        let data = pokemonSpecies.find((pokemonSpeciesData) => pokemonSpeciesData.Name === pokemon.species)
                        setSelectedPokemon(data);
                        setClickedPokemon(pokemon);
                        openModal();
                    }}>
                        <img src={pokemon? `data:image/gif;base64,${pokemon?.icon}` : ''} alt="Sprite" />
                        </button>
                    
                    <Modal
                    isOpen={modalIsOpen}
                    onRequestClose={closeModal}
                    style={customStyles}
                    contentLabel="Pokemon Modal"
                    >
                        <div className="text-black justify-center">
                        <img src={pokemon? `data:image/gif;base64,${clickedPokemon?.front}` : ''} alt="Sprite" />
                        <select name="pokemons" defaultValue={clickedPokemon?.species} onChange={(e) => {
                             const pokemon = pokemonSpecies.find((pokemon) => pokemon.Name === e.target.value)
                             setSelectedPokemon(pokemon)   
                            }}>
                            <option value={"placeholder"} disabled>Select a pokemon</option>
                            {pokemonSpecies.map((pokemon) =>
                                <option value={pokemon.Name} key={pokemon.Name}>{pokemon.Name}</option>
                            )}
                        </select>
                        <br/>
                        <label>Move1:</label>
                        <br/>
                        <select name="moves1" defaultValue={pokemon?.moves[0]} onChange={(e) => setMove1(e.target.value)}>
                        <option value={"placeholder"} disabled>Select a move</option>
                        {selectedPokemon?.Moves?.map((move) =>
                            <option value={move.Name} key={move.Name}>{move.Name}</option> 
                        )}
                        </select>
                        <br/>
                        <label>Move2:</label>
                        <br/>
                        <select name="moves2" defaultValue={pokemon?.moves[1]} onChange={(e) => setMove2(e.target.value)}>
                        <option value={"placeholder"} disabled>Select a move</option>
                        {selectedPokemon?.Moves?.map((move) =>
                            <option value={move.Name} key={move.Name}>{move.Name}</option> 
                        )}
                        </select>
                        <br/>
                        <label>Move3:</label>
                        <br/>
                        <select name="moves3" defaultValue={pokemon?.moves[2]} onChange={(e) => setMove3(e.target.value)}>
                        <option value={"placeholder"} disabled>Select a move</option>
                        {selectedPokemon?.Moves?.map((move) =>
                            <option value={move.Name} key={move.Name}>{move.Name}</option> 
                        )}
                        </select>
                        <br/>
                        <label>Move4:</label>
                        <br/>
                        <select name="moves4" defaultValue={pokemon?.moves[3]} onChange={(e) => setMove4(e.target.value)}>
                        <option value={"placeholder"} disabled>Select a move</option>
                        {selectedPokemon?.Moves?.map((move) =>
                            <option value={move.Name} key={move.Name}>{move.Name}</option> 
                        )}
                        </select>
                        <br/>
                        
                        <label>HP: </label>
                        <input type="number" defaultValue={clickedPokemon?.hp} onChange={(e) => setHp(e.target.value)}></input>
                        <br/>
                        <label>Attack: </label>
                        <input type="number" defaultValue={clickedPokemon?.attack} onChange={(e) => setAttack(e.target.value)}></input>
                        <br/>
                        <label>Defense: </label>
                        <input type="number" defaultValue={clickedPokemon?.defense} onChange={(e) => setDefense(e.target.value)}></input>
                        <br/>
                        <label>SpecialAttack: </label>
                        <input type="number" defaultValue={clickedPokemon?.specialAttack} onChange={(e) => setSpecialAtk(e.target.value)}></input>
                        <br/>
                        <label>SpecialDefense: </label>
                        <input type="number" defaultValue={clickedPokemon?.specialDefense} onChange={(e) => setSpecialDef(e.target.value)}></input>
                        <br/>
                        <label>Speed: </label>
                        <input type="number" defaultValue={clickedPokemon?.speed} onChange={(e) => setSpeed(e.target.value)}></input>
                        <br/>
                        
                        <button onClick={() => {
                            let updatedSelectedPokemon = {
                                species: pokemon.species, 
                                attack: pokemon.attack, 
                                defense: pokemon.defense,
                                speed: pokemon.speed, 
                                specialAttack: pokemon.specialAttack,
                                specialDefense: pokemon.specialDefense, 
                                hp: pokemon.hp,
                                icon: pokemon.icon, 
                                front: pokemon.front, 
                                back: pokemon.back,
                                moves: [
                                    move1, move2, move3, move4
                                ]
                            }
                            closeModal()
                        }}>Close</button>
                        </div>
                    </Modal>
                </div>
            )}
           <br/>
           <button className="file: bg-blueWhale rounded border-1 border-solid w-1/6 border-black" onClick={()=> {
                let updatedTrainer = {
                    "name": trainerName,
                    "sprite": selectedTrainer.sprite,
                    "classType": selectedTrainer.classType,
                    "id": selectedTrainer.id,
                    "pokemons": selectedTrainer.pokemons
                }
                UpdateTrainer(updatedTrainer)
           }}>Save</button>
           <br/>
           <br/>
           <button onClick={() => navigate("new-trainer")} className="file: bg-blueWhale rounded border-1 border-solid w-1/6 border-black">New trainer</button>
           <br/>
        </>
    )
}
export default TrainerEditor