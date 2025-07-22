import { useState } from "react";
import { Pokemon } from "../pokemon.model";

export const useEvolutionManagement = (selectedPokemon: Pokemon | undefined) => {
    const [currentEvoIndex, setCurrentEvoIndex] = useState<number>(0);
    const [isEvolutionDialogOpen, setIsEvolutionDialogOpen] = useState<boolean>(false);
    const [editingEvolutionIndex, setEditingEvolutionIndex] = useState<number | undefined>(undefined);

    const handleEvolutionUpdate = (evolutions: Pokemon['Evolutions']) => {
        // This will be handled by the parent component
        return evolutions;
    };

    const handleAddEvolution = () => {
        setEditingEvolutionIndex(undefined);
        setIsEvolutionDialogOpen(true);
    };

    const handleEditEvolution = (index: number) => {
        setEditingEvolutionIndex(index);
        setIsEvolutionDialogOpen(true);
    };


    return {
        currentEvoIndex,
        setCurrentEvoIndex,
        isEvolutionDialogOpen,
        setIsEvolutionDialogOpen,
        editingEvolutionIndex,
        setEditingEvolutionIndex,
        handleEvolutionUpdate,
        handleAddEvolution,
        handleEditEvolution,
    };
}; 