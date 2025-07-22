import { Pokemon } from "../pokemon.model";

interface PokemonSpritesProps {
    selectedPokemon: Pokemon | undefined;
}

const PokemonSprites = ({ selectedPokemon }: PokemonSpritesProps) => {
    return (
        <div className="rounded-xl grid grid-rows-2 grid-cols-2 grow bg-slate-600 items-stretch min-h-[240px]">
            <img src={selectedPokemon? `data:image/png;base64,${selectedPokemon?.FrontSprite}` : ''} alt="Front Sprite" className="p-2" />
            <img src={selectedPokemon? `data:image/png;base64,${selectedPokemon?.ShinyFront}` : ''} alt="Shiny Front Sprite" className="p-2" />
            <img src={selectedPokemon? `data:image/png;base64,${selectedPokemon?.BackSprite}` : ''} alt="Back Sprite" className="p-2" />
            <img src={selectedPokemon ? `data:image/png;base64,${selectedPokemon?.ShinyBack}` : ''} alt="Shiny Back Sprite" className="p-2" />
        </div>
    );
};

export default PokemonSprites; 