import { useState, useEffect } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Trash2, Edit, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Label } from "../../components/ui/label";
import { TOMLEncounter } from "../types";
import EncounterDialog from "./EncounterDialog";
import {LoadPokemonById } from "../../../wailsjs/go/parsing/ParsingApp"
import PokemonSprite from "./PokemonSprite";
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
    const [currentPages, setCurrentPages] = useState<Record<string, number>>({
        grass: 0,
        water: 0,
        cave: 0,
        fishing: 0,
    });

    const ITEMS_PER_PAGE = 8;

    const encounterGroups: EncounterGroup[] = [
        { type: "grass", label: "Grass", encounters: grassEncounters },
        { type: "water", label: "Water", encounters: waterEncounters },
        { type: "cave", label: "Cave", encounters: caveEncounters },
        { type: "fishing", label: "Fishing", encounters: fishingEncounters },
    ];

    const getPaginatedEncounters = (encounters: TOMLEncounter[], type: string) => {
        const startIndex = currentPages[type] * ITEMS_PER_PAGE;
        return encounters.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    };

    const totalPages = (encounters: TOMLEncounter[]) => Math.ceil(encounters.length / ITEMS_PER_PAGE);

    const handlePageChange = (type: string, direction: 'prev' | 'next') => {
        const currentPage = currentPages[type];
        const maxPage = totalPages(encounterGroups.find(g => g.type === type)?.encounters || []) - 1;
        
        if (direction === 'prev' && currentPage > 0) {
            setCurrentPages(prev => ({ ...prev, [type]: currentPage - 1 }));
        } else if (direction === 'next' && currentPage < maxPage) {
            setCurrentPages(prev => ({ ...prev, [type]: currentPage + 1 }));
        }
    };

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
                                <Button variant="outline" className="ml-2 flex items-center gap-1">
                                    <Plus className="h-4 w-4" />
                                    Add Pokemon
                                </Button>
                            }
                        />
                    </div>
                    
                    {encounters.length === 0 ? (
                        <div className="text-slate-400 italic text-center py-8">No encounters yet. Click "Add Pokemon" to get started!</div>
                    ) : (
                        <div className="relative">
                            {/* Navigation Arrows */}
                            {totalPages(encounters) > 1 && (
                                <>
                                    <button
                                        onClick={() => handlePageChange(type, 'prev')}
                                        disabled={currentPages[type] === 0}
                                        className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:text-slate-600 text-slate-300 p-2 rounded-full transition-colors"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(type, 'next')}
                                        disabled={currentPages[type] >= totalPages(encounters) - 1}
                                        className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:text-slate-600 text-slate-300 p-2 rounded-full transition-colors"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </>
                            )}
                            
                            {/* Pokemon Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-8">
                                {getPaginatedEncounters(encounters, type).map((encounter, idx) => {
                                    const actualIndex = currentPages[type] * ITEMS_PER_PAGE + idx;
                                    return (
                                        <div key={`${type}-${actualIndex}`} className="relative group">
                                            <EncounterDialog
                                                encounterType={encounterTypes[type]}
                                                encounters={encounters}
                                                onSave={updated => setEncounters(type, updated)}
                                                existingEncounterIndex={actualIndex}
                                                trigger={
                                                    <div className="cursor-pointer">
                                                        <PokemonSprite 
                                                            pokemonId={encounter.ID} 
                                                            pokemonName={encounter.Name}
                                                            timeOfDay={encounter.TimeOfDayToCatch}
                                                        />
                                                    </div>
                                                }
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                            
                            {/* Page Indicator */}
                            {totalPages(encounters) > 1 && (
                                <div className="flex justify-center mt-4">
                                    <div className="flex gap-1">
                                        {Array.from({ length: totalPages(encounters) }, (_, i) => (
                                            <div
                                                key={i}
                                                className={`w-2 h-2 rounded-full transition-colors ${
                                                    i === currentPages[type] 
                                                        ? 'bg-slate-300' 
                                                        : 'bg-slate-600'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default EncounterView; 