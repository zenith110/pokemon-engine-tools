import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { CreateTrainerData } from "../../../../../wailsjs/go/trainereditor/TrainerEditorApp";
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from "react-router-dom";
const PokemonStats = ({ currentlySelectedPokemon, heldItemsList, setPokemonIndex, pokemonsCount, pokemonIndex, dictData }) => {
    const [move1, setMove1] = useState(currentlySelectedPokemon.Moves[0].Name);
    const [move2, setMove2] = useState(currentlySelectedPokemon.Moves[0].Name);
    const [move3, setMove3] = useState(currentlySelectedPokemon.Moves[0].Name);
    const [move4, setMove4] = useState(currentlySelectedPokemon.Moves[0].Name);
    const [heldItem, setHeldItem] = useState(heldItemsList[0].Name);
    const [hp, setHp] = useState(currentlySelectedPokemon.HP);
    const [attack, setAttack] = useState(currentlySelectedPokemon.Attack);
    const [defense, setDefense] = useState(currentlySelectedPokemon.Defense);
    const [specialAtk, setSpecialAtk] = useState(currentlySelectedPokemon.SpecialAttack);
    const [specialDef, setSpecialDef] = useState(currentlySelectedPokemon.SpecialDefense);
    const [speed, setSpeed] = useState(currentlySelectedPokemon.Speed);
    const [level, setLevel] = useState(0);
    const navigate = useNavigate();
    const createData = () => {
        const moves = [];
        moves.push(move1);
        moves.push(move2);
        moves.push(move3);
        moves.push(move4);
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
            "level": parseInt(level),
            "id": String(currentlySelectedPokemon.ID)
        };
        setPokemonIndex(pokemonIndex + 1);
        dictData.pokemons.push(data);
    };
    const submitData = () => {
        const moves = [];
        moves.push(move1);
        moves.push(move2);
        moves.push(move3);
        moves.push(move4);
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
            "level": parseInt(level),
            "id": currentlySelectedPokemon.ID
        };
        dictData.pokemons.push(data);
        let finalData = {
            "name": dictData.name,
            "sprite": dictData.sprite,
            "classType": dictData.classType,
            "id": uuidv4(),
            "pokemons": dictData.pokemons
        };
        CreateTrainerData(finalData);
        navigate(-1);
    };
    return (_jsxs("div", { children: [_jsx("br", {}), _jsx("div", { className: "flex items-center justify-center", children: _jsx("img", { src: currentlySelectedPokemon ? `data:image/png;base64,${currentlySelectedPokemon?.FrontSprite}` : '', alt: "pokemon sprite" }) }), _jsx("br", {}), _jsxs("div", { className: "text-left", children: [_jsx("label", { children: "HP:" }), _jsx("input", { type: "number", value: currentlySelectedPokemon.HP, max: 300, onChange: (e) => setHp(e.target.value) }), _jsx("label", { max: 300, children: "Attack:" }), _jsx("input", { value: currentlySelectedPokemon.Attack, type: "number", onChange: (e) => setAttack(e.target.value) }), _jsx("br", {}), _jsx("br", {}), _jsx("label", { children: "Defense:" }), _jsx("input", { type: "number", value: currentlySelectedPokemon.Defense, max: 300, onChange: (e) => setDefense(e.target.value) }), _jsx("br", {}), _jsx("br", {}), _jsx("label", { children: "SpecialAtk:" }), _jsx("input", { type: "number", value: currentlySelectedPokemon.SpecialAttack, max: 300, onChange: (e) => setSpecialAtk(e.target.value) }), _jsx("br", {}), _jsx("br", {}), _jsx("label", { children: "SpecialDef:" }), _jsx("input", { type: "number", value: currentlySelectedPokemon.SpecialDefense, max: 300, onChange: (e) => setSpecialDef(e.target.value) }), _jsx("br", {}), _jsx("br", {}), _jsx("label", { children: "Speed:" }), _jsx("input", { type: "number", value: currentlySelectedPokemon.Speed, max: 300, onChange: (e) => setSpeed(e.target.value) }), _jsx("br", {}), _jsx("br", {}), _jsx("label", { children: "Level: " }), _jsx("input", { type: "number", max: 100, min: 1, onChange: (e) => setLevel(e.target.value) })] }), _jsx("br", {}), _jsx("br", {}), _jsx("label", { children: "Move1:" }), _jsxs("select", { name: "moves1", defaultValue: "placeholder", onChange: (e) => setMove1(e.target.value), children: [_jsx("option", { value: "placeholder", disabled: true, children: "Select a move" }), currentlySelectedPokemon.Moves.map((move) => _jsx("option", { value: move.Name, children: move.Name }, move.Name))] }), _jsx("br", {}), _jsx("br", {}), _jsx("label", { children: "Move2:" }), _jsxs("select", { name: "moves2", defaultValue: "placeholder", onChange: (e) => setMove2(e.target.value), children: [_jsx("option", { value: "placeholder", disabled: true, children: "Select a move" }), currentlySelectedPokemon.Moves.map((move) => _jsx("option", { value: move.Name, children: move.Name }, move.Name))] }), _jsx("br", {}), _jsx("br", {}), _jsx("label", { children: "Move3:" }), _jsxs("select", { name: "moves3", defaultValue: "placeholder", onChange: (e) => setMove3(e.target.value), children: [_jsx("option", { value: "placeholder", disabled: true, children: "Select a move" }), currentlySelectedPokemon.Moves.map((move) => _jsx("option", { value: move.Name, children: move.Name }, move.Name))] }), _jsx("br", {}), _jsx("br", {}), _jsx("label", { children: "Move4:" }), _jsxs("select", { name: "moves4", defaultValue: "placeholder", onChange: (e) => setMove4(e.target.value), children: [_jsx("option", { value: "placeholder", disabled: true, children: "Select a move" }), currentlySelectedPokemon.Moves.map((move) => _jsx("option", { value: move.Name, children: move.Name }, move.Name))] }), _jsx("br", {}), _jsx("br", {}), _jsx("label", { children: "HeldItem:" }), _jsxs("select", { name: "heldItem", defaultValue: "placeholder", onChange: (e) => setHeldItem(e.target.value), children: [_jsx("option", { value: "placeholder", disabled: true, children: "Select held Item" }), heldItemsList.map((item) => _jsx("option", { value: item.Name, children: item.Name }, item.Name))] }), _jsx("br", {}), _jsx("br", {}), pokemonIndex < pokemonsCount ? _jsx("button", { onClick: () => createData(), className: "file: bg-blueWhale rounded border-1 border-solid w-1/6 border-black text-white", children: "Next" }) : _jsx(_Fragment, {}), pokemonIndex == pokemonsCount ? _jsx("button", { onClick: () => submitData(), className: "file: bg-blueWhale rounded border-1 border-solid w-1/6 border-black text-white", children: "Finish" }) : _jsx(_Fragment, {})] }));
};
export default PokemonStats;
