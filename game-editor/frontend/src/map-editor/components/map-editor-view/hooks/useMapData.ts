import { useState, useCallback } from "react";
import { GetMapTomlByID, ParseMapData } from "../../../../../bindings/github.com/zenith110/pokemon-engine-tools/parsing/ParsingApp";

export interface MapData {
  id: string;
  name: string;
  width: number;
  height: number;
  tileSize: number;
  type: string;
  tileset: string;
  music: string;
  permissions: any[];
  npcs: any[];
  grassEncounters: any[];
  waterEncounters: any[];
  caveEncounters: any[];
  fishingEncounters: any[];
  properties: {
    encounterRate: number;
    music: string;
    description: string;
  };
}

export const useMapData = (map: any, markUnsavedChanges?: () => void) => {
  const [mapData, setMapData] = useState<MapData>({
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

  const loadMapData = useCallback(async () => {
    console.log("=== LOADING MAP DATA ===");
    console.log("Loading map data for map ID:", map.ID);
    console.log("Map name:", map.Name);
    
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
        console.log("No JSON file path found, returning null for layers");
        return null;
      }

      const result = await ParseMapData(jsonFilePath);
      
      console.log("ParseMapData result:", result);
      
      if (result.success && result.data) {
        const mapJsonData = result.data as any;
        console.log("Map JSON data:", mapJsonData);
        
        // Return layers data from JSON
        if (mapJsonData.layers && mapJsonData.layers.length > 0) {
          const loadedLayers = mapJsonData.layers.map((layer: any) => ({
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
          return {
            layers: loadedLayers,
            currentLayerName: mapJsonData.CurrentSelectedLayer || mapJsonData.currentlySelectedLayer || ""
          };
        }
      } else {
        console.error("Failed to parse map data:", result.errorMessage);
      }
    } catch (error) {
      console.error("Error loading map data:", error);
    }
    
    return null;
  }, [map.ID]);

  const handleMapChange = useCallback((updatedMapData: MapData, onMapChange: (map: any) => void) => {
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
    
    // Mark as having unsaved changes
    markUnsavedChanges?.();
  }, [map, markUnsavedChanges]);

  const handleEncountersChange = useCallback((type: string, encounters: any[], onMapChange: (map: any) => void) => {
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
    
    // Mark as having unsaved changes
    markUnsavedChanges?.();
  }, [map, markUnsavedChanges]);

  const handleSettingsChange = useCallback((settings: {
    name: string;
    width: number;
    height: number;
    tileSize: number;
    type: string;
    music: string;
  }, onMapChange: (map: any) => void) => {
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

    // Update the Go model - preserve filePath but update it if name changes
    const currentFilePath = map.Properties?.[0]?.FilePath || "";
    const newFilePath = settings.name !== map.Name 
      ? `data/assets/maps/${settings.name}.json` 
      : currentFilePath;
    
    const updatedMap = {
      ...map,
      Name: settings.name,
      Width: settings.width,
      Height: settings.height,
      Properties: [{
        ...map.Properties?.[0],
        FilePath: newFilePath, // Update filePath if name changed
        TypeOfMap: settings.type,
        BgMusic: settings.music,
      }]
    };

    // Call the parent callback
    onMapChange(updatedMap);
    
    // Mark as having unsaved changes
    markUnsavedChanges?.();
  }, [map, markUnsavedChanges]);

  return {
    mapData,
    setMapData,
    loadMapData,
    handleMapChange,
    handleEncountersChange,
    handleSettingsChange,
  };
}; 