import { useState} from "react"
import { CreateTrainerData } from "../../../../../wailsjs/go/trainereditor/TrainerEditorApp"
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from "react-router-dom";
import { models } from "../../../../../wailsjs/go/models";

interface PokemonStatsProps {
    currentlySelectedPokemon: models.PokemonTrainerEditor;
    heldItemsList: { Name: string }[];
    setPokemonIndex: (index: number) => void;
    pokemonsCount: number;
    pokemonIndex: number;
    dictData: { name: string; classType: string; pokemons: any[]; sprite?: string };
}

const PokemonStats = ({ currentlySelectedPokemon, heldItemsList, setPokemonIndex, pokemonsCount, pokemonIndex, dictData}: PokemonStatsProps) => {
    const [move1, setMove1] = useState(currentlySelectedPokemon.Moves[0].Name)
    const [move2, setMove2] = useState(currentlySelectedPokemon.Moves[0].Name)
    const [move3, setMove3] = useState(currentlySelectedPokemon.Moves[0].Name)
    const [move4, setMove4] = useState(currentlySelectedPokemon.Moves[0].Name) 
    const [heldItem, setHeldItem] = useState(heldItemsList[0].Name)
    const [hp, setHp] = useState(currentlySelectedPokemon.HP)
    const [attack, setAttack] = useState(currentlySelectedPokemon.Attack)
    const [defense, setDefense] = useState(currentlySelectedPokemon.Defense)
    const [specialAtk, setSpecialAtk] = useState(currentlySelectedPokemon.SpecialAttack)
    const [specialDef, setSpecialDef] = useState(currentlySelectedPokemon.SpecialDefense)
    const [speed, setSpeed] = useState(currentlySelectedPokemon.Speed)
    const [level, setLevel] = useState<number>(0)
    const navigate = useNavigate();
    const createData = () => {
        const moves = []
        moves.push(move1)
        moves.push(move2)
        moves.push(move3)
        moves.push(move4)
        const data = {
            "species": currentlySelectedPokemon.Name,
            "heldItem": heldItem,
            "moves": moves,
            "hp": hp,
            "defense": defense,
            "specialAttack": specialAtk,
            "specialDefense": specialDef,
            "attack": attack,
            "speed": speed,
            "level": level,
            "id": String(currentlySelectedPokemon.ID)
        }
        setPokemonIndex(pokemonIndex + 1)
        dictData.pokemons.push(data)
    }
    const submitData = () => {
        const moves = []
        moves.push(move1)
        moves.push(move2)
        moves.push(move3)
        moves.push(move4)
        const data = {
            "species": currentlySelectedPokemon.Name,
            "heldItem": heldItem,
            "moves": moves,
            "hp": hp,
            "defense": defense,
            "specialAttack": specialAtk,
            "specialDefense": specialDef,
            "attack": attack,
            "speed": speed,
            "level": level,
            "id": currentlySelectedPokemon.ID
        }
        
        dictData.pokemons.push(data)
        let finalData: models.TrainerJson = {
            "name": dictData.name,
            "sprite": dictData.sprite || "",
            "spritename": dictData.sprite || "",
            "classType": dictData.classType,
            "id": uuidv4(),
            "pokemons": dictData.pokemons,
            "convertValues": () => {}
        }
        
        CreateTrainerData(finalData)
        navigate(-1)
    }
    return(
        <div>
        <br/>
        <div className="flex items-center justify-center">
            <img src={currentlySelectedPokemon? `data:image/png;base64,${currentlySelectedPokemon?.FrontSprite}` : ''} alt="pokemon sprite"/>
        </div>
            <br />
            <div className="text-left">
                <label>HP:</label>
                <input type="number" value={currentlySelectedPokemon.HP} max={300} onChange={(e) => setHp(Number(e.target.value))}></input>
                <label>Attack:</label>
                <input value={currentlySelectedPokemon.Attack} type="number" onChange={(e) => setAttack(Number(e.target.value))}></input>
                <br/>
                <br/>
                <label>Defense:</label>
                <input type="number" value={currentlySelectedPokemon.Defense} max={300} onChange={(e) => setDefense(Number(e.target.value))}></input>
                <br/>
                <br/>
                <label>SpecialAtk:</label>
                <input type="number" value={currentlySelectedPokemon.SpecialAttack} max={300} onChange={(e) => setSpecialAtk(Number(e.target.value))}></input>
                <br/>
                <br/>
                <label>SpecialDef:</label>
                <input type="number" value={currentlySelectedPokemon.SpecialDefense} max={300} onChange={(e) => setSpecialDef(Number(e.target.value))}></input>
                <br/>
                <br/>
                <label>Speed:</label>
                <input type="number" value={currentlySelectedPokemon.Speed} max={300} onChange={(e) => setSpeed(Number(e.target.value))}></input>
                <br/>
                <br/>
                <label>Level: </label>
                <input type="number" max={100} min={1} onChange={(e) => setLevel(Number(e.target.value))}></input>
            </div>
        
        <br/>
        <br/>
        <label>Move1:</label>
        <select name="moves1" defaultValue={"placeholder"} onChange={(e) => setMove1(e.target.value)}>
        <option value={"placeholder"} disabled>Select a move</option>
        {currentlySelectedPokemon.Moves.map((move: { Name: string }) =>
            <option value={move.Name} key={move.Name}>{move.Name}</option> 
        )}
        </select>
        <br/>
        <br/>
        <label>Move2:</label>
        <select name="moves2" defaultValue={"placeholder"} onChange={(e) => setMove2(e.target.value)}>
        <option value={"placeholder"} disabled>Select a move</option>
        {currentlySelectedPokemon.Moves.map((move: { Name: string }) =>
            <option value={move.Name} key={move.Name}>{move.Name}</option> 
        )}
        </select>
        <br/>
        <br/>
        <label>Move3:</label>
        <select name="moves3" defaultValue={"placeholder"} onChange={(e) => setMove3(e.target.value)}>
        <option value={"placeholder"} disabled>Select a move</option>
        {currentlySelectedPokemon.Moves.map((move: { Name: string }) =>
            <option value={move.Name} key={move.Name}>{move.Name}</option> 
        )}
        </select>
        <br/>
        <br/>
        <label>Move4:</label>
        <select name="moves4" defaultValue={"placeholder"} onChange={(e) => setMove4(e.target.value)}>
        <option value={"placeholder"} disabled>Select a move</option>
        {currentlySelectedPokemon.Moves.map((move: { Name: string }) =>
            <option value={move.Name} key={move.Name}>{move.Name}</option> 
        )}
        </select>
        <br/>
        <br/>
        <label>HeldItem:</label>
        <select name="heldItem" defaultValue={"placeholder"} onChange={(e) => setHeldItem(e.target.value)}>
        <option value={"placeholder"} disabled>Select held Item</option>
        {heldItemsList.map((item: { Name: string }) =>
            <option value={item.Name} key={item.Name}>{item.Name}</option> 
        )}
        </select>
        <br/>
        <br/>
        {pokemonIndex < pokemonsCount ? <button onClick={() => createData()} className="file: bg-blueWhale rounded border-1 border-solid w-1/6 border-black text-white">Next</button> : <></>}
        {pokemonIndex == pokemonsCount ? <button onClick={() => submitData()} className="file: bg-blueWhale rounded border-1 border-solid w-1/6 border-black text-white">Finish</button> : <></>}
        </div>
    )
}
export default PokemonStats