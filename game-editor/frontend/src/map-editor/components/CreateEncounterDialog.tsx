import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { MapEncounter } from "../types";

interface PokemonConfig {
    name: string;
    minLevel: number;
    maxLevel: number;
    chance: number;
}

interface CreateEncounterDialogProps {
    encounterType: {
        name: string;
        icon: string;
        color: string;
    };
    pokemonList: Array<{ Name: string; ID: string }>;
    onEncounterCreate: (encounter: MapEncounter) => void;
    trigger: React.ReactNode;
}

const DEFAULT_POKEMON_COUNT = 3;
const MIN_POKEMON = 1;
const MAX_POKEMON = 6;

const CreateEncounterDialog = ({
    encounterType,
    pokemonList,
    onEncounterCreate,
    trigger
}: CreateEncounterDialogProps) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [pokemonCount, setPokemonCount] = useState(DEFAULT_POKEMON_COUNT);
    const [pokemonData, setPokemonData] = useState<PokemonConfig[]>([]);

    const initializePokemonData = (count: number) => {
        setPokemonData(Array.from({ length: count }, (_, index) => ({
            name: "Pikachu",
            minLevel: 5 + index,
            maxLevel: 10 + index,
            chance: Math.floor(100 / count)
        })));
    };

    const handleOpen = () => {
        setDialogOpen(true);
        setPokemonCount(DEFAULT_POKEMON_COUNT);
        initializePokemonData(DEFAULT_POKEMON_COUNT);
    };

    const handleClose = () => {
        setDialogOpen(false);
        setPokemonData([]);
    };

    const handleCreate = () => {
        const newEncounter: MapEncounter = {
            id: Math.random().toString(36).substr(2, 9),
            name: `${encounterType.name} Encounter`,
            type: encounterType.name.toLowerCase() as "grass" | "water" | "cave" | "fishing",
            pokemon: pokemonData.length > 0 ? pokemonData.map(p => ({
                name: p.name,
                level: p.minLevel, // Use minLevel as the level for now
                chance: p.chance
            })) : [{
                name: "Pikachu",
                level: 5,
                chance: 100
            }],
            minLevel: 5,
            maxLevel: 10,
        };
        onEncounterCreate(newEncounter);
        handleClose();
    };

    const updatePokemonData = (index: number, field: keyof PokemonConfig, value: string | number) => {
        const newData = [...pokemonData];
        newData[index] = { ...newData[index], [field]: value };
        setPokemonData(newData);
    };

    // When pokemonCount changes, adjust the pokemonData array
    const handlePokemonCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let count = parseInt(e.target.value) || MIN_POKEMON;
        if (count < MIN_POKEMON) count = MIN_POKEMON;
        if (count > MAX_POKEMON) count = MAX_POKEMON;
        setPokemonCount(count);
        setPokemonData(prev => {
            if (count > prev.length) {
                // Add new slots
                return [
                    ...prev,
                    ...Array.from({ length: count - prev.length }, (_, i) => ({
                        name: "Pikachu",
                        minLevel: 5 + prev.length + i,
                        maxLevel: 10 + prev.length + i,
                        chance: Math.floor(100 / count)
                    }))
                ];
            } else {
                // Remove extra slots
                return prev.slice(0, count);
            }
        });
    };

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <div onClick={handleOpen}>
                    {trigger}
                </div>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800">
                <DialogHeader>
                    <DialogTitle className="text-white">Create {encounterType.name} Encounter</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Label className="text-white text-sm">Number of Pokémon</Label>
                        <Input
                            type="number"
                            min={MIN_POKEMON}
                            max={MAX_POKEMON}
                            value={pokemonCount}
                            onChange={handlePokemonCountChange}
                            className="w-20 px-2 py-1 text-sm bg-slate-700 border border-slate-600 rounded-md"
                        />
                    </div>
                    <div className="space-y-3">
                        <Label className="text-white">Pokemon Configuration</Label>
                        {Array.from({ length: pokemonCount }, (_, index) => (
                            <div key={index} className="space-y-2 p-3 bg-slate-800 rounded border border-slate-700">
                                <div className="space-y-2">
                                    <Label className="text-white text-sm">Pokemon {index + 1}</Label>
                                    <select
                                        value={pokemonData[index]?.name || "Pikachu"}
                                        onChange={(e) => updatePokemonData(index, "name", e.target.value)}
                                        className="w-full px-2 py-1 text-sm bg-slate-700 border border-slate-600 rounded-md"
                                    >
                                        {pokemonList.map(pokemon => (
                                            <option key={pokemon.ID} value={pokemon.Name}>{pokemon.Name}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <Label className="text-white text-xs">Min Level</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={pokemonData[index]?.minLevel || 5}
                                            onChange={(e) => updatePokemonData(index, "minLevel", parseInt(e.target.value) || 5)}
                                            className="px-2 py-1 text-sm bg-slate-700 border border-slate-600 rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-white text-xs">Max Level</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={pokemonData[index]?.maxLevel || 10}
                                            onChange={(e) => updatePokemonData(index, "maxLevel", parseInt(e.target.value) || 10)}
                                            className="px-2 py-1 text-sm bg-slate-700 border border-slate-600 rounded-md"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <Label className="text-white text-xs">Rarity (%)</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={pokemonData[index]?.chance || Math.floor(100 / pokemonCount)}
                                        onChange={(e) => updatePokemonData(index, "chance", parseInt(e.target.value) || 10)}
                                        className="px-2 py-1 text-sm bg-slate-700 border border-slate-600 rounded-md"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            variant="ghost"
                            onClick={handleClose}
                            className="text-slate-400 hover:text-slate-300"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreate}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Create {encounterType.name} Encounter
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CreateEncounterDialog; 