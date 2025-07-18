import { useState, useEffect } from "react";
import { LoadPokemonById } from "../../../wailsjs/go/parsing/ParsingApp";

interface PokemonSpriteProps {
    pokemonId: string;
    pokemonName: string;
    timeOfDay?: "Morning" | "Afternoon" | "Night";
}

const PokemonSprite = ({ pokemonId, pokemonName, timeOfDay }: PokemonSpriteProps) => {
    const [spriteUrl, setSpriteUrl] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [pokemonData, setPokemonData] = useState<any>(null);

    useEffect(() => {
        const loadSprite = async () => {
            setIsLoading(true);
            try {
                const pokemon = await LoadPokemonById(pokemonId);
                const spriteUrl = `data:image/gif;base64,${pokemon.Icon}`;
                setSpriteUrl(spriteUrl);
                setPokemonData(pokemon);
            } catch (error) {
                console.error('Error loading sprite:', error);
                setSpriteUrl("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23374151'/%3E%3Ctext x='32' y='32' text-anchor='middle' dy='.3em' fill='%239ca3af' font-size='12'%3E?%3C/text%3E%3C/svg%3E");
            } finally {
                setIsLoading(false);
            }
        };

        loadSprite();
    }, [pokemonId]);

    const playCry = () => {
        if (pokemonData?.Cry) {
            const audio = new Audio(`data:audio/wav;base64,${pokemonData.Cry}`);
            audio.play().catch(error => {
                console.error('Error playing cry:', error);
            });
        }
    };

    const getTimeOfDayTint = () => {
        switch (timeOfDay) {
            case "Morning":
                return "brightness-110 saturate-110";
            case "Afternoon":
                return "brightness-90 saturate-95";
            case "Night":
                return "brightness-40 saturate-80 hue-rotate-30";
            default:
                return "";
        }
    };

    if (isLoading) {
        return (
            <div className="w-16 h-16 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-400"></div>
            </div>
        );
    }

    return (
        <img
            src={spriteUrl}
            alt={pokemonName}
            className={`w-16 h-16 object-contain cursor-pointer hover:scale-105 transition-transform ${getTimeOfDayTint()}`}
            onClick={playCry}
            onError={(e) => {
                e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23374151'/%3E%3Ctext x='32' y='32' text-anchor='middle' dy='.3em' fill='%239ca3af' font-size='12'%3E?%3C/text%3E%3C/svg%3E";
            }}
        />
    );
};

export default PokemonSprite;