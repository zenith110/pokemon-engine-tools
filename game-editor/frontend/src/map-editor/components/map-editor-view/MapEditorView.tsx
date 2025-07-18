import { useState, useEffect, useCallback } from "react";
import { models } from "../../../../wailsjs/go/models";
import { GetMapTomlByID, ParseMapData } from "../../../../wailsjs/go/parsing/ParsingApp";
import { UpdateMapJsonWithPath, UpdateTomlMapEntryByID } from "../../../../wailsjs/go/mapeditor/MapEditorApp";
import type { SelectedTile } from "../TilePalette";
import { TOMLEncounter } from "../../types";
import MapEditorHeader from "./MapEditorHeader";
import MapEditorToolbar from "./MapEditorToolbar";
import MapEditorSidebar from "./MapEditorSidebar";
import MapEditorMain from "./MapEditorMain";
import { Loader2 } from "lucide-react";


type ViewMode = "map" | "encounters" | "settings";

interface MapEditorViewProps {
  map: any; // models.Map from Go backend
  onMapChange: (map: any) => void; // models.Map from Go backend
  onBack: () => void;
}

const MapEditorView = ({ map, onMapChange, onBack }: MapEditorViewProps) => {
  // State for map data
  const [mapData, setMapData] = useState({
    id: map.ID?.toString() || "1",
    name: map.Name || "Untitled Map",
    width: map.Width || 20,
    height: map.Height || 20,
    tileSize: 16,
    type: map.Properties?.[0]?.TypeOfMap || "Overworld",
    tileset: map.Properties?.[0]?.TilesetImagePath || "",
    music: map.Properties?.[0]?.BgMusic || "",
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
  });

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

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [mapConnections, setMapConnections] = useState<Array<{
    direction: "up" | "down" | "left" | "right";
    mapId: number;
    mapName: string;
  }>>([]);

  // Load map data from JSON file
  useEffect(() => {
    const loadMapData = async () => {
              console.log("Loading map data for map ID:", map.ID);
      setIsLoading(true);
      try {
        const mapToml = await GetMapTomlByID(map.ID);

        
        // Update mapData with TOML encounter data
        if (mapToml) {
          setMapData(prev => ({
            ...prev,
            grassEncounters: mapToml.GrassEncounters || [],
            waterEncounters: mapToml.WaterEncounters || [],
            caveEncounters: mapToml.CaveEncounters || [],
            fishingEncounters: mapToml.FishingEncounters || [],
          }));
        }
        
        // Get the JSON file path from the map properties
        const jsonFilePath = map.Properties?.[0]?.FilePath || "";
        console.log("JSON file path:", jsonFilePath);
        
        if (!jsonFilePath) {
          console.log("No JSON file path found, setting default layers");
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
        
        console.log("ParseMapData result:", result);
        
        if (result.success && result.data) {
          const mapJsonData = result.data as any;
          
          // Update layers with data from JSON - fix field name mismatches
          if (mapJsonData.Layers && mapJsonData.Layers.length > 0) {
            const loadedLayers = mapJsonData.Layers.map((layer: any) => ({
              id: layer.ID || layer.id,
              name: layer.Name || layer.name,
              visible: layer.Visible !== undefined ? layer.Visible : (layer.visible !== undefined ? layer.visible : true),
              locked: layer.Locked !== undefined ? layer.Locked : (layer.locked !== undefined ? layer.locked : false),
              tiles: (layer.Tiles || layer.tiles || []).map((tile: any) => ({
                x: tile.X || tile.x,
                y: tile.Y || tile.y,
                tileId: tile.TileID || tile.tileId || tile.TileId,
                autoTileId: tile.AutoTileID || tile.autoTileId || tile.AutoTileId || undefined,
              })),
            }));
            
            console.log("Loaded layers:", loadedLayers);
            setLayers(loadedLayers);
            
            // Set the active layer based on CurrentSelectedLayer property
            const currentLayerName = mapJsonData.CurrentSelectedLayer || mapJsonData.currentlySelectedLayer || "";
            
            if (currentLayerName && currentLayerName !== "") {
              // Check if the specified layer exists by name
              const layerExists = loadedLayers.some(layer => layer.name === currentLayerName);
              if (layerExists) {
                // Find the layer by name and set its ID as active
                const targetLayer = loadedLayers.find(layer => layer.name === currentLayerName);
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
          console.error("Failed to parse map data:", result.errorMessage);
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
      } finally {
        setIsLoading(false);
      }
    };

    loadMapData();
  }, [map.ID]); // Reload when map ID changes

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Reset save state on unmount
      setShowSavedMessage(false);
      setHasUnsavedChanges(false);
    };
  }, []);

  const [activeView, setActiveView] = useState<ViewMode>("map");
  const [selectedTile, setSelectedTile] = useState<SelectedTile | null>(null);
  const [selectedAutoTile, setSelectedAutoTile] = useState<{ id: string; name: string; image: string } | null>(null);
  const [activeLayerId, setActiveLayerId] = useState<number>(1);
  const [paintMode, setPaintMode] = useState<'stamp' | 'fill' | 'remove'>('stamp');

  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true);
      
      // Get the JSON file path from the map properties
      const jsonFilePath = map.Properties?.[0]?.FilePath || "";
      if (!jsonFilePath) {
        console.error("No JSON file path found for map");
        return;
      }

      // Create the MapJsonData structure from current state - use correct field names for Go models
      const mapJsonData = {
        ID: parseInt(mapData.id),
        Name: mapData.name,
        Width: mapData.width,
        Height: mapData.height,
        TileSize: mapData.tileSize,
        Type: mapData.type,
        TilesetPath: mapData.tileset,
        Layers: layers.map(layer => ({
          ID: layer.id,
          Name: layer.name,
          Visible: layer.visible,
          Locked: layer.locked,
          Tiles: layer.tiles.map(tile => ({
            X: tile.x,
            Y: tile.y,
            TileID: tile.tileId,
            AutoTileID: tile.autoTileId || "",
          })),
        })),
        MapEncounters: {
          Grass: mapData.grassEncounters.map(encounter => ({
            Name: encounter.Name,
            ID: encounter.ID,
            MinLevel: encounter.MinLevel,
            MaxLevel: encounter.MaxLevel,
            Rarity: encounter.Rarity,
            Shiny: encounter.Shiny,
            TimeOfDayToCatch: encounter.TimeOfDayToCatch || "Morning",
          })),
          Fishing: mapData.fishingEncounters.map(encounter => ({
            Name: encounter.Name,
            ID: encounter.ID,
            MinLevel: encounter.MinLevel,
            MaxLevel: encounter.MaxLevel,
            Rarity: encounter.Rarity,
            Shiny: encounter.Shiny,
            TimeOfDayToCatch: encounter.TimeOfDayToCatch || "Morning",
            HighestRod: encounter.HighestRod || "Old Rod",
          })),
          Cave: mapData.caveEncounters.map(encounter => ({
            Name: encounter.Name,
            ID: encounter.ID,
            MinLevel: encounter.MinLevel,
            MaxLevel: encounter.MaxLevel,
            Rarity: encounter.Rarity,
            Shiny: encounter.Shiny,
            TimeOfDayToCatch: encounter.TimeOfDayToCatch || "Morning",
          })),
          Diving: mapData.waterEncounters.map(encounter => ({
            Name: encounter.Name,
            ID: encounter.ID,
            MinLevel: encounter.MinLevel,
            MaxLevel: encounter.MaxLevel,
            Rarity: encounter.Rarity,
            Shiny: encounter.Shiny,
            TimeOfDayToCatch: encounter.TimeOfDayToCatch || "Morning",
          })),
        },
        Properties: {
          Music: mapData.properties.music,
        },
        CurrentSelectedLayer: layers.find(layer => layer.id === activeLayerId)?.name || "",
      };

      // Save to the correct JSON file path using the file path from map properties
      const result = await UpdateMapJsonWithPath(models.MapJsonData.createFrom(mapJsonData), jsonFilePath);
      const resultToml = await UpdateTomlMapEntryByID(map);
      
      if (result.success && resultToml.success) {
        console.log("Map saved successfully to:", jsonFilePath);
        setHasUnsavedChanges(false);
        
        // Show saved message for 5 seconds
        setShowSavedMessage(true);
        setTimeout(() => {
          setShowSavedMessage(false);
        }, 5000);
      } else {
        console.error("Failed to save map:", result.errorMessage);
      }
    } catch (error) {
      console.error("Error saving map:", error);
    } finally {
      setIsSaving(false);
    }
  }, [map, mapData, layers, activeLayerId]);

  

  const handleMapChange = (updatedMapData: typeof mapData) => {
    // Update local state
    setMapData(updatedMapData);
    
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
    };
    onMapChange(updatedMap);
  };

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
    // Create a single base layer with no tiles
    const baseLayer = {
      id: 1,
      name: "Base Layer",
      visible: true,
      locked: false,
      tiles: [],
    };
    
    // Update layers to only contain the base layer
    setLayers([baseLayer]);
    
    // Set the active layer to the base layer
    setActiveLayerId(1);
    
    // Update history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([baseLayer]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    // Update map data
    const clearedMapData = {
      ...mapData,
    };
    handleMapChange(clearedMapData);
  };

  // Update handleLayerChange to update both state and history
  const handleLayerChange = (newLayers: typeof layers) => {
    setLayers(newLayers);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newLayers);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    // Mark as having unsaved changes
    setHasUnsavedChanges(true);
  };

  const handleEncountersChange = (type: string, encounters: TOMLEncounter[]) => {
    // Update local state directly
    setMapData(prev => ({
      ...prev,
      grassEncounters: type === "grass" ? encounters : prev.grassEncounters,
      waterEncounters: type === "water" ? encounters : prev.waterEncounters,
      caveEncounters: type === "cave" ? encounters : prev.caveEncounters,
      fishingEncounters: type === "fishing" ? encounters : prev.fishingEncounters,
    }));
    
    // Update the Go model
    const updatedMap = {
      ...map,
      GrassEncounters: type === "grass" ? encounters : map.GrassEncounters,
      WaterEncounters: type === "water" ? encounters : map.WaterEncounters,
      CaveEncounters: type === "cave" ? encounters : map.CaveEncounters,
      FishingEncounters: type === "fishing" ? encounters : map.FishingEncounters,
    };
    
    // Call the parent callback
    onMapChange(updatedMap);
    
    // Mark as having unsaved changes when encounters change
    setHasUnsavedChanges(true);
  };

  const handleSettingsChange = (settings: {
    name: string;
    width: number;
    height: number;
    tileSize: number;
    type: string;
    music: string;
  }) => {
    // Update local state directly
    setMapData(prev => ({
      ...prev,
      name: settings.name,
      width: settings.width,
      height: settings.height,
      tileSize: settings.tileSize,
      type: settings.type,
      properties: {
        ...prev.properties,
        music: settings.music,
      },
    }));

    // Update the Go model
    const updatedMap = {
      ...map,
      Name: settings.name,
      Width: settings.width,
      Height: settings.height,
      Properties: [{
        ...map.Properties?.[0],
        TypeOfMap: settings.type,
        BgMusic: settings.music,
      }]
    };

    // Call the parent callback
    onMapChange(updatedMap);
    
    // Mark as having unsaved changes when settings change
    setHasUnsavedChanges(true);
  };




  
  return (
    <div className="min-h-screen min-w-screen flex flex-col bg-slate-950 text-white">
      <MapEditorHeader
        mapName={mapData.name}
        onBack={onBack}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Loading Map</h3>
            <p className="text-slate-400">Please wait while we load your map data...</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex" style={{ minWidth: 0 }}>
          <MapEditorSidebar
            selectedTile={selectedTile}
            setSelectedTile={setSelectedTile}
            tilesetPath={mapData.tileset}
            tileSize={mapData.tileSize}
          />

          <div className="flex-1 flex flex-col min-w-0">
            <MapEditorToolbar
              activeView={activeView}
              setActiveView={setActiveView}
              paintMode={paintMode}
              selectedTile={selectedTile}
              tileSize={mapData.tileSize}
              historyIndex={historyIndex}
              historyLength={history.length}
              undo={undo}
              redo={redo}
              setPaintMode={setPaintMode}
              clearMap={clearMap}
              currentMapId={parseInt(mapData.id)}
              currentMapName={mapData.name}
              onConnectionsChange={setMapConnections}
              existingConnections={mapConnections}
              layers={layers}
              setLayers={handleLayerChange}
              activeLayerId={activeLayerId}
              setActiveLayerId={setActiveLayerId}
              onSave={handleSave}
              hasUnsavedChanges={hasUnsavedChanges}
              isSaving={isSaving}
            />

            <div className="flex-1 flex min-w-0">
              <MapEditorMain
                activeView={activeView}
                mapData={mapData}
                layers={layers}
                selectedTile={selectedTile}
                selectedAutoTile={selectedAutoTile}
                activeLayerId={activeLayerId}
                paintMode={paintMode}
                handleLayerChange={handleLayerChange}
                handleEncountersChange={handleEncountersChange}
                handleSettingsChange={handleSettingsChange}
              />
            </div>
          </div>
        </div>
      )}

      {/* Save Alert */}
      {isSaving && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-in slide-in-from-bottom-2 duration-300">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="font-medium">Saving map...</span>
        </div>
      )}

      {/* Save Notification */}
      {showSavedMessage && !isSaving && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-in slide-in-from-bottom-2 duration-300">
          <div className="w-2 h-2 rounded-full bg-white"></div>
          <span className="text-sm font-medium">Map saved successfully</span>
        </div>
      )}

      {/* Unsaved Changes Indicator */}
      {hasUnsavedChanges && !isSaving && !showSavedMessage && (
        <div className="fixed bottom-4 right-4 bg-orange-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-in slide-in-from-bottom-2 duration-300">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
          <span className="text-sm font-medium">Unsaved changes</span>
        </div>
      )}
    </div>
  );
};

export default MapEditorView; 