import { Dialog } from "@headlessui/react";
import Select from "react-select";
import { Pokemon } from "../pokemon.model";

interface TypeDialogProps {
    isOpen: boolean;
    onClose: () => void;
    selectedPokemon: Pokemon | undefined;
    onTypeChange: (types: string[]) => void;
}

const TypeDialog = ({ isOpen, onClose, selectedPokemon, onTypeChange }: TypeDialogProps) => {
    const pokemonTypes: string[] = ["Bug", "Dark", "Dragon", "Electric", "Fairy", "Fighting", "Fire", "Flying", "Ghost", "Grass", "Ground", "Ice", "Normal", "Poison", "Psychic", "Rock", "Steel", "Water"];

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            className="relative z-50"
        >
            <div className="fixed inset-0 bg-black/40" aria-hidden="true" />

            <div className="fixed inset-0 flex w-screen items-center justify-center">
                <Dialog.Panel className="mx-auto w-1/2 rounded-xl bg-slate-700 p-4">
                    <Dialog.Title className="bg-slate-600 rounded-t-xl p-4">
                        <div className="flex flex-row justify-between items-center">
                            <div className="text-lg font-medium">Edit Type</div>
                            <button onClick={onClose} 
                                    className="p-1 hover:bg-slate-500 rounded-lg transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                            </button>
                        </div>
                    </Dialog.Title>

                    <div className="flex flex-row justify-around gap-4 p-4">
                        <div className="flex flex-row items-center gap-2">
                            <h3>Type 1:</h3>
                            <Select
                                isClearable={false}
                                isDisabled={false}
                                isLoading={false}
                                isRtl={false}
                                isSearchable={false}
                                isMulti={false}
                                options={pokemonTypes.map(type => ({ value: type, label: type }))}
                                defaultValue={{ value: selectedPokemon?.Types[0] ? selectedPokemon?.Types[0] : "None", label: selectedPokemon?.Types[0] ? selectedPokemon?.Types[0] : "None" }}
                                classNames={{
                                    control: () => "rounded-xl bg-slate-800 border-none hover:border-none min-w-[150px]",
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
                                        color: 'rgb(15, 23, 42)'
                                    }),
                                    singleValue: (base) => ({
                                        ...base,
                                        color: 'rgb(15, 23, 42)'
                                    }),
                                    option: (base, state) => ({
                                        ...base,
                                        color: 'rgb(226, 232, 240)',
                                        backgroundColor: state.isFocused ? '#334155' : '#1e293b',
                                        ':active': {
                                            backgroundColor: '#334155'
                                        }
                                    })
                                }}
                                onChange={(e) => { 
                                    onTypeChange([e?.value as string, selectedPokemon?.Types[1] as string]);
                                }}
                            />
                        </div>
                        <div className="flex flex-row items-center gap-2">
                            <h3>Type 2 (Optional):</h3>
                            <Select
                                isClearable={false}
                                isDisabled={false}
                                isLoading={false}
                                isRtl={false}
                                isSearchable={false}
                                isMulti={false} 
                                options={[ { value: "None", label: "None" }, ...pokemonTypes.map(type => ({ value: type, label: type}))]}
                                defaultValue={{ value: selectedPokemon?.Types[1] ? selectedPokemon?.Types[1] : "None", label: selectedPokemon?.Types[1] ? selectedPokemon?.Types[1] : "None" }}
                                classNames={{
                                    control: () => "rounded-xl bg-slate-800 border-none hover:border-none min-w-[150px]",
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
                                        color: 'rgb(15, 23, 42)'
                                    }),
                                    singleValue: (base) => ({
                                        ...base,
                                        color: 'rgb(15, 23, 42)'
                                    }),
                                    option: (base, state) => ({
                                        ...base,
                                        color: 'rgb(226, 232, 240)',
                                        backgroundColor: state.isFocused ? '#334155' : '#1e293b',
                                        ':active': {
                                            backgroundColor: '#334155'
                                        }
                                    })
                                }}
                                onChange={(e) => { 
                                    if (e?.value === "None") {
                                        onTypeChange([selectedPokemon?.Types[0] as string]);
                                    } else {
                                        onTypeChange([selectedPokemon?.Types[0] as string, e?.value as string]);
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <div className="flex flex-row items-center justify-center py-4">
                        <button onClick={onClose} 
                                className="px-12 py-2 bg-slate-600 rounded-xl hover:bg-slate-500 transition-colors">
                            Save
                        </button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

export default TypeDialog; 