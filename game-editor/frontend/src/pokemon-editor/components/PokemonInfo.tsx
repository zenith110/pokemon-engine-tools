import { Pokemon } from "../pokemon.model";
import TypeToggle from "./TypeToggle";

interface PokemonInfoProps {
    selectedPokemon: Pokemon | undefined;
    onTypeChange: (types: string[]) => void;
}

const PokemonInfo = ({ selectedPokemon, onTypeChange }: PokemonInfoProps) => {
    const playCry = () => {
        if (selectedPokemon?.Cry) {
            const audio = new Audio(`data:audio/wav;base64,${selectedPokemon.Cry}`);
            audio.play();
        }
    };

    return (
        <div className="flex flex-row justify-center">
            <div className="flex flex-col w-full">
                <div className="flex flex-row gap-2">
                    {selectedPokemon?.Icon && (
                        <img 
                            src={`data:image/gif;base64,${selectedPokemon.Icon}`} 
                            alt={`${selectedPokemon.Name} Icon`}
                            className="w-12 h-12 bg-slate-600 rounded-l-xl p-1"
                        />
                    )}
                    <button
                        onClick={playCry}
                        disabled={!selectedPokemon?.Cry}
                        className={`px-6 py-3 transition-colors ${
                            selectedPokemon?.Cry 
                            ? 'bg-slate-600 hover:bg-slate-500' 
                            : 'bg-slate-600 cursor-not-allowed opacity-50'
                        }`}
                        title={selectedPokemon?.Cry ? "Play Cry" : "No cry available"}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                        </svg>
                    </button>  
                    <div className="flex-grow flex flex-col bg-slate-600 rounded-r-xl">
                        <p className="px-6 py-1 text-center font-medium">
                            {selectedPokemon?.Types && selectedPokemon.Types.length > 1 ? 'Types' : 'Type'}
                        </p>
                        <div className="flex items-center justify-center py-1">
                            <TypeToggle 
                                types={selectedPokemon?.Types || ["Normal"]} 
                                onTypeChange={onTypeChange}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PokemonInfo; 