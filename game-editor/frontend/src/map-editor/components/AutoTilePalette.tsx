import { useState } from "react"
import { ScrollArea } from "../../components/ui/scroll-area"
import { Card } from "../../components/ui/card"

interface AutoTile {
    id: string;
    name: string;
    image: string;
    type: string;
}

interface AutoTilePaletteProps {
    selectedAutoTile: { id: string; name: string; image: string } | null;
    setSelectedAutoTile: (tile: { id: string; name: string; image: string } | null) => void;
}

const AutoTilePalette = ({ selectedAutoTile, setSelectedAutoTile }: AutoTilePaletteProps) => {
    const [tiles, setTiles] = useState<AutoTile[]>([
        { id: "1", name: "Water Edge", image: "data:image/png;base64,...", type: "water" },
        { id: "2", name: "Grass Edge", image: "data:image/png;base64,...", type: "grass" },
        { id: "3", name: "Cliff Edge", image: "data:image/png;base64,...", type: "cliff" },
        // Add more autotiles as needed
    ]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">AutoTiles</h3>
                <button className="text-xs text-slate-400 hover:text-slate-300">
                    Import Autotiles
                </button>
            </div>
            
            <ScrollArea className="h-[calc(100vh-12rem)]">
                <div className="grid grid-cols-2 gap-2 p-2">
                    {tiles.map((tile) => (
                        <Card
                            key={tile.id}
                            className={`p-2 cursor-pointer transition-colors ${
                                selectedAutoTile?.id === tile.id
                                    ? "border-tealBlue bg-slate-800"
                                    : "hover:bg-slate-800"
                            }`}
                            onClick={() => setSelectedAutoTile(tile)}
                        >
                            <div className="aspect-square w-full bg-slate-900 rounded-md overflow-hidden">
                                <img
                                    src={tile.image}
                                    alt={tile.name}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className="mt-1 space-y-1">
                                <p className="text-xs text-slate-400 truncate">
                                    {tile.name}
                                </p>
                                <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400">
                                    {tile.type}
                                </span>
                            </div>
                        </Card>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
};

export default AutoTilePalette; 