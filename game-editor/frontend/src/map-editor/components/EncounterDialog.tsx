import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { TOMLEncounter } from "../types";

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

const DEFAULT_POKEMON_COUNT = 3;
const MIN_POKEMON = 1;
const MAX_POKEMON = 6;

const defaultEncounter = (): TOMLEncounter => ({
    name: "Pikachu",
    id: "",
    minLevel: 5,
    maxLevel: 10,
    rarity: 100,
    shiny: false,
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

    const handleOpen = () => {
        setDialogOpen(true);
        if (existingEncounterIndex !== null && encounters[existingEncounterIndex]) {
            setEncounterData(encounters[existingEncounterIndex]);
        } else {
            setEncounterData(defaultEncounter());
        }
    };

    const handleClose = () => {
        setDialogOpen(false);
        setEncounterData(defaultEncounter());
    };

    const handleSave = () => {
        let updatedEncounters = [...encounters];
        if (existingEncounterIndex !== null && updatedEncounters[existingEncounterIndex]) {
            updatedEncounters[existingEncounterIndex] = encounterData;
        } else {
            updatedEncounters.push(encounterData);
        }
        onSave(updatedEncounters);
        handleClose();
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
                        <Label className="text-white text-sm">Pokémon Name</Label>
                        <Input
                            type="text"
                            value={encounterData.name}
                            onChange={e => updateField("name", e.target.value)}
                            className="w-full px-2 py-1 text-sm bg-slate-700 border border-slate-600 rounded-md"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label className="text-white text-xs">Min Level</Label>
                            <Input
                                type="number"
                                min="1"
                                max="100"
                                value={encounterData.minLevel}
                                onChange={e => updateField("minLevel", parseInt(e.target.value) || 1)}
                                className="px-2 py-1 text-sm bg-slate-700 border border-slate-600 rounded-md"
                            />
                        </div>
                        <div>
                            <Label className="text-white text-xs">Max Level</Label>
                            <Input
                                type="number"
                                min="1"
                                max="100"
                                value={encounterData.maxLevel}
                                onChange={e => updateField("maxLevel", parseInt(e.target.value) || 1)}
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
                            value={encounterData.rarity}
                            onChange={e => updateField("rarity", parseInt(e.target.value) || 1)}
                            className="px-2 py-1 text-sm bg-slate-700 border border-slate-600 rounded-md"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Label className="text-white text-xs">Shiny?</Label>
                        <input
                            type="checkbox"
                            checked={encounterData.shiny}
                            onChange={e => updateField("shiny", e.target.checked)}
                        />
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
                            onClick={handleSave}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {existingEncounterIndex !== null ? "Update" : "Create"} {encounterType.name} Encounter
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EncounterDialog; 