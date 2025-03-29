import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { OverworldDataJson } from "../models/overworld";
import { ParseOverworldData } from "../../wailsjs/go/overworldeditor/OverworldEditorApp";
import Select from "react-select";

const OverworldEditor = () => {
    const [overworlds, setOverworlds] = useState<OverworldDataJson[] | null>([]);
    const [selectedOverworld, setSelectedOverworld] = useState<OverworldDataJson | null>(null);
    const [selectValue, setSelectValue] = useState<{ value: string; label: string } | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOverworldData = async () => {
            try {
                const response = await ParseOverworldData();
                const data = (response as unknown) as OverworldDataJson[];
                if (Array.isArray(data)) {
                    setOverworlds(data);

                    // Load last selected overworld from localStorage
                    const lastSelectedId = localStorage.getItem('lastSelectedOverworldId');
                    if (lastSelectedId) {
                        const lastSelected = data.find(ow => ow.ID === lastSelectedId);
                        if (lastSelected) {
                            setSelectedOverworld(lastSelected);
                            setSelectValue({ value: lastSelected.ID, label: lastSelected.Name });
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching overworld data:', error);
            }
        };
        fetchOverworldData();
    }, []);

    // Save to localStorage whenever selectedOverworld changes
    useEffect(() => {
        if (selectedOverworld?.ID) {
            localStorage.setItem('lastSelectedOverworldId', selectedOverworld.ID);
        }
    }, [selectedOverworld]);

    const getDirectionSprite = (direction: string) => {
        if (!selectedOverworld) return '';
        const frame = selectedOverworld.WalkingFrames.find(f => f.Direction.toLowerCase() === direction.toLowerCase());
        return frame?.Sprite || '';
    };

    return (
        <div className="flex flex-col grow h-[91.5vh] w-screen bg-slate-800 p-4 gap-4">
            <div className="flex flex-row h-5/6 gap-4">
                {/* Left Panel - Sprite Display */}
                <div className="flex flex-col w-5/12 gap-4 bg-slate-700 rounded-xl p-4">
                    <div className="rounded-xl grid grid-cols-2 grid-rows-2 grow bg-slate-600 items-stretch">
                        <div className="p-4 flex items-center justify-center">
                            <div className="text-center">
                                <p className="text-white text-sm mb-2">Front View</p>
                                <img 
                                    src={`data:image/png;base64,${getDirectionSprite('down')}`}
                                    alt="Front Sprite" 
                                    className="mx-auto"
                                />
                            </div>
                        </div>
                        <div className="p-4 flex items-center justify-center">
                            <div className="text-center">
                                <p className="text-white text-sm mb-2">Back View</p>
                                <img 
                                    src={`data:image/png;base64,${getDirectionSprite('up')}`}
                                    alt="Back Sprite" 
                                    className="mx-auto"
                                />
                            </div>
                        </div>
                        <div className="p-4 flex items-center justify-center">
                            <div className="text-center">
                                <p className="text-white text-sm mb-2">Left View</p>
                                <img 
                                    src={`data:image/png;base64,${getDirectionSprite('left')}`}
                                    alt="Left Sprite" 
                                    className="mx-auto"
                                />
                            </div>
                        </div>
                        <div className="p-4 flex items-center justify-center">
                            <div className="text-center">
                                <p className="text-white text-sm mb-2">Right View</p>
                                <img 
                                    src={`data:image/png;base64,${getDirectionSprite('right')}`}
                                    alt="Right Sprite" 
                                    className="mx-auto"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Overworld Selection */}
                    <div className="flex flex-row justify-around gap-4 py-2">
                        <Select
                            options={overworlds?.map(ow => ({ value: ow.ID, label: ow.Name }))}
                            value={selectValue}
                            onChange={(e) => {
                                const selected = overworlds?.find(ow => ow.ID === e?.value);
                                if (selected) {
                                    setSelectedOverworld(selected);
                                    setSelectValue({ value: selected.ID, label: selected.Name });
                                }
                            }}
                            isClearable={false}
                            isDisabled={false}
                            isLoading={false}
                            isRtl={false}
                            isSearchable={true}
                            isMulti={false}
                            placeholder="Select an overworld sprite..."
                            className="grow text-sm"
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
                        <button 
                            onClick={() => navigate("new-overworld")}
                            className="px-6 py-2 bg-tealBlue text-white rounded-xl hover:bg-wildBlueYonder transition-colors duration-200 flex items-center space-x-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            <span>New Sprite</span>
                        </button>
                    </div>
                </div>

                {/* Right Panel - Details and Actions */}
                <div className="flex flex-col w-7/12 gap-4">
                    {selectedOverworld ? (
                        <div className="bg-slate-700 rounded-xl p-6 h-full">
                            <h2 className="text-2xl font-bold text-white mb-6">Sprite Details</h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-4">Basic Info</h3>
                                    <div className="grid grid-cols-2 gap-4 text-gray-300">
                                        <div>
                                            <p className="text-sm text-gray-400">Name</p>
                                            <p>{selectedOverworld.Name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-400">ID</p>
                                            <p>{selectedOverworld.ID}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-4">Available Animations</h3>
                                    <div className="grid grid-cols-2 gap-4 text-gray-300">
                                        <div className="flex items-center space-x-2">
                                            <div className={`w-2 h-2 rounded-full ${selectedOverworld.WalkingFrames.length > 0 ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                            <span>Walking</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className={`w-2 h-2 rounded-full ${selectedOverworld.RunningFrames.length > 0 ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                            <span>Running</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className={`w-2 h-2 rounded-full ${selectedOverworld.SwimmingFrames.length > 0 ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                            <span>Swimming</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className={`w-2 h-2 rounded-full ${selectedOverworld.SurfingFrames.length > 0 ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                            <span>Surfing</span>
                                        </div>
                                    </div>
                                </div>

        <div>
                                    <h3 className="text-lg font-semibold text-white mb-4">Additional Info</h3>
                                    <div className="text-gray-300">
                                        <div className="flex items-center space-x-2">
                                            <div className={`w-2 h-2 rounded-full ${selectedOverworld.IsPlayer ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                            <span>Player Character</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-700 rounded-xl p-6 h-full flex items-center justify-center">
                            <div className="text-center text-gray-400">
                                <p className="text-lg mb-2">No Sprite Selected</p>
                                <p className="text-sm">Select a sprite from the dropdown or create a new one</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OverworldEditor;