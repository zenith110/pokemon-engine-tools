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
  // Convert Go model to frontend MapData structure
  const mapData = {
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
  };

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
      setIsLoading(true);
      try {
        const mapToml = await GetMapTomlByID(map.ID);
        
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
          grass: mapData.grassEncounters.map(encounter => ({
            name: encounter.Name,
            id: encounter.ID,
            minLevel: encounter.MinLevel,
            maxLevel: encounter.MaxLevel,
            rarity: encounter.Rarity,
            shiny: encounter.Shiny,
            timeOfDayToCatch: encounter.TimeOfDayToCatch || "Morning",
          })),
          fishing: mapData.fishingEncounters.map(encounter => ({
            name: encounter.Name,
            id: encounter.ID,
            minLevel: encounter.MinLevel,
            maxLevel: encounter.MaxLevel,
            rarity: encounter.Rarity,
            shiny: encounter.Shiny,
            timeOfDayToCatch: encounter.TimeOfDayToCatch || "Morning",
            highestRod: encounter.HighestRod || "Old Rod",
          })),
          cave: mapData.caveEncounters.map(encounter => ({
            name: encounter.Name,
            id: encounter.ID,
            minLevel: encounter.MinLevel,
            maxLevel: encounter.MaxLevel,
            rarity: encounter.Rarity,
            shiny: encounter.Shiny,
            timeOfDayToCatch: encounter.TimeOfDayToCatch || "Morning",
          })),
          diving: mapData.waterEncounters.map(encounter => ({
            name: encounter.Name,
            id: encounter.ID,
            minLevel: encounter.MinLevel,
            maxLevel: encounter.MaxLevel,
            rarity: encounter.Rarity,
            shiny: encounter.Shiny,
            timeOfDayToCatch: encounter.TimeOfDayToCatch || "Morning",
          })),
        },
        properties: {
          music: mapData.properties.music,
        },
        currentlySelectedLayer: layers.find(layer => layer.id === activeLayerId)?.name || "",
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
      layers: [baseLayer]
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
    // Update local mapData with new settings
    const updatedMapData = {
      ...mapData,
      name: settings.name,
      width: settings.width,
      height: settings.height,
      tileSize: settings.tileSize,
      type: settings.type,
      properties: {
        ...mapData.properties,
        music: settings.music,
      },
    };

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
    
    // Update local state
    handleMapChange(updatedMapData);
    
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