import { useState, useEffect } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Plus, Trash2, X } from "lucide-react";

import { Label } from "../../components/ui/label";
import { MapEncounter } from "../types";
import { ParsePokemonData } from "../../../wailsjs/go/parsing/ParsingApp";
import CreateEncounterDialog from "./CreateEncounterDialog";

interface EncounterViewProps {
    encounters: MapEncounter[];
    setEncounters: (encounters: MapEncounter[]) => void;
}

const encounterTypes = {
    grass: { name: "Grass", icon: "🌱", color: "bg-green-500" },
    water: { name: "Water", icon: "💧", color: "bg-blue-500" },
    cave: { name: "Cave", icon: "🕳️", color: "bg-gray-500" },
    fishing: { name: "Fishing", icon: "🎣", color: "bg-sky-500" },
} as const;

const EncounterView = ({
    encounters,
    setEncounters,
}: EncounterViewProps) => {

    const [pokemonList, setPokemonList] = useState<Array<{ Name: string; ID: string }>>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch Pokemon data from backend
    useEffect(() => {
        const fetchPokemonData = async () => {
            try {
                const data = await ParsePokemonData();
                if (data) {
                    setPokemonList(data);
                }
            } catch (error) {
                console.error('Error fetching Pokemon data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPokemonData();
    }, []);



    const deleteEncounter = (encounterId: string) => {
        setEncounters(encounters.filter((encounter) => encounter.id !== encounterId));
    };

    const addPokemon = (encounterId: string) => {
        setEncounters(
            encounters.map((encounter) =>
                encounter.id === encounterId
                    ? {
                        ...encounter,
                        pokemon: [...encounter.pokemon, { name: "New Pokemon", level: 5, chance: 10 }]
                    }
                    : encounter
            )
        );
    };

    const removePokemon = (encounterId: string, pokemonIndex: number) => {
        setEncounters(
            encounters.map((encounter) =>
                encounter.id === encounterId
                    ? {
                        ...encounter,
                        pokemon: encounter.pokemon.filter((_, index) => index !== pokemonIndex)
                    }
                    : encounter
            )
        );
    };

    const updatePokemon = (encounterId: string, pokemonIndex: number, field: string, value: string | number) => {
        setEncounters(
            encounters.map((encounter) =>
                encounter.id === encounterId
                    ? {
                        ...encounter,
                        pokemon: encounter.pokemon.map((pokemon, index) =>
                            index === pokemonIndex
                                ? { ...pokemon, [field]: value }
                                : pokemon
                        )
                    }
                    : encounter
            )
        );
    };

    return (
        <div className="space-y-4">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-white block mb-1">Encounter Types</Label>
                    <div className="flex justify-center w-full">
                        <div className="grid grid-cols-2 gap-3 w-max">
                            {Object.entries(encounterTypes).map(([type, config]) => (
                                <CreateEncounterDialog
                                    key={type}
                                    encounterType={config}
                                    pokemonList={pokemonList}
                                    onEncounterCreate={(encounter) => {
                                        setEncounters([...encounters, encounter]);
                                    }}
                                    trigger={
                                        <Button
                                            variant="outline"
                                            className="flex items-center gap-2 w-32 justify-start"
                                        >
                                            <span>{config.icon}</span>
                                            <span>{config.name}</span>
                                        </Button>
                                    }
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <ScrollArea className="h-[calc(100vh-12rem)]">
                <div className="space-y-2">
                    {encounters.map((encounter) => (
                        <Card
                            key={encounter.id}
                            className="p-4 bg-slate-800 border-slate-700"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{encounterTypes[encounter.type].icon}</span>
                                    <span className="text-sm font-medium text-slate-300">
                                        {encounter.name}
                                    </span>
                                </div>
                                <button
                                    onClick={() => deleteEncounter(encounter.id)}
                                    className="text-slate-400 hover:text-red-400"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-3">
                                <div>
                                    <label className="text-xs text-slate-400">Min Level</label>
                                    <input
                                        type="number"
                                        value={encounter.minLevel}
                                        onChange={(e) =>
                                            setEncounters(
                                                encounters.map((enc) =>
                                                    enc.id === encounter.id
                                                        ? { ...enc, minLevel: parseInt(e.target.value) }
                                                        : enc
                                                )
                                            )
                                        }
                                        className="w-full px-2 py-1 text-sm bg-slate-700 border border-slate-600 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400">Max Level</label>
                                    <input
                                        type="number"
                                        value={encounter.maxLevel}
                                        onChange={(e) =>
                                            setEncounters(
                                                encounters.map((enc) =>
                                                    enc.id === encounter.id
                                                        ? { ...enc, maxLevel: parseInt(e.target.value) }
                                                        : enc
                                                )
                                            )
                                        }
                                        className="w-full px-2 py-1 text-sm bg-slate-700 border border-slate-600 rounded-md"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs text-slate-400">Pokemon</label>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => addPokemon(encounter.id)}
                                        className="h-6 w-6 p-0"
                                    >
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                </div>
                                {encounter.pokemon.map((pokemon, index) => (
                                    <div key={index} className="flex items-center gap-2 p-2 bg-slate-700 rounded">
                                        <input
                                            type="text"
                                            value={pokemon.name}
                                            onChange={(e) => updatePokemon(encounter.id, index, "name", e.target.value)}
                                            placeholder="Pokemon name"
                                            className="flex-1 px-2 py-1 text-xs bg-slate-600 border border-slate-500 rounded"
                                        />
                                        <input
                                            type="number"
                                            value={pokemon.level}
                                            onChange={(e) => updatePokemon(encounter.id, index, "level", parseInt(e.target.value))}
                                            placeholder="Level"
                                            className="w-16 px-2 py-1 text-xs bg-slate-600 border border-slate-500 rounded"
                                        />
                                        <input
                                            type="number"
                                            value={pokemon.chance}
                                            onChange={(e) => updatePokemon(encounter.id, index, "chance", parseInt(e.target.value))}
                                            placeholder="%"
                                            className="w-16 px-2 py-1 text-xs bg-slate-600 border border-slate-500 rounded"
                                        />
                                        <button
                                            onClick={() => removePokemon(encounter.id, index)}
                                            className="text-slate-400 hover:text-red-400"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
};

export default EncounterView; 