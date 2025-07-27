import { useState, useEffect } from "react"
import { ParsePokemonData, ParseHeldItems, ParseTrainerClass, GrabTrainerSprites, LoadPokemonById} from "../../../../bindings/github.com/zenith110/pokemon-engine-tools/parsing/ParsingApp"
import TrainerPokemonsGenerator from "./TrainerPokemonsGenerator"
import TrainerClasses from "./TrainerClasses";
import TrainerSprites from "./TrainerSprites";
import { useNavigate } from "react-router-dom";
import { models } from "../../../../bindings/github.com/zenith110/pokemon-engine-tools/models";

interface DictData {
    name: string;
    classType: string;
    pokemons: any[];
    sprite?: string;
}

const NewTrainerCard = () => {
    const navigate = useNavigate();
    const [classTypes, setClassTypes] = useState<models.Data[]>([])
    const [pokemonSpecies, setPokemonSpecies] = useState<models.PokemonTrainerEditor[]>([])
    const [pokemonNames, setPokemonNames] = useState<{ ID: string; Name: string }[]>([])
    const [pokemonCount, setPokemonCount] = useState<number>(0)
    const [heldItemsList, setHeldItemList] = useState<models.HeldItem[]>([])
    const [trainerSprites, setTrainerSprites] = useState<models.TrainerSprite[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [dictData, setDictData] = useState<DictData>({
        name: "",
        classType: "",
        pokemons: []
    })

    const handlePokemonSelect = async (pokemonId: string) => {
        const fullPokemonData = await LoadPokemonById(pokemonId);
        setPokemonSpecies(prev => {
            const newSpecies = [...prev];
            const index = newSpecies.findIndex(p => p.ID === pokemonId);
            if (index !== -1) {
                newSpecies[index] = fullPokemonData;
            }
            return newSpecies;
        });
    };

    useEffect(() => { 
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [classData, pokemonData, heldItemsData, spritesData] = await Promise.all([
                    ParseTrainerClass(),
                    ParsePokemonData(),
                    ParseHeldItems(),
                    GrabTrainerSprites()
                ]);

                setClassTypes(classData.Data);
                setPokemonNames(pokemonData);
                setHeldItemList(heldItemsData);
                setTrainerSprites(spritesData);

                // Load first Pokemon's full data
                if (pokemonData.length > 0) {
                    const firstPokemon = await LoadPokemonById(pokemonData[0].ID);
                    setPokemonSpecies([firstPokemon]);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col grow h-[91.5vh] w-screen bg-slate-800 p-4 gap-4 relative">
                <div className="absolute inset-0 bg-slate-800/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 border-4 border-tealBlue border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-white text-lg font-medium">Loading Trainer Data...</p>
                        <p className="text-gray-400 text-sm">Please wait while we fetch the latest data</p>
                    </div>
                </div>
                {/* Keep the layout structure to prevent layout shift */}
                <div className="flex flex-row h-5/6 gap-4">
                    <div className="flex flex-col w-5/12 gap-4 bg-slate-700 rounded-xl p-4">
                        <div className="rounded-xl grid grid-rows-2 grid-cols-2 grow bg-slate-600 items-stretch">
                            <div className="p-2"></div>
                            <div className="p-2"></div>
                            <div className="p-2"></div>
                            <div className="p-2"></div>
                        </div>
                        <div className="flex flex-row justify-around gap-4 py-2">
                            <div className="grow h-10 bg-slate-600 rounded-xl"></div>
                            <div className="w-32 h-10 bg-slate-600 rounded-xl"></div>
                        </div>
                    </div>
                    <div className="flex flex-col w-7/12 gap-4">
                        <div className="bg-slate-700 rounded-xl p-6 h-full"></div>
                    </div>
                </div>
            </div>
        );
    }
    
    return(
        <div className="flex flex-col items-center min-h-screen bg-slate-800 p-6">
            <div className="w-full max-w-3xl bg-slate-700 rounded-2xl shadow-lg p-6">
                <div className="flex flex-col items-center space-y-6">
                    <h1 className="text-2xl font-bold text-white mb-4">New Trainer</h1>
                    
                    {/* Trainer Info Section */}
                    <div className="w-full space-y-4">
                        <div className="flex flex-col space-y-2">
                            <label className="text-white text-sm">Trainer name</label>
                            <input 
                                type="text" 
                                onChange={(event) => setDictData(dictData => ({...dictData, name: event.target.value}))}
                                className="px-3 py-1 rounded-lg bg-white text-slate-800 w-full"
                                placeholder="Enter trainer name"
                            />
                        </div>

                        <div className="flex flex-col space-y-2">
                            <label className="text-white text-sm">Trainer sprite</label>
                            <TrainerSprites trainerSprites={trainerSprites} dictData={dictData} setDictData={setDictData}/>
                        </div>

                        <div className="flex flex-col space-y-2">
                            <label className="text-white text-sm">Trainer class</label>
                            <TrainerClasses trainerClasses={classTypes} dictData={dictData} setDictData={setDictData}/>
                        </div>

                        <div className="flex flex-col space-y-2">
                            <label className="text-white text-sm">Number of Pokemon (1-6)</label>
                            <input 
                                type="number" 
                                min="1" 
                                max="6" 
                                onChange={(event) => setPokemonCount(Number(event.target.value))}
                                className="px-3 py-1 rounded-lg bg-white text-slate-800 w-full"
                                placeholder="Enter number of Pokemon"
                            />
                        </div>
                    </div>

                    {/* Pokemon Section */}
                    {pokemonSpecies.length >= 1 && heldItemsList.length >= 1 && (
                        <div className="w-full bg-slate-800 rounded-xl p-4">
                            <h2 className="text-white text-lg font-semibold mb-4 text-center">Pokemon Team</h2>
                            <TrainerPokemonsGenerator 
                                pokemonSpeciesList={pokemonSpecies} 
                                heldItemsList={heldItemsList} 
                                pokemonsCount={pokemonCount} 
                                dictData={dictData} 
                                setDictData={setDictData}
                            />
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-center space-x-4 w-full">
                        <button 
                            onClick={() => navigate(-1)}
                            className="px-6 py-2 bg-slate-600 text-white rounded-xl hover:bg-slate-500 transition-colors duration-200"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NewTrainerCard