import { useState, useEffect } from "react"
import { Button } from "../../components/ui/button"
import { Map, Grid, Users, Zap, Save } from "lucide-react"
import { UpdateMapJson, UpdateTomlMapEntryByID } from "../../../wailsjs/go/mapeditor/MapEditorApp"
import { models } from "../../../wailsjs/go/models"

// Components
import TilePalette from "./TilePalette"
import LayerPanel from "./LayerPanel"
import MapView from "./MapView"
// import PermissionView from "./PermissionView"
// import NPCView from "./NPCView"
import EncounterView from "./EncounterView"
import type { SelectedTile } from "./TilePalette"
import MapToolbar from "./MapToolbar"
import { MapEditorViewProps } from "../types"
import { ParseMapData, GetMapTomlByID } from "../../../wailsjs/go/parsing/ParsingApp"

type ViewMode = "map" | "encounters"
// type ViewMode = "map" | "permissions" | "npcs" | "encounters"

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
    grassEncounters: map.GrassEncounters || [],
    waterEncounters: map.WaterEncounters || [],
    caveEncounters: map.CaveEncounters || [],
    fishingEncounters: map.FishingEncounters || [],
    properties: {
      encounterRate: 10,
      music: map.Properties?.[0]?.BgMusic || "",
      description: map.Properties?.[0]?.Description || "",
    }
  }

  // LIFTED STATE: layers - start with empty array, will be populated from JSON
  const [layers, setLayers] = useState<Array<{
    id: number;
    name: string;
    visible: boolean;
    locked: boolean;
    tiles: Array<{
      x: number;
      y: number;
      tileId: string;
      autoTileId?: string;
    }>;
  }>>([]);

  // History for layers - start with empty array
  const [history, setHistory] = useState<Array<typeof layers>>([[]]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Load map data from JSON file
  useEffect(() => {
    const loadMapData = async () => {
      try {
        console.log("Loading map data from:", map.ID);
        const mapToml = await GetMapTomlByID(map.ID);
        console.log("Map TOML data:", mapToml);
        
        // Update mapData with TOML encounter data
        if (mapToml) {
          mapData.grassEncounters = mapToml.GrassEncounters || [];
          mapData.waterEncounters = mapToml.WaterEncounters || [];
          mapData.caveEncounters = mapToml.CaveEncounters || [];
          mapData.fishingEncounters = mapToml.FishingEncounters || [];
        }
        // Get the JSON file path from the map properties
        const jsonFilePath = map.Properties?.[0]?.FilePath || "";
        if (!jsonFilePath) {
          console.log("No JSON file path found for map, using default layers");
          // Set default layers if no JSON file path
          const defaultLayers = [
            {
              id: 1,
              name: "Base Layer",
              visible: true,
              locked: false,
              tiles: [],
            },
          ];
          setLayers(defaultLayers);
          setHistory([defaultLayers]);
          setHistoryIndex(0);
          return;
        }

        const result = await ParseMapData(jsonFilePath);
        
        if (result.success && result.data) {
          const mapJsonData = result.data as any;
          
          // Update layers with data from JSON
          if (mapJsonData.layers && mapJsonData.layers.length > 0) {
            const loadedLayers = mapJsonData.layers.map((layer: any) => ({
              id: layer.id,
              name: layer.name,
              visible: layer.visible,
              locked: layer.locked || false,
              tiles: layer.tiles.map((tile: any) => ({
                x: tile.x,
                y: tile.y,
                tileId: tile.tileId,
                autoTileId: tile.autoTileId || undefined,
              })),
            }));
            
            console.log("Setting loaded layers:", loadedLayers);
            setLayers(loadedLayers);
            
            // Set the active layer based on CurrentSelectedLayer property
            if (mapJsonData.currentlySelectedLayer && mapJsonData.currentlySelectedLayer !== "") {
              // Check if the specified layer exists by name
              const layerExists = loadedLayers.some(layer => layer.name === mapJsonData.currentlySelectedLayer);
              if (layerExists) {
                // Find the layer by name and set its ID as active
                const targetLayer = loadedLayers.find(layer => layer.name === mapJsonData.currentlySelectedLayer);
                setActiveLayerId(targetLayer?.id || 1);
              } else {
                // If the specified layer doesn't exist, default to the first layer
                setActiveLayerId(loadedLayers[0]?.id || 1);
              }
            } else {
              // Default to the first layer if CurrentSelectedLayer is null/empty
              setActiveLayerId(loadedLayers[0]?.id || 1);
            }
            
            // Update history with loaded layers
            setHistory([loadedLayers]);
            setHistoryIndex(0);
          } else {
            // Set default layers if no layers found in JSON
            console.log("No layers found in JSON, using default layers");
            const defaultLayers = [
              {
                id: 1,
                name: "Base Layer",
                visible: true,
                locked: false,
                tiles: [],
              },
            ];
            setLayers(defaultLayers);
            setHistory([defaultLayers]);
            setHistoryIndex(0);
          }
        } else {
          // Set default layers if loading failed
          const defaultLayers = [
            {
              id: 1,
              name: "Base Layer",
              visible: true,
              locked: false,
              tiles: [],
            },
          ];
          setLayers(defaultLayers);
          setHistory([defaultLayers]);
          setHistoryIndex(0);
        }
      } catch (error) {
        console.error("Error loading map data:", error);
        // Set default layers on error
        const defaultLayers = [
          {
            id: 1,
            name: "Base Layer",
            visible: true,
            locked: false,
            tiles: [],
          },
        ];
        setLayers(defaultLayers);
        setHistory([defaultLayers]);
        setHistoryIndex(0);
      }
    };

    loadMapData();
  }, [map.ID]); // Reload when map ID changes

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

  const handleEncountersChange = (type: string, encounters: any[]) => {
    switch (type) {
      case "grass":
        map.GrassEncounters = encounters;
        break;
      case "water":
        map.WaterEncounters = encounters;
        break;
      case "cave":
        map.CaveEncounters = encounters;
        break;
      case "fishing":
        map.FishingEncounters = encounters;
        break;
    }
  
    // Update local UI state
    handleMapChange({
      ...mapData,
      grassEncounters: type === "grass"
        ? map.GrassEncounters.slice()
        : mapData.grassEncounters,
      waterEncounters: type === "water"
        ? map.WaterEncounters.slice()
        : mapData.waterEncounters,
      caveEncounters: type === "cave"
        ? map.CaveEncounters.slice()
        : mapData.caveEncounters,
      fishingEncounters: type === "fishing"
        ? map.FishingEncounters.slice()
        : mapData.fishingEncounters,
    });
  }

  const handleSave = async () => {
    try {
      // Create the MapJsonData structure from current state
      const mapJsonData = {
        id: parseInt(mapData.id),
        name: mapData.name,
        width: mapData.width,
        height: mapData.height,
        tileSize: mapData.tileSize,
        type: mapData.type,
        tilesetPath: mapData.tileset,
        layers: layers.map(layer => ({
          id: layer.id,
          name: layer.name,
          visible: layer.visible,
          locked: layer.locked,
          tiles: layer.tiles.map(tile => ({
            x: tile.x,
            y: tile.y,
            tileId: tile.tileId,
            autoTileId: tile.autoTileId || "",
          })),
        })),
        mapEncounters: {
          grass: mapData.grassEncounters,
          fishing: mapData.fishingEncounters,
          cave: mapData.caveEncounters,
          diving: mapData.waterEncounters,
        },
        properties: {
          music: mapData.properties.music,
        },
        currentlySelectedLayer: layers.find(layer => layer.id === activeLayerId)?.name || "",
      };

      const result = await UpdateMapJson(models.MapJsonData.createFrom(mapJsonData));
      const resultToml = await UpdateTomlMapEntryByID(map);
      if (result.success && resultToml.success) {
        console.log("Map saved successfully:", result.message);
        // You could add a toast notification here
      } else {
        console.error("Failed to save map:", result.errorMessage);
        // You could add an error toast notification here
      }
    } catch (error) {
      console.error("Error saving map:", error);
      // You could add an error toast notification here
    }
  };

  const renderViewTabs = () => (
    <div className="flex space-x-2">
      <Button
        variant={activeView === "map" ? "default" : "ghost"}
        onClick={() => setActiveView("map")}
      >
        <Map className="h-4 w-4 mr-2" />
        Map
      </Button>
      {/* <Button
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
      </Button> */}
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
      // case "permissions":
      //   return (
      //       <PermissionView
      //     width={mapData.width}
      //     height={mapData.height}
      //     tileSize={mapData.tileSize}
      //     layers={layers}
      //     permissions={mapData.permissions}
      //     setPermissions={handlePermissionsChange}
      //   />
      // )
      // case "npcs":
      //   return (
      //     <NPCView
      //       width={mapData.width}
      //       height={mapData.height}
      //       tileSize={mapData.tileSize}
      //       layers={layers}
      //       npcs={mapData.npcs}
      //       setNPCs={handleNPCsChange}
      //     />
      //   )
      case "encounters":
        return (
          <EncounterView
            grassEncounters={mapData.grassEncounters}
            waterEncounters={mapData.waterEncounters}
            caveEncounters={mapData.caveEncounters}
            fishingEncounters={mapData.fishingEncounters}
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
        <Button
          onClick={handleSave}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Map
        </Button>
      </div>

      <div className="flex-1 flex" style={{ minWidth: 0 }}>
        {/* Left Sidebar - Tile Palette */}
        <div className="h-full flex flex-col justify-stretch">
          <TilePalette
            selectedTile={selectedTile}
            setSelectedTile={setSelectedTile}
            tilesetPath={mapData.tileset}
            tileSize={mapData.tileSize}
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