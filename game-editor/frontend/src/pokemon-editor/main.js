var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { useNavigate } from "react-router-dom";
import { ParsePokemonData } from "../../wailsjs/go/parsing/ParsingApp";
import { useEffect, useState } from "react";
import Select from "react-select";
import React from "react";
import { Dialog } from "@headlessui/react";
export default function PokemonEditor() {
    var _this = this;
    var _a, _b, _c;
    var navigate = useNavigate();
    var _d = useState([]), pokemonSpecies = _d[0], setPokemonSpecies = _d[1];
    var _e = useState(), selectedPokemon = _e[0], setSelectedPokemon = _e[1];
    var _f = useState([]), abilities = _f[0], setAbilities = _f[1];
    var _g = useState(), hiddenAbility = _g[0], setHiddenAbility = _g[1];
    var _h = useState(false), isTypeModalOpen = _h[0], setIsTypeModalOpen = _h[1];
    var pokemonTypes = ["Bug", "Dark", "Dragon", "Electric", "Fairy", "Fighting", "Fire", "Flying", "Ghost", "Grass", "Ground", "Ice", "Normal", "Poison", "Psychic", "Rock", "Steel", "Water"];
    var regex = /^[0-9\b]{0,3}$/;
    var fetchPokemonSpecies = function () { return __awaiter(_this, void 0, void 0, function () {
        var data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, ParsePokemonData()];
                case 1:
                    data = _a.sent();
                    setPokemonSpecies(data.map(function (pokemon) { return (__assign(__assign({}, pokemon), { DexEntry: "", ID: String(pokemon.ID), Evolutions: pokemon.Evolutions.map(function (evo) { return (__assign(__assign({}, evo), { Method1: evo.Method1 ? [evo.Method1] : [], Method2: evo.Method2 ? [evo.Method2] : [] })); }) })); }));
                    return [2 /*return*/];
            }
        });
    }); };
    var handleStatChange = function (stat, val) {
        setSelectedPokemon(function (prevState) {
            var _a;
            return (__assign(__assign({}, prevState), (_a = {}, _a[stat] = val, _a)));
        });
    };
    useEffect(function () {
        fetchPokemonSpecies();
    }, [selectedPokemon == undefined]);
    return (React.createElement("div", { className: "flex flex-col grow h-[91.5vh] w-screen border-red-800" },
        React.createElement("div", { className: "flex flex-row h-5/6 border-orange-600" },
            React.createElement("div", { className: "flex flex-col w-5/12 justify-around border-green-500" },
                React.createElement("div", { className: "rounded-2xl grid grid-rows-2 grid-cols-2 grow border-yellow-400 bg-offWhite items-stretch text-black ml-1 mt-2" },
                    React.createElement("img", { src: selectedPokemon ? "data:image/png;base64,".concat(selectedPokemon === null || selectedPokemon === void 0 ? void 0 : selectedPokemon.FrontSprite) : '', alt: "Front Sprite" }),
                    React.createElement("img", { src: selectedPokemon ? "data:image/png;base64,".concat(selectedPokemon === null || selectedPokemon === void 0 ? void 0 : selectedPokemon.ShinyFront) : '', alt: "Shiny Front Sprite" }),
                    React.createElement("img", { src: selectedPokemon ? "data:image/png;base64,".concat(selectedPokemon === null || selectedPokemon === void 0 ? void 0 : selectedPokemon.BackSprite) : '', alt: "Back Sprite" }),
                    React.createElement("img", { src: selectedPokemon ? "data:image/png;base64,".concat(selectedPokemon === null || selectedPokemon === void 0 ? void 0 : selectedPokemon.ShinyBack) : '', alt: "Shiny Back Sprite" })),
                React.createElement("div", { className: "text-black border-yellow-500 flex flex-row justify-around py-6" },
                    React.createElement(Select, { options: pokemonSpecies.map(function (pokemon) { return ({ value: pokemon.ID, label: "".concat(pokemon.ID, ": ").concat(pokemon.Name) }); }), onChange: function (e) {
                            var _a, _b;
                            var selected = pokemonSpecies.find(function (pokemon) { return pokemon.ID === (e === null || e === void 0 ? void 0 : e.value); });
                            setSelectedPokemon(selected);
                            setAbilities(selected === null || selected === void 0 ? void 0 : selected.Abilities.filter(function (ability) { return !ability.IsHidden; }).map(function (ability) { return ability.Name; }));
                            setHiddenAbility(((_a = selected === null || selected === void 0 ? void 0 : selected.Abilities.find(function (ability) { return ability.IsHidden; })) === null || _a === void 0 ? void 0 : _a.Name) ? (_b = selected === null || selected === void 0 ? void 0 : selected.Abilities.find(function (ability) { return ability.IsHidden; })) === null || _b === void 0 ? void 0 : _b.Name : undefined);
                        }, isClearable: false, isDisabled: false, isLoading: false, isRtl: false, isSearchable: true, isMulti: false, classNames: {
                            control: function () { return "rounded-2xl"; }
                        } }),
                    React.createElement("button", { onClick: function () { return console.log("TO BE ADDED"); }, className: "bg-blueWhale rounded-lg hover:bg-wildBlueYonder w-5/12 text-white" }, "New Pokemon")),
                React.createElement("div", { className: "flex flex-row justify-center" },
                    React.createElement("p", { className: "bg-blueWhale px-6 py-3 rounded-l-2xl pl-10 items-center" }, "Type:"),
                    React.createElement("button", { onClick: function () { setIsTypeModalOpen(true); }, className: "bg-tealBlue px-6 py-3 rounded-r-2xl min-w-40 hover:bg-wildBlueYonder" }, (selectedPokemon === null || selectedPokemon === void 0 ? void 0 : selectedPokemon.Types) ? selectedPokemon.Types.join('/') : '???')),
                React.createElement(Dialog, { open: isTypeModalOpen, onClose: function () { return setIsTypeModalOpen(false); }, className: "relative z-50" },
                    React.createElement("div", { className: "fixed inset-0 bg-black/40", "aria-hidden": "true" }),
                    React.createElement("div", { className: "fixed inset-0 flex w-screen items-center justify-center" },
                        React.createElement(Dialog.Panel, { className: "mx-auto w-1/2 rounded-2xl bg-tealBlue" },
                            React.createElement(Dialog.Title, { className: "bg-blueWhale rounded-t-2xl p-2" },
                                React.createElement("div", { className: "flex flex-row justify-center" },
                                    React.createElement("div", { className: "grow ml-6 font-medium" }, "Edit Type"),
                                    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-6 h-6", onClick: function () { return setIsTypeModalOpen(false); } },
                                        React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" })))),
                            React.createElement("div", { className: "flex flex-row justify-around py-4" },
                                React.createElement("div", { className: "flex flex-row items-center" },
                                    React.createElement("h3", null, "Type 1:"),
                                    React.createElement(Select, { isClearable: false, isDisabled: false, isLoading: false, isRtl: false, isSearchable: false, isMulti: false, options: pokemonTypes.map(function (type) { return ({ value: type, label: type }); }), defaultValue: { value: selectedPokemon === null || selectedPokemon === void 0 ? void 0 : selectedPokemon.Types[0], label: selectedPokemon === null || selectedPokemon === void 0 ? void 0 : selectedPokemon.Types[0] }, className: "text-black", onChange: function (e) {
                                            setSelectedPokemon(function (prevState) { return (__assign(__assign({}, prevState), { Types: [e === null || e === void 0 ? void 0 : e.value, prevState === null || prevState === void 0 ? void 0 : prevState.Types[1]] })); });
                                        } })),
                                React.createElement("div", { className: "flex flex-row items-center" },
                                    React.createElement("h3", null, "Type 2 (Optional):"),
                                    React.createElement(Select, { isClearable: false, isDisabled: false, isLoading: false, isRtl: false, isSearchable: false, isMulti: false, options: __spreadArray([{ value: "None", label: "None" }], pokemonTypes.map(function (type) { return ({ value: type, label: type }); }), true), defaultValue: { value: (selectedPokemon === null || selectedPokemon === void 0 ? void 0 : selectedPokemon.Types[1]) ? selectedPokemon === null || selectedPokemon === void 0 ? void 0 : selectedPokemon.Types[1] : "None", label: (selectedPokemon === null || selectedPokemon === void 0 ? void 0 : selectedPokemon.Types[1]) ? selectedPokemon === null || selectedPokemon === void 0 ? void 0 : selectedPokemon.Types[1] : "None" }, className: "text-black", onChange: function (e) {
                                            if ((e === null || e === void 0 ? void 0 : e.value) === "None") {
                                                setSelectedPokemon(function (prevState) { return (__assign(__assign({}, prevState), { Types: [prevState === null || prevState === void 0 ? void 0 : prevState.Types[0]] })); });
                                            }
                                            else {
                                                setSelectedPokemon(function (prevState) { return (__assign(__assign({}, prevState), { Types: [prevState === null || prevState === void 0 ? void 0 : prevState.Types[0], e === null || e === void 0 ? void 0 : e.value] })); });
                                            }
                                        } }))),
                            React.createElement("div", { className: "flex flex-row items-center justify-center py-2" },
                                React.createElement("button", { onClick: function () { return setIsTypeModalOpen(false); }, className: "px-12 bg-white text-black rounded-lg  hover:bg-offWhite" }, "Save")))))),
            React.createElement("div", { className: "border-yellow-400 mt-2 w-2/3 flex flex-col" },
                React.createElement("div", { className: "border-green-500 flex flex-row justify-around" },
                    React.createElement("div", { className: "flex flex-col mx-4" },
                        React.createElement("h4", { className: "bg-blueWhale rounded-t-lg py-1 px-4" }, "Level-Up Moves"),
                        React.createElement("div", { className: "max-h-24 min-h-24 overflow-auto overscroll-none bg-tealBlue" }, ((_a = selectedPokemon === null || selectedPokemon === void 0 ? void 0 : selectedPokemon.Moves.length) !== null && _a !== void 0 ? _a : 0 > 0) ?
                            selectedPokemon === null || selectedPokemon === void 0 ? void 0 : selectedPokemon.Moves.filter(function (move) { return move.Method === "level-up"; }).sort(function (a, b) { return a.Level - b.Level; }).map(function (move, index) { return (React.createElement("p", { className: "bg-tealBlue", key: index },
                                move.Name,
                                " - level: ",
                                move.Level)); })
                            : React.createElement("p", null, "No Moves")),
                        React.createElement("button", { onClick: function () { console.log("Add Later"); }, className: "bg-blueWhale rounded-b-lg py-1 hover:bg-wildBlueYonder" }, " Edit")),
                    React.createElement("div", { className: "flex flex-col mx-4" },
                        React.createElement("h4", { className: "bg-blueWhale rounded-t-lg py-1 px-8 text-nowrap" }, "Tutor/Egg Moves"),
                        React.createElement("div", { className: "h-24 overflow-auto w-full overscroll-none bg-tealBlue" }, ((_b = selectedPokemon === null || selectedPokemon === void 0 ? void 0 : selectedPokemon.Moves.length) !== null && _b !== void 0 ? _b : 0 > 0) ?
                            selectedPokemon === null || selectedPokemon === void 0 ? void 0 : selectedPokemon.Moves.filter(function (move) { return move.Method === "tutor" || move.Method === "egg"; }).map(function (move, index) { return (React.createElement("p", { className: "", key: index }, move.Name)); })
                            : React.createElement("p", null, "No Moves")),
                        React.createElement("button", { onClick: function () { console.log("Add Later"); }, className: "bg-blueWhale rounded-b-lg py-1 hover:bg-wildBlueYonder" }, " Edit")),
                    React.createElement("div", { className: "flex flex-col mx-4" },
                        React.createElement("h4", { className: "bg-blueWhale rounded-t-lg py-1 px-6 text-nowrap" }, "TM/HM Moves"),
                        React.createElement("div", { className: "h-24 overflow-auto w-full overscroll-none bg-tealBlue" }, ((_c = selectedPokemon === null || selectedPokemon === void 0 ? void 0 : selectedPokemon.Moves.length) !== null && _c !== void 0 ? _c : 0 > 0) ?
                            selectedPokemon === null || selectedPokemon === void 0 ? void 0 : selectedPokemon.Moves.filter(function (move) { return move.Method === "machine"; }).map(function (move, index) { return (React.createElement("p", { className: "", key: index }, move.Name)); })
                            : React.createElement("p", null, "No Moves")),
                        React.createElement("button", { onClick: function () { console.log("Add Later"); }, className: "bg-blueWhale rounded-b-lg py-1 hover:bg-wildBlueYonder" }, " Edit"))),
                React.createElement("div", { className: "border-green-500 border-4 flex flex-row justify-around h-full" },
                    React.createElement("div", { className: "flex flex-col justify-center border-2 border-pink-600 bg-offWhite text-black rounded-xl w-5/12" },
                        "Evolution line here",
                        React.createElement("img", { src: selectedPokemon ? "data:image/gif;base64,".concat(selectedPokemon.Icon) : '' })),
                    React.createElement("div", { className: "border-blue-500 border-4 flex flex-col justify-evenly w-5/12" },
                        React.createElement("div", null,
                            React.createElement("h4", { className: "bg-blueWhale rounded-t-lg pt-2" }, "Ability 1"),
                            React.createElement("button", { onClick: function () { return console.log("Add Later"); }, className: "bg-tealBlue rounded-b-lg hover:bg-wildBlueYonder w-full py-2" }, selectedPokemon ? abilities[0] : "None")),
                        React.createElement("div", null,
                            React.createElement("h4", { className: "bg-blueWhale rounded-t-lg pt-2" }, "Ability 2 (Optional)"),
                            React.createElement("button", { onClick: function () { return console.log("Add Later"); }, className: "bg-tealBlue rounded-b-lg hover:bg-wildBlueYonder w-full py-2" }, selectedPokemon && abilities.length > 1 ? abilities[1] : "None")),
                        React.createElement("div", null,
                            React.createElement("h4", { className: "bg-blueWhale rounded-t-lg pt-2" }, "Hidden Ability"),
                            React.createElement("button", { onClick: function () { return console.log("Add Later"); }, className: "bg-tealBlue rounded-b-lg hover:bg-wildBlueYonder w-full py-2" }, selectedPokemon && hiddenAbility != undefined ? hiddenAbility : "None")))))),
        React.createElement("div", { className: "flex flex-row justify-around h-1/4" },
            React.createElement("div", { className: "h-1/6 pt-8 grow-[.4]" },
                React.createElement("div", { className: "grid grid-cols-6 bg-blueWhale rounded-t-xl text-center divide-black divide-x gap-y-4 py-2" },
                    React.createElement("h3", null, "HP"),
                    React.createElement("h3", null, "Attack"),
                    React.createElement("h3", null, "Defense"),
                    React.createElement("h3", null, "Sp. Atk"),
                    React.createElement("h3", null, "Sp. Def"),
                    React.createElement("h3", null, "Speed")),
                React.createElement("div", { className: "grid grid-cols-6 bg-tealBlue rounded-b-xl py-4" },
                    React.createElement("input", { value: selectedPokemon ? selectedPokemon === null || selectedPokemon === void 0 ? void 0 : selectedPokemon.HP : 0, type: "number", className: "flex shrink bg-tealBlue text-center", onChange: function (e) {
                            if (e.target.value === '' || regex.test(e.target.value)) {
                                if (parseInt(e.target.value) <= 255 && parseInt(e.target.value) >= 5) {
                                    handleStatChange('HP', parseInt(e.target.value));
                                }
                                else if (parseInt(e.target.value) > 255) {
                                    handleStatChange('HP', 255);
                                }
                                else if (parseInt(e.target.value) < 5) {
                                    handleStatChange('HP', 5);
                                }
                            }
                        }, max: 255, min: 5 }),
                    React.createElement("input", { value: selectedPokemon ? selectedPokemon === null || selectedPokemon === void 0 ? void 0 : selectedPokemon.Attack : 0, type: "number", className: "flex shrink bg-tealBlue text-center", onChange: function (e) {
                            if (e.target.value === '' || regex.test(e.target.value)) {
                                if (parseInt(e.target.value) <= 255 && parseInt(e.target.value) >= 5) {
                                    handleStatChange('Attack', parseInt(e.target.value));
                                }
                                else if (parseInt(e.target.value) > 255) {
                                    handleStatChange('Attack', 255);
                                }
                                else if (parseInt(e.target.value) < 5) {
                                    handleStatChange('Attack', 5);
                                }
                            }
                        }, max: 255, min: 5 }),
                    React.createElement("input", { value: selectedPokemon ? selectedPokemon === null || selectedPokemon === void 0 ? void 0 : selectedPokemon.Defense : 0, type: "number", className: "flex shrink bg-tealBlue text-center", onChange: function (e) {
                            if (e.target.value === '' || regex.test(e.target.value)) {
                                if (parseInt(e.target.value) <= 255 && parseInt(e.target.value) >= 5) {
                                    handleStatChange('Defense', parseInt(e.target.value));
                                }
                                else if (parseInt(e.target.value) > 255) {
                                    handleStatChange('Defense', 255);
                                }
                                else if (parseInt(e.target.value) < 5) {
                                    handleStatChange('Defense', 5);
                                }
                            }
                        }, max: 255, min: 5 }),
                    React.createElement("input", { value: selectedPokemon ? selectedPokemon === null || selectedPokemon === void 0 ? void 0 : selectedPokemon.SpecialAttack : 0, type: "number", className: "flex shrink bg-tealBlue text-center", onChange: function (e) {
                            if (e.target.value === '' || regex.test(e.target.value)) {
                                if (parseInt(e.target.value) <= 255 && parseInt(e.target.value) >= 5) {
                                    handleStatChange('SpecialAttack', parseInt(e.target.value));
                                }
                                else if (parseInt(e.target.value) > 255) {
                                    handleStatChange('SpecialAttack', 255);
                                }
                                else if (parseInt(e.target.value) < 5) {
                                    handleStatChange('SpecialAttack', 5);
                                }
                            }
                        }, max: 255, min: 5 }),
                    React.createElement("input", { value: selectedPokemon ? selectedPokemon === null || selectedPokemon === void 0 ? void 0 : selectedPokemon.SpecialDefense : 0, type: "number", className: "flex shrink bg-tealBlue text-center", onChange: function (e) {
                            if (e.target.value === '' || regex.test(e.target.value)) {
                                if (parseInt(e.target.value) <= 255 && parseInt(e.target.value) >= 5) {
                                    handleStatChange('SpecialDefense', parseInt(e.target.value));
                                }
                                else if (parseInt(e.target.value) > 255) {
                                    handleStatChange('SpecialDefense', 255);
                                }
                                else if (parseInt(e.target.value) < 5) {
                                    handleStatChange('SpecialDefense', 5);
                                }
                            }
                        }, max: 255, min: 5 }),
                    React.createElement("input", { value: selectedPokemon ? selectedPokemon === null || selectedPokemon === void 0 ? void 0 : selectedPokemon.Speed : 0, type: "number", className: "flex shrink bg-tealBlue text-center", onChange: function (e) {
                            if (e.target.value === '' || regex.test(e.target.value)) {
                                if (parseInt(e.target.value) <= 255 && parseInt(e.target.value) >= 5) {
                                    handleStatChange('Speed', parseInt(e.target.value));
                                }
                                else if (parseInt(e.target.value) > 255) {
                                    handleStatChange('Speed', 255);
                                }
                                else if (parseInt(e.target.value) < 5) {
                                    handleStatChange('Speed', 5);
                                }
                            }
                        }, max: 255, min: 5 }))),
            React.createElement("div", { className: "flex flex-row items-center" },
                React.createElement("button", { onClick: function () { return console.log("Add Later"); }, className: "px-12 py-1 mr-[6vw] bg-blueWhale rounded-lg  hover:bg-wildBlueYonder" }, "Save"),
                React.createElement("button", { onClick: function () { return console.log("Add Later"); }, className: "px-12 py-1 bg-blueWhale rounded-lg  hover:bg-wildBlueYonder" }, "Reset")))));
}
