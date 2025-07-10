import { useState } from "react"
import { Card } from "../components/ui/card"
import { Button } from "../components/ui/button"
import CreateMapDialog from "./components/CreateMapDialog"
import CreateTilesetDialog from "./components/CreateTilesetDialog"
import MapEditorView from "./components/MapEditorView"
import { MapData, CreateMapData, CreateTilesetData, MapTile } from "./types"

// Default map templates
const DEFAULT_MAP_TEMPLATES = {
  starter: {
    name: "Starter Town",
    width: 20,
    height: 20,
    type: "overworld",
    tileset: "default",
  },
  route: {
    name: "First Route", 
    width: 30,
    height: 20,
    type: "overworld",
    tileset: "grass",
  },
} as const

// Default layer configuration
const DEFAULT_LAYERS = [
  {
    id: 1,
    name: "Ground",
    visible: true,
    locked: false,
    tiles: [] as MapTile[],
  },
  {
    id: 2,
    name: "Objects", 
    visible: true,
    locked: false,
    tiles: [] as MapTile[],
  },
]

// Hook for managing maps
const useMaps = () => {
  const [maps, setMaps] = useState<MapData[]>([
    {
      id: "1",
      ...DEFAULT_MAP_TEMPLATES.starter,
      tileSize: 16,
      layers: [...DEFAULT_LAYERS],
      permissions: [],
      npcs: [],
      encounters: []
    },
    {
      id: "2", 
      ...DEFAULT_MAP_TEMPLATES.route,
      tileSize: 16,
      layers: [...DEFAULT_LAYERS],
      permissions: [],
      npcs: [],
      encounters: []
    },
  ])

  const createMap = (mapData: CreateMapData) => {
    const newMap: MapData = {
      id: crypto.randomUUID(),
      name: mapData.mapName,
      width: mapData.width,
      height: mapData.height,
      tileSize: 16,
      type: mapData.type,
      tileset: mapData.tileset,
      layers: [...DEFAULT_LAYERS],
      permissions: [],
      npcs: [],
      encounters: []
    }
    setMaps(prev => [...prev, newMap])
    return newMap
  }

  const updateMap = (updatedMap: MapData) => {
    setMaps(prev => prev.map(m => m.id === updatedMap.id ? updatedMap : m))
  }

  const deleteMap = (mapId: string) => {
    setMaps(prev => prev.filter(m => m.id !== mapId))
  }

  return { maps, createMap, updateMap, deleteMap }
}

// Component for map selection screen
const MapSelectionScreen = ({ 
  maps, 
  onCreateMap, 
  onSelectMap,
  onDeleteMap
}: {
  maps: MapData[]
  onCreateMap: (mapData: CreateMapData) => void
  onSelectMap: (map: MapData) => void
  onDeleteMap: (mapId: string) => void
}) => (
  <div className="h-screen flex flex-col bg-slate-950 text-white p-8">
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-2xl font-bold">Map Editor</h1>
      <div className="flex items-center gap-4">
        <CreateMapDialog onCreateMap={onCreateMap} />
        <div className="text-slate-600">|</div>
        <CreateTilesetDialog/>
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {maps.map((map) => (
        <Card
          key={map.id}
          className="p-6 bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors relative group"
        >
          {/* Main card content */}
          <div 
            className="cursor-pointer"
            onClick={() => onSelectMap(map)}
          >
            <h3 className="text-lg font-semibold mb-2">{map.name}</h3>
            <div className="space-y-2 text-sm text-slate-400">
              <p>Size: {map.width}x{map.height}</p>
              <p>Type: {map.type}</p>
              <p>Tileset: {map.tileset}</p>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 bg-slate-800 hover:bg-slate-700"
              onClick={(e) => {
                e.stopPropagation()
                onSelectMap(map)
              }}
              title="Edit Map"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 bg-red-900/20 hover:bg-red-900/40 text-red-400 hover:text-red-300"
              onClick={(e) => {
                e.stopPropagation()
                if (confirm(`Are you sure you want to delete "${map.name}"?`)) {
                  onDeleteMap(map.id)
                }
              }}
              title="Delete Map"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          </div>
        </Card>
      ))}
    </div>
  </div>
)

const MapEditor = () => {
  const { maps, createMap, updateMap, deleteMap } = useMaps()
  const [selectedMap, setSelectedMap] = useState<MapData | null>(null)

  const handleCreateMap = (mapData: CreateMapData) => {
    const newMap = createMap(mapData)
    setSelectedMap(newMap)
  }

  const handleCreateTileset = (tilesetData: CreateTilesetData) => {
    console.log('Creating tileset:', tilesetData)
    // TODO: Implement tileset creation logic
    alert(`Tileset "${tilesetData.name}" created successfully!`)
  }

  const handleMapChange = (updatedMap: MapData) => {
    setSelectedMap(updatedMap)
    updateMap(updatedMap)
  }

  const handleBack = () => setSelectedMap(null)

  const handleDeleteMap = (mapId: string) => {
    deleteMap(mapId)
    // If the deleted map was selected, clear selection
    if (selectedMap?.id === mapId) {
      setSelectedMap(null)
    }
  }

  if (!selectedMap) {
    return (
      <MapSelectionScreen
        maps={maps}
        onCreateMap={handleCreateMap}
        onSelectMap={setSelectedMap}
        onDeleteMap={handleDeleteMap}
      />
    )
  }

  return (
    <MapEditorView
      map={selectedMap}
      onMapChange={handleMapChange}
      onBack={handleBack}
    />
  )
}

export default MapEditor