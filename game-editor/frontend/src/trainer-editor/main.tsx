import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { models } from "../../wailsjs/go/models";

import { ParseTrainers, ParseTrainerClass, ParsePokemonData, ParseHeldItems} from "../../wailsjs/go/parsing/ParsingApp";
import Trainer from "./functionality/existingtrainers/Trainer";
//\import { Trainer } from "./trainer.models";

export default function TrainerEditor():React.ReactElement {
    const [trainers, setTrainers] = useState<models.TrainerJson[] | null>([]);
    const [selectedTrainer, setSelectedTrainer] = useState<models.TrainerJson | null>(null);
    const [selectValue, setSelectValue] = useState<{ value: string; label: string } | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [classTypes, setClassTypes] = useState<models.Data[]>([]);
    const [heldItems, setHeldItems] = useState<models.HeldItem[]>([]);
    const [pokemonSpecies, setPokemonSpecies] = useState<models.PokemonTrainerEditor[]>([]);
    const navigate = useNavigate();
    
    useEffect(() => {
        const fetchTrainerData = async () => {
            setIsLoading(true);
            try {
                let data = await ParseTrainers();
                if (data) {
                    setTrainers(data);

                    // Load last selected trainer from localStorage
                    const lastSelectedId = localStorage.getItem('lastSelectedTrainerId');
                    if (lastSelectedId) {
                        const lastSelected = data.find(trainer => trainer.id === lastSelectedId);
                        if (lastSelected) {
                            setSelectedTrainer(lastSelected);
                            setSelectValue({ value: lastSelected.id, label: lastSelected.name });
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching trainer data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        const fetchClassTypes = async() => {
            let data = await ParseTrainerClass()
            setClassTypes(data.Data)
        }
        const fetchPokemonSpecies = async() => {
            let data = await ParsePokemonData()
            setPokemonSpecies(data)
        }
        const heldItems = async() => {
            let data = await ParseHeldItems()
            setHeldItems(data)
        }
        fetchPokemonSpecies();
        fetchTrainerData();
        fetchClassTypes();
        heldItems();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col grow h-[91.5vh] w-screen bg-slate-800 p-4 gap-4 relative">
                <div className="absolute inset-0 bg-slate-800/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 border-4 border-tealBlue border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-white text-lg font-medium">Loading Trainer Data...</p>
                        <p className="text-gray-400 text-sm">Please wait while we fetch the latest data from your trainer.toml</p>
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
                    <h1 className="text-2xl font-bold text-white mb-4">Trainer Editor</h1>
                    
                    <div className="w-full max-w-md">
                        <Select 
                            name="trainers"
                            options={trainers?.map(trainer => ({ 
                                value: trainer.id, 
                                label: `${trainer.name}`
                            }))} 
                            onChange={(e) => {
                                const trainerData = trainers.find((trainer) => trainer.id === e?.value);
                                setSelectedTrainer(trainerData);
                            }}
                            isClearable={false}
                            isDisabled={false}
                            isLoading={false}
                            isRtl={false}
                            isSearchable={true}
                            isMulti={false}
                            placeholder="Select a trainer..."
                            className="text-sm"
                            classNames={{
                                control: () => "rounded-xl bg-slate-800 border-none hover:border-none",
                                option: (state) => `bg-slate-800 ${state.isFocused ? 'bg-slate-700' : ''} hover:bg-slate-700`,
                                menu: () => "bg-slate-800 border border-slate-700",
                                menuList: () => "bg-slate-800",
                                singleValue: () => "text-slate-900",
                                input: () => "text-slate-900 !text-slate-900",
                                placeholder: () => "text-gray-400"
                            }}
                            styles={{
                                input: (base) => ({
                                    ...base,
                                    color: 'rgb(15, 23, 42)' // text-slate-900
                                }),
                                singleValue: (base) => ({
                                    ...base,
                                    color: 'rgb(15, 23, 42)' // text-slate-900
                                }),
                                option: (base, state) => ({
                                    ...base,
                                    color: 'rgb(226, 232, 240)', // text-slate-200 for options
                                    backgroundColor: state.isFocused ? '#334155' : '#1e293b',
                                    ':active': {
                                        backgroundColor: '#334155'
                                    }
                                })
                            }}
                        />
                    </div>

                    {selectedTrainer ? (
                        <div className="w-full mt-6">
                            <Trainer 
                                selectedTrainer={selectedTrainer} 
                                heldItems={heldItems} 
                                pokemonSpecies={pokemonSpecies} 
                                setSelectedTrainer={setSelectedTrainer} 
                                classTypes={classTypes}
                                setClassTypes={setClassTypes}
                            />
                        </div>
                    ) : (
                        <div className="text-gray-400 text-center mt-8">
                            <p>No trainer selected</p>
                            <p className="text-sm">Select a trainer from the dropdown or create a new one</p>
                        </div>
                    )}

                    <button 
                        onClick={() => navigate("new-trainer")} 
                        className="mt-6 px-6 py-2 bg-tealBlue text-white rounded-xl hover:bg-wildBlueYonder transition-colors duration-200 flex items-center space-x-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        <span>New Trainer</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
