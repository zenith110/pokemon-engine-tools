import { useState } from "react"
import { Card } from "../components/ui/card"
import CreateMapDialog from "./components/CreateMapDialog"
import MapEditorView from "./components/MapEditorView"

interface MapData {
    id: string;
    name: string;
    width: number;
    height: number;
    tileSize: number;
    type: string;
    tileset: string;
    layers: Array<{
        id: number;
        name: string;
        visible: boolean;
        locked?: boolean;
        tiles: Array<{
            x: number;
            y: number;
            tileId: string;
            autoTileId?: string;
        }>;
    }>;
    permissions: Array<{
        x: number;
        y: number;
        type: "walkable" | "blocked" | "water" | "grass";
    }>;
    npcs: Array<{
        id: string;
        name: string;
        x: number;
        y: number;
        sprite: string;
        direction: "up" | "down" | "left" | "right";
        script?: string;
    }>;
}

const MapEditor = () => {
    const [selectedMap, setSelectedMap] = useState<MapData | null>(null)
    const [maps, setMaps] = useState<MapData[]>([
        {
            id: "1",
            name: "Starter Town",
            width: 20,
            height: 20,
            tileSize: 32,
            type: "overworld",
            tileset: "default",
            layers: [
                {
                    id: 1,
                    name: "Ground",
                    visible: true,
                    locked: false,
                    tiles: [],
                },
                {
                    id: 2,
                    name: "Objects",
                    visible: true,
                    locked: false,
                    tiles: [],
                },
            ],
            permissions: [],
            npcs: [],
        },
        {
            id: "2",
            name: "First Route",
            width: 30,
            height: 20,
            tileSize: 32,
            type: "overworld",
            tileset: "grass",
            layers: [
                {
                    id: 1,
                    name: "Ground",
                    visible: true,
                    locked: false,
                    tiles: [],
                },
                {
                    id: 2,
                    name: "Objects",
                    visible: true,
                    locked: false,
                    tiles: [],
                },
            ],
            permissions: [],
            npcs: [],
        },
    ])

    const handleCreateMap = (mapData: {
        width: number;
        height: number;
        type: string;
        tileset: string;
        autoTiles: string[];
    }) => {
        const newMap: MapData = {
            id: Math.random().toString(36).substr(2, 9),
            name: `New ${mapData.type} Map`,
            width: mapData.width,
            height: mapData.height,
            tileSize: 32,
            type: mapData.type,
            tileset: mapData.tileset,
            layers: [
                {
                    id: 1,
                    name: "Ground",
                    visible: true,
                    locked: false,
                    tiles: [],
                },
                {
                    id: 2,
                    name: "Objects",
                    visible: true,
                    locked: false,
                    tiles: [],
                },
            ],
            permissions: [],
            npcs: [],
        }
        setMaps([...maps, newMap])
        setSelectedMap(newMap)
    }

    if (!selectedMap) {
        return (
            <div className="h-screen flex flex-col bg-slate-950 text-white p-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold">Map Editor</h1>
                    <CreateMapDialog onCreateMap={handleCreateMap} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {maps.map((map) => (
                        <Card
                            key={map.id}
                            className="p-6 bg-slate-900 border-slate-800 hover:border-slate-700 cursor-pointer transition-colors"
                            onClick={() => setSelectedMap(map)}
                        >
                            <h3 className="text-lg font-semibold mb-2">{map.name}</h3>
                            <div className="space-y-2 text-sm text-slate-400">
                                <p>Size: {map.width}x{map.height}</p>
                                <p>Type: {map.type}</p>
                                <p>Tileset: {map.tileset}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <MapEditorView
            map={selectedMap}
            onMapChange={(updatedMap) => {
                setSelectedMap(updatedMap)
                setMaps(maps.map(m => m.id === updatedMap.id ? updatedMap : m))
            }}
            onBack={() => setSelectedMap(null)}
        />
    )
}

export default MapEditor