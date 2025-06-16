import { useState } from "react"
import { Button } from "../../components/ui/button"
import { Map, Grid, Users } from "lucide-react"

// Components
import TilePalette from "./TilePalette"
import AutoTilePalette from "./AutoTilePalette"
import LayerPanel from "./LayerPanel"
import MapView from "./MapView"
import PermissionView from "./PermissionView"
import NPCView from "./NPCView"
import type { SelectedTile } from "./TilePalette"
import MapToolbar from "./MapToolbar"

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

interface MapEditorViewProps {
    map: MapData;
    onMapChange: (map: MapData) => void;
    onBack: () => void;
}

const MapEditorView = ({ map, onMapChange, onBack }: MapEditorViewProps) => {
    const [activeView, setActiveView] = useState<"map" | "permissions" | "npcs">("map")
    const [selectedTile, setSelectedTile] = useState<SelectedTile | null>(null)
    const [selectedAutoTile, setSelectedAutoTile] = useState<{ id: string; name: string; image: string } | null>(null)
    const [activeLayerId, setActiveLayerId] = useState<number>(1)
    const [paintMode, setPaintMode] = useState<'stamp' | 'fill' | 'remove'>('stamp')
    const [historyIndex, setHistoryIndex] = useState<number>(0)
    const [history, setHistory] = useState<Array<MapData>>([map])

    const undo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1)
            onMapChange(history[historyIndex - 1])
        }
    }

    const redo = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1)
            onMapChange(history[historyIndex + 1])
        }
    }

    const clearMap = () => {
        onMapChange(history[0])
        setHistory([map])
        setHistoryIndex(0)
    }

    return (
        <div className="h-screen flex flex-col bg-slate-950 text-white">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={onBack}
                        className="text-white hover:text-slate-300"
                    >
                        ← Back to Maps
                    </Button>
                    <h1 className="text-xl font-semibold">{map.name}</h1>
                </div>
            </div>

            <div className="flex-1 flex" style={{ minWidth: 0 }}>
                

                {/* Resizable Tile Palette */}
                <div className="h-full flex flex-col justify-stretch">
                    <TilePalette
                        selectedTile={selectedTile}
                        setSelectedTile={setSelectedTile}
                    />
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Top Toolbar */}
                    <div className="p-4 border-b border-slate-800">
                        <div className="flex space-x-2">
                            <Button
                                variant={activeView === "map" ? "default" : "ghost"}
                                onClick={() => setActiveView("map")}
                            >
                                <Map className="h-4 w-4 mr-2" />
                                Map
                            </Button>
                            <Button
                                variant={activeView === "permissions" ? "default" : "ghost"}
                                onClick={() => setActiveView("permissions")}
                            >
                                <Grid className="h-4 w-4 mr-2" />
                                Permissions
                            </Button>
                            <Button
                                variant={activeView === "npcs" ? "default" : "ghost"}
                                onClick={() => setActiveView("npcs")}
                            >
                                <Users className="h-4 w-4 mr-2" />
                                NPCs
                            </Button>
                        </div>
                        <MapToolbar
                    paintMode={paintMode}
                    selectedTile={selectedTile}
                    tileSize={map.tileSize}
                    historyIndex={historyIndex}
                    historyLength={history.length}
                    undo={undo}
                    redo={redo}
                    setPaintMode={setPaintMode}
                    clearMap={clearMap}
                />
                    </div>

                    {/* Main View */}
                    <div className="flex-1 p-4">
                        {activeView === "map" && (
                            <MapView
                                width={map.width}
                                height={map.height}
                                tileSize={map.tileSize}
                                selectedTile={selectedTile}
                                selectedAutoTile={selectedAutoTile}
                                layers={map.layers}
                                setLayers={(layers) => onMapChange({ ...map, layers })}
                                activeLayerId={activeLayerId}
                            />
                        )}
                        {activeView === "permissions" && (
                            <PermissionView
                                width={map.width}
                                height={map.height}
                                tileSize={map.tileSize}
                                permissions={map.permissions}
                                setPermissions={(permissions) =>
                                    onMapChange({ ...map, permissions })
                                }
                            />
                        )}
                        {activeView === "npcs" && (
                            <NPCView
                                width={map.width}
                                height={map.height}
                                tileSize={map.tileSize}
                                npcs={map.npcs}
                                setNPCs={(npcs) =>
                                    onMapChange({ ...map, npcs })
                                }
                            />
                        )}
                        
                    </div>
                    
                </div>

                {/* Right Sidebar */}
                <div className="w-64 border-l border-slate-800 p-4">
                    <LayerPanel
                        layers={map.layers}
                        setLayers={(layers) =>
                            onMapChange({ ...map, layers })
                        }
                        activeLayerId={activeLayerId}
                        setActiveLayerId={setActiveLayerId}
                    />
                </div>
            </div>
        </div>
    )
}

export default MapEditorView 