import { useState } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Trash2, Edit } from "lucide-react";
import { Label } from "../../components/ui/label";
import { TOMLEncounter } from "../types";
import EncounterDialog from "./EncounterDialog";

interface EncounterViewProps {
    grassEncounters: TOMLEncounter[];
    waterEncounters: TOMLEncounter[];
    caveEncounters: TOMLEncounter[];
    fishingEncounters: TOMLEncounter[];
    setEncounters: (type: string, encounters: TOMLEncounter[]) => void;
}

const encounterTypes = {
    grass: { name: "Grass", icon: "🌱", color: "bg-green-500" },
    water: { name: "Water", icon: "💧", color: "bg-blue-500" },
    cave: { name: "Cave", icon: "🕳️", color: "bg-gray-500" },
    fishing: { name: "Fishing", icon: "🎣", color: "bg-sky-500" },
} as const;

type EncounterType = keyof typeof encounterTypes;

type EncounterGroup = {
    type: EncounterType;
    label: string;
    encounters: TOMLEncounter[];
};

const EncounterView = ({
    grassEncounters,
    waterEncounters,
    caveEncounters,
    fishingEncounters,
    setEncounters,
}: EncounterViewProps) => {
    const encounterGroups: EncounterGroup[] = [
        { type: "grass", label: "Grass", encounters: grassEncounters },
        { type: "water", label: "Water", encounters: waterEncounters },
        { type: "cave", label: "Cave", encounters: caveEncounters },
        { type: "fishing", label: "Fishing", encounters: fishingEncounters },
    ];

    return (
        <div className="space-y-8">
            {encounterGroups.map(({ type, label, encounters }) => (
                <div key={type} className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`text-lg ${encounterTypes[type].color}`}>{encounterTypes[type].icon}</span>
                        <Label className="text-white text-lg font-semibold">{label} Encounters</Label>
                        <EncounterDialog
                            encounterType={encounterTypes[type]}
                            encounters={encounters}
                            onSave={updated => setEncounters(type, updated)}
                            trigger={
                                <Button variant="outline" className="ml-2">+ Add</Button>
                            }
                        />
                    </div>
                    <ScrollArea className="max-h-72">
                        <div className="space-y-2">
                            {encounters.length === 0 && (
                                <div className="text-slate-400 italic">No encounters.</div>
                            )}
                            {encounters.map((encounter, idx) => (
                                <Card key={encounter.id || idx} className="p-4 bg-slate-800 border-slate-700 flex items-center justify-between">
                                    <div>
                                        <div className="font-medium text-slate-200">{encounter.name}</div>
                                        <div className="text-xs text-slate-400">Lv. {encounter.minLevel} - {encounter.maxLevel} | Rarity: {encounter.rarity}% | Shiny: {encounter.shiny ? "Yes" : "No"}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <EncounterDialog
                                            encounterType={encounterTypes[type]}
                                            encounters={encounters}
                                            onSave={updated => setEncounters(type, updated)}
                                            existingEncounterIndex={idx}
                                            trigger={
                                                <button className="text-slate-400 hover:text-blue-400">
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                            }
                                        />
                                        <button
                                            onClick={() => {
                                                const updated = encounters.slice();
                                                updated.splice(idx, 1);
                                                setEncounters(type, updated);
                                            }}
                                            className="text-slate-400 hover:text-red-400"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            ))}
        </div>
    );
};

export default EncounterView; 