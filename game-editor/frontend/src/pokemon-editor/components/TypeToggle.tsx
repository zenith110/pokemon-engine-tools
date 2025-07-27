import { useState } from "react";

interface TypeToggleProps {
    types: string[];
    onTypeChange: (types: string[]) => void;
}

const typeColors: { [key: string]: string } = {
    Bug: "bg-green-500",
    Dark: "bg-gray-800",
    Dragon: "bg-purple-600",
    Electric: "bg-yellow-400",
    Fairy: "bg-pink-400",
    Fighting: "bg-red-600",
    Fire: "bg-orange-500",
    Flying: "bg-indigo-400",
    Ghost: "bg-purple-400",
    Grass: "bg-green-400",
    Ground: "bg-yellow-600",
    Ice: "bg-blue-200",
    Normal: "bg-gray-400",
    Poison: "bg-purple-500",
    Psychic: "bg-pink-500",
    Rock: "bg-yellow-700",
    Steel: "bg-gray-500",
    Water: "bg-blue-500"
};

const TypeToggle = ({ types, onTypeChange }: TypeToggleProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handlePrevType = () => {
        const newIndex = (currentIndex - 1 + types.length) % types.length;
        setCurrentIndex(newIndex);
    };

    const handleNextType = () => {
        const newIndex = (currentIndex + 1) % types.length;
        setCurrentIndex(newIndex);
    };

    // Only show navigation buttons if there are multiple types
    const showNavigation = types.length > 1;
    const isFirstType = currentIndex === 0;
    const isLastType = currentIndex === types.length - 1;

    return (
        <div className="flex items-center space-x-2">
            {showNavigation && (
                <button
                    onClick={handlePrevType}
                    disabled={isFirstType}
                    className={`px-3 py-1 rounded-l-lg text-white transition-colors ${
                        isFirstType 
                            ? 'bg-slate-800 cursor-not-allowed opacity-50' 
                            : 'bg-slate-600 hover:bg-slate-500'
                    }`}
                >
                    ←
                </button>
            )}
            <span className={`px-4 py-1 text-white rounded ${typeColors[types[currentIndex]] || typeColors.Normal}`}>
                {types[currentIndex] || "Normal"}
            </span>
            {showNavigation && (
                <button
                    onClick={handleNextType}
                    disabled={isLastType}
                    className={`px-3 py-1 rounded-r-lg text-white transition-colors ${
                        isLastType 
                            ? 'bg-slate-800 cursor-not-allowed opacity-50' 
                            : 'bg-slate-600 hover:bg-slate-500'
                    }`}
                >
                    →
                </button>
            )}
        </div>
    );
};

export default TypeToggle; 