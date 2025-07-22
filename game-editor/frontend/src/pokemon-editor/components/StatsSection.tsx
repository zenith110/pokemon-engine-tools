import { Pokemon } from "../pokemon.model";

interface StatsSectionProps {
    selectedPokemon: Pokemon | undefined;
    onStatChange: (stat: string, value: number) => void;
}

const StatsSection = ({ selectedPokemon, onStatChange }: StatsSectionProps) => {
    const regex: RegExp = /^[0-9\b]{0,3}$/;

    const handleStatInput = (stat: string, value: string) => {
        if (value === '' || regex.test(value)) {
            const numValue = parseInt(value);
            if (numValue <= 255 && numValue >= 5) {
                onStatChange(stat, numValue);
            } else if (numValue > 255) {
                onStatChange(stat, 255);
            } else if (numValue < 5) {
                onStatChange(stat, 5);
            }
        }
    };

    const stats = [
        { key: 'HP', label: 'HP', value: selectedPokemon?.HP || 0 },
        { key: 'Attack', label: 'Attack', value: selectedPokemon?.Attack || 0 },
        { key: 'Defense', label: 'Defense', value: selectedPokemon?.Defense || 0 },
        { key: 'SpecialAttack', label: 'Sp. Atk', value: selectedPokemon?.SpecialAttack || 0 },
        { key: 'SpecialDefense', label: 'Sp. Def', value: selectedPokemon?.SpecialDefense || 0 },
        { key: 'Speed', label: 'Speed', value: selectedPokemon?.Speed || 0 }
    ];

    return (
        <div className="grow bg-slate-700 rounded-xl">
            <div className="grid grid-cols-6 bg-slate-600 rounded-t-xl text-center py-2 font-medium">
                {stats.map(stat => (
                    <h3 key={stat.key}>{stat.label}</h3>
                ))}
            </div>
            <div className="grid grid-cols-6 rounded-b-xl py-4">
                {stats.map(stat => (
                    <input
                        key={stat.key}
                        value={stat.value}
                        type="number"
                        className="bg-slate-700 text-center focus:outline-none"
                        onChange={(e) => handleStatInput(stat.key, e.target.value)}
                        max={255}
                        min={5}
                    />
                ))}
            </div>
        </div>
    );
};

export default StatsSection; 