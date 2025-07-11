import { useState } from "react"
import { Button } from "../../components/ui/button"
import { Map, Grid, Users, Zap } from "lucide-react"

// Components
import TilePalette from "./TilePalette"
import LayerPanel from "./LayerPanel"
import MapView from "./MapView"
import PermissionView from "./PermissionView"
import NPCView from "./NPCView"
import EncounterView from "./EncounterView"
import type { SelectedTile } from "./TilePalette"
import MapToolbar from "./MapToolbar"
import { MapEditorViewProps } from "../types"

type ViewMode = "map" | "permissions" | "npcs" | "encounters"

const MapEditorView = ({ map, onMapChange, onBack }: MapEditorViewProps) => {
  // Convert Go model to frontend MapData structure
  const mapData = {
    id: map.ID?.toString() || "1",
    name: map.Name || "Untitled Map",
    width: map.Width || 20,
    height: map.Height || 20,
    tileSize: 16,
    type: map.Properties?.[0]?.TypeOfMap || "overworld",
    tileset: map.Properties?.[0]?.TilesetImagePath || "",
    permissions: [],
    npcs: [],
    encounters: [],
    properties: {
      encounterRate: 10,
      music: map.Properties?.[0]?.BgMusic || "",
      description: map.Properties?.[0]?.Description || "",
    }
  }

  // LIFTED STATE: layers
  const [layers, setLayers] = useState([
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
  ]);

  // History for layers
  const [history, setHistory] = useState<Array<typeof layers>>([[
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
  ]]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const [activeView, setActiveView] = useState<ViewMode>("map")
  const [selectedTile, setSelectedTile] = useState<SelectedTile | null>(null)
  const [selectedAutoTile, setSelectedAutoTile] = useState<{ id: string; name: string; image: string } | null>(null)
  const [activeLayerId, setActiveLayerId] = useState<number>(1)
  const [paintMode, setPaintMode] = useState<'stamp' | 'fill' | 'remove'>('stamp')

  const handleMapChange = (updatedMapData: typeof mapData) => {
    // Convert back to Go model for the callback
    const updatedMap = {
      ...map,
      Name: updatedMapData.name,
      Width: updatedMapData.width,
      Height: updatedMapData.height,
      Properties: [{
        ...map.Properties?.[0],
        TypeOfMap: updatedMapData.type,
        TilesetImagePath: updatedMapData.tileset,
        BgMusic: updatedMapData.properties?.music || "",
        Description: updatedMapData.properties?.description || ""
      }]
    }
    onMapChange(updatedMap)
  }

  // Undo/redo for layers
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setLayers(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setLayers(history[historyIndex + 1]);
    }
  };

  const clearMap = () => {
    const clearedMapData = {
      ...mapData,
      layers: layers.map(layer => ({ ...layer, tiles: [] }))
    }
    handleMapChange(clearedMapData)
  }

  // Update handleLayerChange to update both state and history
  const handleLayerChange = (newLayers: typeof layers) => {
    setLayers(newLayers);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newLayers);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handlePermissionsChange = (permissions: typeof mapData.permissions) => {
    handleMapChange({ ...mapData, permissions })
  }

  const handleNPCsChange = (npcs: typeof mapData.npcs) => {
    handleMapChange({ ...mapData, npcs })
  }

  const handleEncountersChange = (encounters: typeof mapData.encounters) => {
    handleMapChange({ ...mapData, encounters })
  }

  const renderViewTabs = () => (
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
      <Button
        variant={activeView === "encounters" ? "default" : "ghost"}
        onClick={() => setActiveView("encounters")}
      >
        <Zap className="h-4 w-4 mr-2" />
        Encounters
      </Button>
    </div>
  )

  const renderMainView = () => {
    switch (activeView) {
      case "map":
        return (
          <MapView
            width={mapData.width}
            height={mapData.height}
            tileSize={mapData.tileSize}
            selectedTile={selectedTile}
            selectedAutoTile={selectedAutoTile}
            layers={layers}
            setLayers={handleLayerChange}
            activeLayerId={activeLayerId}
            paintMode={paintMode}
          />
        )
      case "permissions":
        return (
            <PermissionView
            width={mapData.width}
            height={mapData.height}
            tileSize={mapData.tileSize}
            layers={layers}
            permissions={mapData.permissions}
            setPermissions={handlePermissionsChange}
          />
        )
      case "npcs":
        return (
          <NPCView
            width={mapData.width}
            height={mapData.height}
            tileSize={mapData.tileSize}
            layers={layers}
            npcs={mapData.npcs}
            setNPCs={handleNPCsChange}
          />
        )
      case "encounters":
        return (
          <EncounterView
            encounters={mapData.encounters}
            setEncounters={handleEncountersChange}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen min-w-screen flex flex-col bg-slate-950 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-white hover:text-slate-300"
          >
            ← Back to Maps
          </Button>
          <h1 className="text-xl font-semibold">{mapData.name}</h1>
        </div>
      </div>

      <div className="flex-1 flex" style={{ minWidth: 0 }}>
        {/* Left Sidebar - Tile Palette */}
        <div className="h-full flex flex-col justify-stretch">
          <TilePalette
            selectedTile={selectedTile}
            setSelectedTile={setSelectedTile}
            tilesetPath={mapData.tileset}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Toolbar */}
          <div className="p-4 border-b border-slate-800">
            {renderViewTabs()}
            {activeView === "map" && (
              <MapToolbar
                paintMode={paintMode}
                selectedTile={selectedTile}
                tileSize={mapData.tileSize}
                historyIndex={historyIndex}
                historyLength={history.length}
                undo={undo}
                redo={redo}
                setPaintMode={setPaintMode}
                clearMap={clearMap}
              />
            )}
          </div>

          {/* Main View */}
          <div className="flex-1 p-4">
            {renderMainView()}
          </div>
        </div>

        {/* Right Sidebar - Layer Panel */}
        {activeView === "map" && (
          <div className="w-64 border-l border-slate-800 p-4">
            <LayerPanel
              layers={layers}
              setLayers={handleLayerChange}
              activeLayerId={activeLayerId}
              setActiveLayerId={setActiveLayerId}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default MapEditorView 