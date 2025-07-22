import { Pokemon } from "../pokemon.model";

interface MovesSectionProps {
    selectedPokemon: Pokemon | undefined;
}

const MovesSection = ({ selectedPokemon }: MovesSectionProps) => {
    const levelUpMoves = selectedPokemon?.Moves
        .filter(move => move.Method === "level-up")
        .sort((a, b) => a.Level - b.Level) || [];

    const tutorEggMoves = selectedPokemon?.Moves
        .filter(move => move.Method === "tutor" || move.Method === "egg") || [];

    const tmHmMoves = selectedPokemon?.Moves
        .filter(move => move.Method === "machine") || [];

    return (
        <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col">
                <h4 className="bg-slate-600 rounded-t-xl py-1 px-4 text-center font-medium">Level-Up Moves</h4>
                <div className="h-[15vh] overflow-auto overscroll-none bg-slate-700 p-2">
                    {levelUpMoves.length > 0 ? 
                        levelUpMoves.map((move, index) => (
                            <p className="hover:bg-slate-600 rounded px-2 py-1 transition-colors" key={index}>
                                {move.Name} - level: {move.Level}
                            </p>
                        ))
                        : <p className="text-gray-400 text-center py-2">No Moves</p>
                    } 
                </div>
                <button onClick={() => {console.log("Add Later")}} 
                        className="bg-slate-600 rounded-b-xl py-1 hover:bg-slate-500 transition-colors">
                    Edit
                </button>
            </div>
            <div className="flex flex-col">
                <h4 className="bg-slate-600 rounded-t-xl py-1 px-4 text-center font-medium">Tutor/Egg Moves</h4>
                <div className="h-[15vh] overflow-auto overscroll-none bg-slate-700 p-2">
                    {tutorEggMoves.length > 0 ? 
                        tutorEggMoves.map((move, index) => (
                            <p className="hover:bg-slate-600 rounded px-2 py-1 transition-colors" key={index}>
                                {move.Name}
                            </p>
                        ))
                        : <p className="text-gray-400 text-center py-2">No Moves</p>
                    } 
                </div>
                <button onClick={() => {console.log("Add Later")}} 
                        className="bg-slate-600 rounded-b-xl py-1 hover:bg-slate-500 transition-colors">
                    Edit
                </button>
            </div>
            <div className="flex flex-col">
                <h4 className="bg-slate-600 rounded-t-xl py-1 px-4 text-center font-medium">TM/HM Moves</h4>
                <div className="h-[15vh] overflow-auto overscroll-none bg-slate-700 p-2">
                    {tmHmMoves.length > 0 ? 
                        tmHmMoves.map((move, index) => (
                            <p className="hover:bg-slate-600 rounded px-2 py-1 transition-colors" key={index}>
                                {move.Name}
                            </p>
                        ))
                        : <p className="text-gray-400 text-center py-2">No Moves</p>
                    } 
                </div>
                <button onClick={() => {console.log("Add Later")}} 
                        className="bg-slate-600 rounded-b-xl py-1 hover:bg-slate-500 transition-colors">
                    Edit
                </button>
            </div>
        </div>
    );
};

export default MovesSection; 