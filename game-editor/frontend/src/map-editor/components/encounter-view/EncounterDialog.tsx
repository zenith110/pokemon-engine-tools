import { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { TOMLEncounter } from "../../types";
import { ParsePokemonData, LoadPokemonById } from "../../../../bindings/github.com/zenith110/pokemon-engine-tools/parsing/ParsingApp";
interface EncounterDialogProps {
    encounterType: {
        name: string;
        icon: string;
        color: string;
    };
    encounters: TOMLEncounter[];
    onSave: (encounters: TOMLEncounter[]) => void;
    trigger: React.ReactNode;
    existingEncounterIndex?: number | null; // index in the array if editing
}


const defaultEncounter = (): TOMLEncounter => ({
    Name: "Pikachu",
    ID: "",
    MinLevel: 5,
    MaxLevel: 10,
    Rarity: 100,
    Shiny: false,
    TimeOfDayToCatch: "Morning",
    HighestRod: "Old Rod",
});

const EncounterDialog = ({
    encounterType,
    encounters,
    onSave,
    trigger,
    existingEncounterIndex = null
}: EncounterDialogProps) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [encounterData, setEncounterData] = useState<TOMLEncounter>(defaultEncounter());
    const [pokemonList, setPokemonList] = useState<{ ID: string; Name: string }[]>([]);
    const [selectedPokemonId, setSelectedPokemonId] = useState<string>("");

    useEffect(() => {
        const loadPokemonList = async () => {
            try {
                const pokemonData = await ParsePokemonData();
                setPokemonList(pokemonData);
            } catch (error) {
                console.error('Error loading Pokemon list:', error);
            }
        };
        loadPokemonList();
    }, []);

    const handlePokemonSelect = async (pokemonId: string) => {
        setSelectedPokemonId(pokemonId);
        try {
            const pokemon = await LoadPokemonById(pokemonId);
            setEncounterData(prev => ({
                ...prev,
                Name: pokemon.Name,
                ID: pokemon.ID
            }));
        } catch (error) {
            console.error('Error loading Pokemon data:', error);
        }
    };

    const handleOpen = () => {
        setDialogOpen(true);
        if (existingEncounterIndex !== null && encounters[existingEncounterIndex]) {
            const existingEncounter = encounters[existingEncounterIndex];
            setEncounterData(existingEncounter);
            setSelectedPokemonId(existingEncounter.ID);
        } else {
            setEncounterData(defaultEncounter());
            setSelectedPokemonId("");
        }
    };

    const handleClose = () => {
        setDialogOpen(false);
        setEncounterData(defaultEncounter());
        setSelectedPokemonId("");
    };

    const handleSave = () => {
        // Don't save if no Pokemon is selected
        if (!selectedPokemonId || !encounterData.ID) {
            console.warn('Cannot save: No Pokemon selected');
            return;
        }
        
        let updatedEncounters = [...encounters];
        if (existingEncounterIndex !== null && updatedEncounters[existingEncounterIndex]) {
            updatedEncounters[existingEncounterIndex] = encounterData;
        } else {
            updatedEncounters.push(encounterData);
        }
        
        onSave(updatedEncounters);
        setDialogOpen(false);
        setEncounterData(defaultEncounter());
        setSelectedPokemonId("");
    };

    const updateField = (field: keyof TOMLEncounter, value: string | number | boolean) => {
        setEncounterData(prev => ({ ...prev, [field]: value }));
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
                    <DialogTitle className="text-white">
                        {existingEncounterIndex !== null ? "Edit" : "Create"} {encounterType.name} Encounter
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-white text-sm">Select Pokémon</Label>
                        <select
                            value={selectedPokemonId}
                            onChange={(e) => handlePokemonSelect(e.target.value)}
                            className="w-full px-2 py-1 text-sm bg-slate-700 border border-slate-600 rounded-md text-white"
                        >
                            <option value="">Choose a Pokémon...</option>
                            {pokemonList.map((pokemon, index) => (
                                <option key={`${pokemon.ID}-${index}`} value={pokemon.ID}>
                                    {pokemon.Name}
                                </option>
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
                                value={encounterData.MinLevel}
                                onChange={e => updateField("MinLevel", parseInt(e.target.value) || 1)}
                                className="px-2 py-1 text-sm bg-slate-700 border border-slate-600 rounded-md"
                            />
                        </div>
                        <div>
                            <Label className="text-white text-xs">Max Level</Label>
                            <Input
                                type="number"
                                min="1"
                                max="100"
                                value={encounterData.MaxLevel}
                                onChange={e => updateField("MaxLevel", parseInt(e.target.value) || 1)}
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
                            value={encounterData.Rarity}
                            onChange={e => updateField("Rarity", parseInt(e.target.value) || 1)}
                            className="px-2 py-1 text-sm bg-slate-700 border border-slate-600 rounded-md"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Label className="text-white text-xs">Shiny?</Label>
                        <input
                            type="checkbox"
                            checked={encounterData.Shiny}
                            onChange={e => updateField("Shiny", e.target.checked)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-white text-xs">Time of Day to Catch</Label>
                        <select
                            value={encounterData.TimeOfDayToCatch || "Morning"}
                            onChange={(e) => updateField("TimeOfDayToCatch", e.target.value as "Morning" | "Afternoon" | "Night")}
                            className="w-full px-2 py-1 text-sm bg-slate-700 border border-slate-600 rounded-md text-white"
                        >
                            <option value="Morning">Morning</option>
                            <option value="Afternoon">Afternoon</option>
                            <option value="Night">Night</option>
                        </select>
                    </div>
                    {encounterType.name === "Fishing" && (
                        <div className="space-y-2">
                            <Label className="text-white text-xs">Highest Rod Required</Label>
                            <select
                                value={encounterData.HighestRod || "Old Rod"}
                                onChange={(e) => updateField("HighestRod", e.target.value as "Old Rod" | "Normal Rod" | "Super Rod")}
                                className="w-full px-2 py-1 text-sm bg-slate-700 border border-slate-600 rounded-md text-white"
                            >
                                <option value="Old Rod">Old Rod</option>
                                <option value="Normal Rod">Normal Rod</option>
                                <option value="Super Rod">Super Rod</option>
                            </select>
                        </div>
                    )}
                    <div className="flex justify-between items-center pt-4">
                        {existingEncounterIndex !== null && (
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    const updatedEncounters = encounters.filter((_, index) => index !== existingEncounterIndex);
                                    onSave(updatedEncounters);
                                    handleClose();
                                }}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Delete Encounter
                            </Button>
                        )}
                        <div className="flex gap-2 ml-auto">
                            <Button
                                variant="ghost"
                                onClick={handleClose}
                                className="text-slate-400 hover:text-slate-300"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {existingEncounterIndex !== null ? "Update" : "Create"} {encounterType.name} Encounter
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EncounterDialog; 