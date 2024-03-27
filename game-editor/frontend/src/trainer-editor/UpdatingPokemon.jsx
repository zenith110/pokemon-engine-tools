import { useState } from "react";
import { GrabPokemonImages } from "../../wailsjs/go/main/App"
import Modal from 'react-modal';
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

const UpdatingPokemon = ({ selectedTrainer, pokemonSpecies, setSelectedTrainer, index, pokemon, heldItems}) => {
    const [selectedPokemon, setSelectedPokemon] = useState({});
    const [clickedPokemon, setClickedPokemon] = useState({});
    
    // Clicked pokemon releated stats
    const [move1, setMove1] = useState(pokemon?.moves[0])
    const [move2, setMove2] = useState(pokemon?.moves[1])
    const [move3, setMove3] = useState(pokemon?.moves[2])
    const [move4, setMove4] = useState(pokemon?.moves[3]) 
    const [heldItem, setHeldItem] = useState("")
    const [hp, setHp] = useState(pokemon?.hp)
    const [attack, setAttack] = useState(pokemon?.attack)
    const [defense, setDefense] = useState(pokemon?.defense)
    const [specialAttack, setSpecialAttack] = useState(pokemon?.specialAttack)
    const [specialDefense, setSpecialDefense] = useState(pokemon?.specialDefense)
    const [speed, setSpeed] = useState(pokemon?.speed)
    const [level, setLevel] = useState(pokemon?.level)
    const [species, setSpecies] = useState(pokemon?.species)
    const [modalIsOpen, setIsOpen] = useState(false);
    const [id, setId] = useState(pokemon?.id)
    
    const openModal = () => {
        setIsOpen(true);
    }

    const closeModal = () => {
        setIsOpen(false);
    }
    return(
        <div>
            
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
                        <img src={clickedPokemon? `data:image/gif;base64,${clickedPokemon?.front}` : ''} alt="Sprite" />
                        <select name="pokemons" defaultValue={clickedPokemon?.species} onChange={(e) => {
                             const pokemonData = pokemonSpecies.find((pokemon) => pokemon.Name === e.target.value)
                             console.log(pokemonData)
                             setSpecies(pokemonData.Name)
                             setSelectedPokemon(pokemonData)
                             setId(pokemonData.ID)
                            }}>
                            <option value={"placeholder"} disabled>Select a pokemon</option>
                            {pokemonSpecies.map((pokemon) =>
                                <option value={pokemon.Name} key={pokemon.Id}>{pokemon.Name}</option>
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
                        <input type="number" defaultValue={clickedPokemon?.specialAttack} onChange={(e) => setSpecialAttack(e.target.value)}></input>
                        <br/>
                        <label>SpecialDefense: </label>
                        <input type="number" defaultValue={clickedPokemon?.specialDefense} onChange={(e) => setSpecialDefense(e.target.value)}></input>
                        <br/>
                        <label>Speed: </label>
                        <input type="number" defaultValue={clickedPokemon?.speed} onChange={(e) => setSpeed(e.target.value)}></input>
                        <br/>
                        <label>Level: </label>
                        <input type="number" defaultValue={clickedPokemon?.level} onChange={(e) => setLevel(e.target.value)}></input>
                        <br/>
                        <label>Held Item: </label>
                        <select name="heldItem" defaultValue={pokemon?.heldItem ? pokemon?.heldItem : "placeholder"} onChange={(e) => setHeldItem(e.target.value)}>
                        <option value={"placeholder"} disabled>Select a held item</option>
                        {heldItems.map((heldItem) =>
                            <option value={heldItem.Name} key={heldItem.Name}>{heldItem.Name}</option> 
                        )}
                        </select>
                        <br/>
                        <button onClick={async () => {
                            const data = {
                                Id: id
                            }
                            let images = await GrabPokemonImages(data)
                            
                            let updatedSelectedPokemon = {
                                species: species, 
                                attack: attack, 
                                defense: defense,
                                speed: speed, 
                                specialAttack: specialAttack,
                                specialDefense: specialDefense, 
                                hp: hp,
                                moves: [
                                    move1, move2, move3, move4
                                ],
                                icon: images.Icon,
                                front: images.Front,
                                id: id,
                                level: parseInt(level),
                                heldItem: heldItem
                            }
                            
                            selectedTrainer.pokemons[index] = updatedSelectedPokemon
                            console.log(selectedTrainer)
                            setSelectedTrainer(selectedTrainer)
                            
                            closeModal()
                        }}>Close</button>
                        </div>
                    </Modal>
                </div>
        </div>
    )
}
export default UpdatingPokemon;