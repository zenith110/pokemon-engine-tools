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
      
      console.log("Save operation - Original map name:", map.Name);
      console.log("Save operation - New map name:", mapData.name);
      console.log("Save operation - Old file path:", oldFilePath);
      
      // If the map name has changed, update the file path
      if (mapData.name !== map.Name) {
        jsonFilePath = `data/assets/maps/${mapData.name}.json`;
        console.log("Save operation - Map name changed, new file path:", jsonFilePath);
      } else {
        console.log("Save operation - Map name unchanged, using existing path:", jsonFilePath);
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

      // Handle file operations if map name changed
      if (mapData.name !== map.Name && oldFilePath !== jsonFilePath) {
        console.log(`Map name changed from "${map.Name}" to "${mapData.name}"`);
        console.log(`Old file path: "${oldFilePath}"`);
        console.log(`New file path: "${jsonFilePath}"`);
        
        // Only attempt operations if the old file path is not empty
        if (oldFilePath && oldFilePath.trim() !== "") {
          console.log("Attempting to rename file...");
          const renameResult = await RenameMapFile(oldFilePath, jsonFilePath);
          console.log("Rename result:", renameResult);
          
          if (!renameResult.success) {
            console.error("Failed to rename map file:", renameResult.errorMessage);
            console.log("Will create new file - old file will remain and may need manual cleanup");
            // If rename fails, we'll try to save to the new path anyway
            // The backend will create the new file if it doesn't exist
            // Note: The old file will remain and may need to be deleted manually
            // This is expected behavior when the old file doesn't exist or can't be renamed
          } else {
            console.log("Successfully renamed map file");
          }
        } else {
          console.log("No old file path to rename, will create new file");
        }
      } else {
        console.log("No rename needed - map name unchanged or file paths are the same");
      }
      
      // Save to the correct JSON file path using the file path from map properties
      console.log("Saving map to file path:", jsonFilePath);
      console.log("Map JSON data being saved:", {
        id: mapJsonData.id,
        name: mapJsonData.name,
        width: mapJsonData.width,
        height: mapJsonData.height,
        layersCount: mapJsonData.layers.length,
        encountersCount: {
          grass: mapJsonData.mapEncounters.grass.length,
          fishing: mapJsonData.mapEncounters.fishing.length,
          cave: mapJsonData.mapEncounters.cave.length,
          diving: mapJsonData.mapEncounters.diving.length,
        }
      });
      const result = await UpdateMapJsonWithPath(mapJsonData as any, jsonFilePath);
      console.log("Save result:", result);
      
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