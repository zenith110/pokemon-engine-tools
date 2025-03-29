import { useState } from "react"
import { ScrollArea } from "../../components/ui/scroll-area"
import { Card } from "../../components/ui/card"

interface Tile {
    id: string;
    name: string;
    image: string;
}

interface TilePaletteProps {
    selectedTile: { id: string; image: string } | null;
    setSelectedTile: (tile: { id: string; image: string } | null) => void;
}

const TilePalette = ({ selectedTile, setSelectedTile }: TilePaletteProps) => {
    const [tiles, setTiles] = useState<Tile[]>([
        { id: "1", name: "Grass", image: "data:image/png;base64,..." },
        { id: "2", name: "Water", image: "data:image/png;base64,..." },
        { id: "3", name: "Stone", image: "data:image/png;base64,..." },
        // Add more tiles as needed
    ]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Tiles</h3>
                <button className="text-xs text-slate-400 hover:text-slate-300">
                    Import Tileset
                </button>
            </div>
            
            <ScrollArea className="h-[calc(100vh-12rem)]">
                <div className="grid grid-cols-2 gap-2 p-2">
                    {tiles.map((tile) => (
                        <Card
                            key={tile.id}
                            className={`p-2 cursor-pointer transition-colors ${
                                selectedTile?.id === tile.id
                                    ? "border-tealBlue bg-slate-800"
                                    : "hover:bg-slate-800"
                            }`}
                            onClick={() => setSelectedTile(tile)}
                        >
                            <div className="aspect-square w-full bg-slate-900 rounded-md overflow-hidden">
                                <img
                                    src={tile.image}
                                    alt={tile.name}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <p className="text-xs text-slate-400 mt-1 truncate">
                                {tile.name}
                            </p>
                        </Card>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
};

export default TilePalette; 