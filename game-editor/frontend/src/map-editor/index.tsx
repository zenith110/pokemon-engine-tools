import { useEffect, useState } from "react"
import { Card } from "../components/ui/card"
import { Button } from "../components/ui/button"
import CreateMapDialog from "./components/CreateMapDialog"
import CreateTilesetDialog from "./components/CreateTilesetDialog"
import MapEditorView from "./components/MapEditorView"
import { CreateMapData, CreateTilesetData } from "./types"
import { models } from "../../wailsjs/go/models"
import { GetAllMaps } from "../../wailsjs/go/parsing/ParsingApp"; // adjust path as needed
import { DeleteMapByID, UpdateTomlMapEntryByID } from "../../wailsjs/go/mapeditor/MapEditorApp"
// Hook for managing maps
const useMaps = () => {
  const [maps, setMaps] = useState<models.Map[]>([]);

  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const result = await GetAllMaps();
        if (Array.isArray(result) && result.length > 0) {
          setMaps(result);
        }else{
          setMaps([]);
        }
      } catch (e) {
      }
    };
    fetchMaps();
  }, []);


  const updateMap = async(updatedMap: models.Map) => {
    setMaps(prev => prev.map(m => m.ID === updatedMap.ID ? updatedMap : m))
    await UpdateTomlMapEntryByID(updatedMap)
  }

  const deleteMap = async(mapId: number) => {
    const mapDelete = await DeleteMapByID(mapId)
    if(mapDelete.success === true){
      setMaps(prev => prev.filter(m => m.ID !== mapId))
    }
  }

  return { maps, setMaps, updateMap, deleteMap }
}

// Component for map selection screen
const MapSelectionScreen = ({ 
  maps, 
  onCreateMap, 
  onSelectMap,
  onDeleteMap
}: {
  maps: models.Map[]
  onCreateMap: (mapData: CreateMapData) => void
  onSelectMap: (map: models.Map) => void
  onDeleteMap: (mapId: number) => void
}) => (
  <div className="h-screen flex flex-col bg-slate-950 text-white p-8">
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-2xl font-bold">Map Editor</h1>
      <div className="flex items-center gap-4">
        <CreateMapDialog onCreateMap={onCreateMap} handleCreateMap={onCreateMap} />
        <div className="text-slate-600">|</div>
        <CreateTilesetDialog/>
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {maps.length > 0 ? maps.map((map) => (
        <Card
          key={map.ID}
          className="p-6 bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors relative group"
        >
          {/* Main card content */}
          <div 
            className="cursor-pointer"
            onClick={() => onSelectMap(map)}
          >
            <h3 className="text-lg font-semibold mb-2">{map.Name}</h3>
            <div className="space-y-2 text-sm text-slate-400">
              <p>Size: {map.Width}x{map.Height}</p>
              <p>Type: {map.Properties[0]?.TypeOfMap || "overworld"}</p>
              <p>Tileset: {map.Properties[0]?.TilesetImagePath || ""}</p>
              <p>Tile Size: {map.TileSize}x{map.TileSize}</p>
              {map.Properties[0]?.Description && (
                <p className="text-xs text-slate-500 mt-2">Description: {map.Properties[0].Description}</p>
              )}
              <div className="flex gap-2 mt-2 w-full justify-center">
                {map.Properties[0]?.BgMusic && (
                  <span className="px-2 py-1 bg-slate-800 rounded text-xs">
                    Music: {map.Properties[0].BgMusic}
                  </span>
                )}
              </div>
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
                if (confirm(`Are you sure you want to delete "${map.Name}"?`)) {
                  onDeleteMap(map.ID)
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
      )) : <p>No maps were found. Create one using the New Map button.</p>}
    </div>
  </div>
)

const MapEditor = () => {
  const { maps, setMaps, updateMap, deleteMap } = useMaps()
  const [selectedMap, setSelectedMap] = useState<models.Map | null>(null)

  const handleCreateMap = async (mapData: CreateMapData) => {
    try {
      // Create the map data for backend
      const backendMapData = {
        Map: [{
          Name: mapData.mapName,
          ID: Date.now(),
          Width: mapData.width,
          Height: mapData.height,
          TileSize: mapData.tilesetSize,
          Properties: [{
            TilesetImagePath: mapData.tilesetPath,
            FilePath: `data/assets/maps/${mapData.mapName}.json`,
            TypeOfMap: mapData.type,
            BgMusic: mapData.music || "",
            Description: mapData.description || "",
            TileSize: mapData.tilesetSize
          }],
        }]
      }
      
      // Call backend to create the map
      const { CreateMap } = await import("../../wailsjs/go/mapeditor/MapEditorApp")
      const createdMap = await CreateMap(models.MapEditerMapData.createFrom(backendMapData))
      
      if (createdMap.success === true) {
        // Create the map for frontend state
        const newMap = new models.Map({
          Name: mapData.mapName,
          ID: Date.now(),
          Width: mapData.width,
          Height: mapData.height,
          Properties: [{
            TilesetImagePath: mapData.tilesetPath,
            FilePath: `data/assets/maps/${mapData.mapName}.json`,
            TypeOfMap: mapData.type,
            BgMusic: mapData.music || "",
            Description: mapData.description || ""
          }],
          Encounter: []
        })
        
        // Add the new map to the maps list
        setMaps(prev => [...prev, newMap])
        
        // Set the new map as selected
        setSelectedMap(newMap)
        // Show success toast
        alert(`Map "${mapData.mapName}" created successfully!`)
      } else {
        console.error("Failed to create map:", createdMap.errorMessage)
        // Show error toast
        alert(`Failed to create map: ${createdMap.errorMessage || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error creating map:", error)
      // Show error toast
      alert(`Error creating map: ${error}`)
    }
  }


  const handleMapChange = (updatedMap: models.Map) => {
    setSelectedMap(updatedMap)
    updateMap(updatedMap)
  }

  const handleBack = () => setSelectedMap(null)

  const handleDeleteMap = (mapId: number) => {
    deleteMap(mapId)
    // If the deleted map was selected, clear selection
    if (selectedMap?.ID === mapId) {
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