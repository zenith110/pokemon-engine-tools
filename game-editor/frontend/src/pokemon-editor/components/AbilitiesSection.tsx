import { Pokemon } from "../pokemon.model";

interface AbilitiesSectionProps {
    selectedPokemon: Pokemon | undefined;
    currentAbilityIndex: number;
    onPrevAbility: () => void;
    onNextAbility: () => void;
}

const AbilitiesSection = ({ 
    selectedPokemon, 
    currentAbilityIndex, 
    onPrevAbility, 
    onNextAbility 
}: AbilitiesSectionProps) => {
    const abilities = selectedPokemon?.Abilities
        .filter(ability => !ability.IsHidden)
        .map(ability => ability.Name) as string[] || [];

    const hiddenAbility = selectedPokemon?.Abilities
        .find(ability => ability.IsHidden)
        ?.Name;

    const getCurrentAbility = () => {
        if (!selectedPokemon) return { title: "Select a Pokemon", ability: "None", subtitle: "" };
        
        if (currentAbilityIndex === 0) {
            return {
                title: "Ability 1",
                ability: abilities[0] || "None",
                subtitle: abilities.length > 1 ? "Has second ability" : hiddenAbility ? "Has hidden ability" : "No other abilities"
            };
        } else if (currentAbilityIndex === 1 && abilities.length > 1) {
            return {
                title: "Ability 2",
                ability: abilities[1],
                subtitle: hiddenAbility ? "Has hidden ability" : "No other abilities"
            };
        } else if ((currentAbilityIndex === 1 && !abilities[1]) || currentAbilityIndex === 2) {
            return {
                title: "Hidden Ability",
                ability: hiddenAbility || "None",
                subtitle: "No other abilities"
            };
        }
        return { title: "No Abilities", ability: "None", subtitle: "" };
    };

    const currentAbility = getCurrentAbility();
    const maxIndex = abilities.length + (hiddenAbility ? 1 : 0) - 1;

    return (
        <div className="flex flex-col bg-slate-700 rounded-xl p-2">
            <div className="flex flex-col items-center h-full">
                <h3 className="text-lg font-medium mb-2">Abilities</h3>
                <div className="flex flex-row items-center justify-center gap-4 w-full flex-grow">
                    <button 
                        onClick={onPrevAbility}
                        disabled={!selectedPokemon || currentAbilityIndex === 0}
                        className={`p-2 rounded-xl transition-colors duration-200 ${
                            !selectedPokemon || currentAbilityIndex === 0
                            ? 'bg-slate-600 cursor-not-allowed opacity-50' 
                            : 'bg-slate-600 hover:bg-slate-500'
                        }`}
                        title="Previous Ability"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <div className="flex flex-col items-center flex-grow">
                        <div className="bg-slate-600 w-full rounded-t-xl py-1 px-4 text-center font-medium">
                            {currentAbility.title}
                        </div>
                        <div className="bg-slate-900 w-full py-2 px-4 text-center">
                            {currentAbility.ability}
                        </div>
                        <div className="bg-slate-600 w-full rounded-b-xl py-1 px-4 text-center text-xs text-gray-300">
                            {currentAbility.subtitle}
                        </div>
                    </div>

                    <button 
                        onClick={onNextAbility}
                        disabled={!selectedPokemon || currentAbilityIndex >= maxIndex}
                        className={`p-2 rounded-xl transition-colors duration-200 ${
                            !selectedPokemon || currentAbilityIndex >= maxIndex
                            ? 'bg-slate-600 cursor-not-allowed opacity-50' 
                            : 'bg-slate-600 hover:bg-slate-500'
                        }`}
                        title="Next Ability"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AbilitiesSection; 