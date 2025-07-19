import { useState, useCallback } from "react";
import { UpdateMapJsonWithPath, UpdateTomlMapEntryByID, RenameMapFile } from "../../../../../wailsjs/go/mapeditor/MapEditorApp";
import { MapData } from "./useMapData";
import { MapLayer } from "./useLayers";

export const useSaveState = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleSave = useCallback(async (
    map: any,
    mapData: MapData,
    layers: MapLayer[],
    activeLayerId: number
  ) => {
    try {
      setIsSaving(true);
      
      // Get the JSON file path from the map properties
      let jsonFilePath = map.Properties?.[0]?.FilePath || "";
      const oldFilePath = jsonFilePath;
      
      // If the map name has changed, update the file path
      if (mapData.name !== map.Name) {
        jsonFilePath = `data/assets/maps/${mapData.name}.json`;
      }
      
      if (!jsonFilePath) {
        console.error("No JSON file path found for map");
        return;
      }

      // Create the MapJsonData structure from current state - use correct lowercase field names for Go models
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

      // Handle file renaming if map name changed
      if (mapData.name !== map.Name && oldFilePath !== jsonFilePath) {
        const renameResult = await RenameMapFile(oldFilePath, jsonFilePath);
        if (!renameResult.success) {
          console.error("Failed to rename map file:", renameResult.errorMessage);
          // Continue with save even if rename fails
        }
      }
      
      // Save to the correct JSON file path using the file path from map properties
      const result = await UpdateMapJsonWithPath(mapJsonData as any, jsonFilePath);
      
      // Create updated map object with current data for TOML update
      const updatedMapForToml = {
        ...map,
        Name: mapData.name,
        Width: mapData.width,
        Height: mapData.height,
        Properties: [{
          ...map.Properties?.[0],
          FilePath: jsonFilePath, // Ensure filePath is updated
          TypeOfMap: mapData.type,
          TilesetImagePath: mapData.tileset,
          BgMusic: mapData.properties?.music || "",
          Description: mapData.properties?.description || ""
        }],
        GrassEncounters: mapData.grassEncounters,
        WaterEncounters: mapData.waterEncounters,
        CaveEncounters: mapData.caveEncounters,
        FishingEncounters: mapData.fishingEncounters,
      };
      
      const resultToml = await UpdateTomlMapEntryByID(updatedMapForToml);
      
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
  }, []);

  const markUnsavedChanges = useCallback(() => {
    setHasUnsavedChanges(true);
  }, []);

  const clearUnsavedChanges = useCallback(() => {
    setHasUnsavedChanges(false);
  }, []);

  return {
    isSaving,
    showSavedMessage,
    hasUnsavedChanges,
    handleSave,
    markUnsavedChanges,
    clearUnsavedChanges,
  };
}; 