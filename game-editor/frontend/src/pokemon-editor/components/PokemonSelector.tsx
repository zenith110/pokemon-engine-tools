import { useState } from "react";
import Select from "react-select";
import { Pokemon } from "../pokemon.model";
import { LoadPokemonById } from "../../../bindings/github.com/zenith110/pokemon-engine-tools/parsing/ParsingApp";

interface PokemonSelectorProps {
    pokemonSpecies: Pokemon[];
    selectedPokemon: Pokemon | undefined;
    onPokemonSelect: (pokemon: Pokemon) => void;
}

const PokemonSelector = ({ pokemonSpecies, selectedPokemon, onPokemonSelect }: PokemonSelectorProps) => {
    const [selectValue, setSelectValue] = useState<{ value: string; label: string } | null>(null);

    const handlePokemonChange = async (e: any) => {
        const selected: Pokemon | undefined = pokemonSpecies.find(pokemon => pokemon.ID === (e?.value));
        if (selected) {
            const trainerEditor = await LoadPokemonById(selected.ID);
            const pokemon: Pokemon = {
                ...trainerEditor,
                DexEntry: "",
                Evolutions: trainerEditor.Evolutions ? trainerEditor.Evolutions.map(evo => ({
                    ...evo,
                    Method1: evo.Method1 ? [evo.Method1] : [],
                    Method2: evo.Method2 ? [evo.Method2] : []
                })) : []
            };
            setSelectValue({ value: pokemon.ID, label: `${pokemon.ID}: ${pokemon.Name}` });
            onPokemonSelect(pokemon);
        }
    };

    return (
        <div className="flex flex-row justify-around gap-4 py-2">
            <Select
                options={pokemonSpecies.map(pokemon => ({ value: pokemon.ID, label: `${pokemon.ID}: ${pokemon.Name}`}))}
                value={selectValue}
                onChange={handlePokemonChange}
                isClearable={false}
                isDisabled={false}
                isLoading={false}
                isRtl={false}
                isSearchable={true}
                isMulti={false}
                className="grow"
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
            />
            <button onClick={() => console.log("TO BE ADDED")} 
                    className="bg-slate-600 rounded-xl px-4 hover:bg-slate-500 transition-colors">
                New Pokemon
            </button>
        </div>
    );
};

export default PokemonSelector; 