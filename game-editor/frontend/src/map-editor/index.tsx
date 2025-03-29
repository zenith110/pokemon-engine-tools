import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Button } from "../components/ui/button"
import { Map, Grid, Users } from "lucide-react"

// Components
import TilePalette from "./components/TilePalette"
import AutoTilePalette from "./components/AutoTilePalette"
import LayerPanel from "./components/LayerPanel"
import MapView from "./components/MapView"
import PermissionView from "./components/PermissionView"
import NPCView from "./components/NPCView"
import CreateMapDialog from "./components/CreateMapDialog"

interface MapData {
    id: string;
    name: string;
    width: number;
    height: number;
    tileSize: number;
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
    const [activeView, setActiveView] = useState<"map" | "permissions" | "npcs">("map")
    const [selectedTile, setSelectedTile] = useState<{ id: string; image: string } | null>(null)
    const [selectedAutoTile, setSelectedAutoTile] = useState<{ id: string; image: string } | null>(null)
    const [mapData, setMapData] = useState<MapData>({
        id: "1",
        name: "New Map",
        width: 20,
        height: 20,
        tileSize: 32,
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
    })

    const handleCreateMap = (mapData: {
        width: number;
        height: number;
        type: string;
        tileset: string;
        autoTiles: string[];
    }) => {
        setMapData({
            id: Math.random().toString(36).substr(2, 9),
            name: `New ${mapData.type} Map`,
            width: mapData.width,
            height: mapData.height,
            tileSize: 32,
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
        })
    }

    return (
        <div className="h-screen flex flex-col bg-slate-950 text-white">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <h1 className="text-xl font-semibold">Map Editor</h1>
                <CreateMapDialog onCreateMap={handleCreateMap} />
            </div>

            <div className="flex-1 flex">
                {/* Left Sidebar */}
                <div className="w-64 border-r border-slate-800 p-4">
                    <Tabs defaultValue="tiles" className="w-full">
                        <TabsList className="w-full">
                            <TabsTrigger value="tiles" className="flex-1">Tiles</TabsTrigger>
                            <TabsTrigger value="autotiles" className="flex-1">Auto</TabsTrigger>
                        </TabsList>
                        <TabsContent value="tiles">
                            <TilePalette
                                selectedTile={selectedTile}
                                setSelectedTile={setSelectedTile}
                            />
                        </TabsContent>
                        <TabsContent value="autotiles">
                            <AutoTilePalette
                                selectedAutoTile={selectedAutoTile}
                                setSelectedAutoTile={setSelectedAutoTile}
                            />
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
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
                    </div>

                    {/* Main View */}
                    <div className="flex-1 p-4">
                        {activeView === "map" && (
                            <MapView
                                width={mapData.width}
                                height={mapData.height}
                                tileSize={mapData.tileSize}
                                selectedTile={selectedTile}
                                selectedAutoTile={selectedAutoTile}
                                layers={mapData.layers}
                                setLayers={(layers) =>
                                    setMapData({ ...mapData, layers })
                                }
                            />
                        )}
                        {activeView === "permissions" && (
                            <PermissionView
                                width={mapData.width}
                                height={mapData.height}
                                tileSize={mapData.tileSize}
                                permissions={mapData.permissions}
                                setPermissions={(permissions) =>
                                    setMapData({ ...mapData, permissions })
                                }
                            />
                        )}
                        {activeView === "npcs" && (
                            <NPCView
                                width={mapData.width}
                                height={mapData.height}
                                tileSize={mapData.tileSize}
                                npcs={mapData.npcs}
                                setNPCs={(npcs) =>
                                    setMapData({ ...mapData, npcs })
                                }
                            />
                        )}
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="w-64 border-l border-slate-800 p-4">
                    <LayerPanel
                        layers={mapData.layers}
                        setLayers={(layers) =>
                            setMapData({ ...mapData, layers })
                        }
                    />
                </div>
            </div>
        </div>
    )
}

export default MapEditor