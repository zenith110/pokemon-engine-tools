import { useState } from "react"
import { Button } from "../../components/ui/button"
import { Map, Grid, Users, Zap } from "lucide-react"

// Components
import TilePalette from "./TilePalette"
import AutoTilePalette from "./AutoTilePalette"
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
  const [activeView, setActiveView] = useState<ViewMode>("map")
  const [selectedTile, setSelectedTile] = useState<SelectedTile | null>(null)
  const [selectedAutoTile, setSelectedAutoTile] = useState<{ id: string; name: string; image: string } | null>(null)
  const [activeLayerId, setActiveLayerId] = useState<number>(1)
  const [paintMode, setPaintMode] = useState<'stamp' | 'fill' | 'remove'>('stamp')
  const [historyIndex, setHistoryIndex] = useState<number>(0)
  const [history, setHistory] = useState<Array<typeof map>>([map])

  const handleMapChange = (updatedMap: typeof map) => {
    onMapChange(updatedMap)
    // Update history
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(updatedMap)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

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
    const clearedMap = {
      ...map,
      layers: map.layers.map(layer => ({ ...layer, tiles: [] }))
    }
    handleMapChange(clearedMap)
  }

  const handleLayerChange = (layers: typeof map.layers) => {
    handleMapChange({ ...map, layers })
  }

  const handlePermissionsChange = (permissions: typeof map.permissions) => {
    handleMapChange({ ...map, permissions })
  }

  const handleNPCsChange = (npcs: typeof map.npcs) => {
    handleMapChange({ ...map, npcs })
  }

  const handleEncountersChange = (encounters: typeof map.encounters) => {
    handleMapChange({ ...map, encounters })
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
            width={map.width}
            height={map.height}
            tileSize={map.tileSize}
            selectedTile={selectedTile}
            selectedAutoTile={selectedAutoTile}
            layers={map.layers}
            setLayers={handleLayerChange}
            activeLayerId={activeLayerId}
            paintMode={paintMode}
          />
        )
      case "permissions":
        return (
            <PermissionView
            width={map.width}
            height={map.height}
            tileSize={map.tileSize}
            layers={map.layers}                // <-- Add this line
            permissions={map.permissions}
            setPermissions={handlePermissionsChange}
          />
        )
      case "npcs":
        return (
          <NPCView
            width={map.width}
            height={map.height}
            tileSize={map.tileSize}
            layers={map.layers}
            npcs={map.npcs}
            setNPCs={handleNPCsChange}
          />
        )
      case "encounters":
        return (
          <EncounterView
            encounters={map.encounters}
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
          <h1 className="text-xl font-semibold">{map.name}</h1>
        </div>
      </div>

      <div className="flex-1 flex" style={{ minWidth: 0 }}>
        {/* Left Sidebar - Tile Palette */}
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
            {renderViewTabs()}
            {activeView === "map" && (
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
              layers={map.layers}
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