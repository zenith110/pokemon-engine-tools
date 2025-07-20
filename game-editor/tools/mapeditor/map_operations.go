package mapeditor

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"

	"github.com/pelletier/go-toml/v2"
	coreModels "github.com/zenith110/pokemon-engine-tools/models"
)

func (a *MapEditorApp) CreateMap(mapData coreModels.MapEditerMapData) map[string]any {
	// Create the map JSON file
	for _, mapItem := range mapData.Map {
		// Create the JSON structure
		jsonData := coreModels.MapJsonData{
			ID:                   mapItem.ID,
			Name:                 mapItem.Name,
			Width:                mapItem.Width,
			Height:               mapItem.Height,
			TileSize:             mapItem.TileSize,
			Type:                 "overworld",
			TilesetPath:          mapItem.Properties[0].TilesetImagePath,
			Layers:               []coreModels.MapLayer{},
			CurrentSelectedLayer: "Base Layer",
			MapEncounters: coreModels.MapEncounters{
				Grass:   []coreModels.MapEncounter{},
				Fishing: []coreModels.FishingEncounter{},
				Cave:    []coreModels.MapEncounter{},
				Diving:  []coreModels.MapEncounter{},
			},
			Properties: coreModels.MapProperties{
				Music: mapItem.Properties[0].BgMusic,
			},
		}

		// Convert encounters
		for _, encounter := range mapItem.GrassEncounters {
			jsonData.MapEncounters.Grass = append(jsonData.MapEncounters.Grass, coreModels.MapEncounter{
				Name:             encounter.Name,
				ID:               encounter.ID,
				MinLevel:         encounter.MinLevel,
				MaxLevel:         encounter.MaxLevel,
				Rarity:           encounter.Rarity,
				Shiny:            encounter.Shiny,
				TimeOfDayToCatch: encounter.TimeOfDayToCatch,
			})
		}

		for _, encounter := range mapItem.WaterEncounters {
			jsonData.MapEncounters.Diving = append(jsonData.MapEncounters.Diving, coreModels.MapEncounter{
				Name:             encounter.Name,
				ID:               encounter.ID,
				MinLevel:         encounter.MinLevel,
				MaxLevel:         encounter.MaxLevel,
				Rarity:           encounter.Rarity,
				Shiny:            encounter.Shiny,
				TimeOfDayToCatch: encounter.TimeOfDayToCatch,
			})
		}

		for _, encounter := range mapItem.CaveEncounters {
			jsonData.MapEncounters.Cave = append(jsonData.MapEncounters.Cave, coreModels.MapEncounter{
				Name:             encounter.Name,
				ID:               encounter.ID,
				MinLevel:         encounter.MinLevel,
				MaxLevel:         encounter.MaxLevel,
				Rarity:           encounter.Rarity,
				Shiny:            encounter.Shiny,
				TimeOfDayToCatch: encounter.TimeOfDayToCatch,
			})
		}

		for _, encounter := range mapItem.FishingEncounters {
			jsonData.MapEncounters.Fishing = append(jsonData.MapEncounters.Fishing, coreModels.FishingEncounter{
				Name:             encounter.Name,
				ID:               encounter.ID,
				MinLevel:         encounter.MinLevel,
				MaxLevel:         encounter.MaxLevel,
				Rarity:           encounter.Rarity,
				Shiny:            encounter.Shiny,
				TimeOfDayToCatch: encounter.TimeOfDayToCatch,
				HighestRod:       encounter.HighestRod,
			})
		}

		// Create default layers
		jsonData.Layers = append(jsonData.Layers, coreModels.MapLayer{
			ID:      1,
			Name:    "Base Layer",
			Visible: true,
			Locked:  false,
			Tiles:   []coreModels.MapTile{},
		})

		// Marshal to JSON
		jsonBytes, err := json.MarshalIndent(jsonData, "", "  ")
		if err != nil {
			return map[string]any{
				"success":      false,
				"errorMessage": fmt.Errorf("error marshaling map JSON: %w", err),
			}
		}

		// Create the file path
		jsonFilePath := fmt.Sprintf("%s/data/assets/maps/%s.json", a.app.DataDirectory, mapItem.Name)

		// Ensure directory exists
		jsonDir := filepath.Dir(jsonFilePath)
		if err := os.MkdirAll(jsonDir, 0755); err != nil {
			return map[string]any{
				"success":      false,
				"errorMessage": fmt.Errorf("error creating JSON directory: %w", err),
			}
		}

		// Write JSON file
		if err := os.WriteFile(jsonFilePath, jsonBytes, 0644); err != nil {
			return map[string]any{
				"success":      false,
				"errorMessage": fmt.Errorf("error writing map JSON: %w", err),
			}
		}
	}

	// Update the TOML file
	mapTomlPath := fmt.Sprintf("%s/data/toml/maps.toml", a.app.DataDirectory)
	var existingData coreModels.MapEditerMapData

	file, err := os.Open(mapTomlPath)
	if err == nil {
		defer file.Close()
		fileData, err := io.ReadAll(file)
		if err == nil && len(fileData) > 0 {
			// Try to unmarshal existing data
			if err := toml.Unmarshal(fileData, &existingData); err == nil {
				// Append new data
				existingData.Map = append(existingData.Map, mapData.Map...)
			} else {
				// Bad TOML, replace with new data
				existingData = mapData
			}
		} else {
			// File is empty or unreadable, replace with new data
			existingData = mapData
		}
	} else if os.IsNotExist(err) {
		// File does not exist, use new data
		existingData = mapData
	} else {
		// Some other error opening file
		return map[string]any{
			"success":      false,
			"errorMessage": fmt.Sprintf("Error opening maps.toml: %v", err),
		}
	}

	// Marshal to TOML
	out, err := toml.Marshal(existingData)
	if err != nil {
		return map[string]any{
			"success":      false,
			"errorMessage": fmt.Sprintf("Error marshaling maps TOML: %v", err),
		}
	}

	// Ensure directory exists
	mapDir := filepath.Dir(mapTomlPath)
	if err := os.MkdirAll(mapDir, 0755); err != nil {
		return map[string]any{
			"success":      false,
			"errorMessage": fmt.Sprintf("Error creating map directory: %v", err),
		}
	}

	// Write TOML file
	if err := os.WriteFile(mapTomlPath, out, 0644); err != nil {
		return map[string]any{
			"success":      false,
			"errorMessage": fmt.Sprintf("Error writing maps TOML: %v", err),
		}
	}

	return map[string]any{
		"success": true,
		"message": fmt.Sprintf("Successfully created map: %s", mapData.Map[0].Name),
	}
}

func (a *MapEditorApp) UpdateMapJson(mapData coreModels.MapJsonData) map[string]any {
	// Create the file path
	jsonFilePath := fmt.Sprintf("%s/data/assets/maps/%s.json", a.app.DataDirectory, mapData.Name)

	// Ensure directory exists
	jsonDir := filepath.Dir(jsonFilePath)
	if err := os.MkdirAll(jsonDir, 0755); err != nil {
		return map[string]any{
			"success":      false,
			"errorMessage": fmt.Errorf("error creating JSON directory: %w", err),
		}
	}

	// Marshal to JSON
	jsonBytes, err := json.MarshalIndent(mapData, "", "  ")
	if err != nil {
		return map[string]any{
			"success":      false,
			"errorMessage": fmt.Errorf("error marshaling map JSON: %w", err),
		}
	}

	// Write JSON file
	if err := os.WriteFile(jsonFilePath, jsonBytes, 0644); err != nil {
		return map[string]any{
			"success":      false,
			"errorMessage": fmt.Errorf("error writing map JSON: %w", err),
		}
	}

	return map[string]any{
		"success": true,
		"message": fmt.Sprintf("Successfully updated map JSON file: %s", mapData.Name),
	}
}

func (a *MapEditorApp) UpdateMapJsonWithPath(mapData coreModels.MapJsonData, filePath string) map[string]any {
	// Use the provided file path
	jsonFilePath := fmt.Sprintf("%s/%s", a.app.DataDirectory, filePath)

	// Ensure directory exists
	jsonDir := filepath.Dir(jsonFilePath)
	if err := os.MkdirAll(jsonDir, 0755); err != nil {
		return map[string]any{
			"success":      false,
			"errorMessage": fmt.Errorf("error creating JSON directory: %w", err),
		}
	}

	// Marshal to JSON
	jsonBytes, err := json.MarshalIndent(mapData, "", "  ")
	if err != nil {
		return map[string]any{
			"success":      false,
			"errorMessage": fmt.Errorf("error marshaling map JSON: %w", err),
		}
	}

	// Write JSON file
	if err := os.WriteFile(jsonFilePath, jsonBytes, 0644); err != nil {
		return map[string]any{
			"success":      false,
			"errorMessage": fmt.Errorf("error writing map JSON: %w", err),
		}
	}

	return map[string]any{
		"success": true,
		"message": fmt.Sprintf("Successfully updated map JSON file: %s", filePath),
	}
}

// RenameMapFile renames a map JSON file when the map name changes
func (a *MapEditorApp) RenameMapFile(oldFilePath string, newFilePath string) map[string]any {
	oldFullPath := fmt.Sprintf("%s/%s", a.app.DataDirectory, oldFilePath)
	newFullPath := fmt.Sprintf("%s/%s", a.app.DataDirectory, newFilePath)

	// Check if old file exists
	if _, err := os.Stat(oldFullPath); os.IsNotExist(err) {
		return map[string]any{
			"success":      false,
			"errorMessage": fmt.Sprintf("Old file does not exist: %s", oldFilePath),
		}
	}

	// Ensure new directory exists
	newDir := filepath.Dir(newFullPath)
	if err := os.MkdirAll(newDir, 0755); err != nil {
		return map[string]any{
			"success":      false,
			"errorMessage": fmt.Errorf("error creating new directory: %w", err),
		}
	}

	// Rename the file
	if err := os.Rename(oldFullPath, newFullPath); err != nil {
		return map[string]any{
			"success":      false,
			"errorMessage": fmt.Errorf("error renaming file: %w", err),
		}
	}

	return map[string]any{
		"success": true,
		"message": fmt.Sprintf("Successfully renamed map file from %s to %s", oldFilePath, newFilePath),
	}
}

// CheckFileExists checks if a file exists at the given path
func (a *MapEditorApp) CheckFileExists(filePath string) map[string]any {
	fullPath := fmt.Sprintf("%s/%s", a.app.DataDirectory, filePath)

	if _, err := os.Stat(fullPath); os.IsNotExist(err) {
		return map[string]any{
			"success": false,
			"exists":  false,
			"message": fmt.Sprintf("File does not exist: %s", filePath),
		}
	}

	return map[string]any{
		"success": true,
		"exists":  true,
		"message": fmt.Sprintf("File exists: %s", filePath),
	}
}

// DeleteMapFile deletes a map JSON file
func (a *MapEditorApp) DeleteMapFile(filePath string) map[string]any {
	fullPath := fmt.Sprintf("%s/%s", a.app.DataDirectory, filePath)

	// Check if file exists
	if _, err := os.Stat(fullPath); os.IsNotExist(err) {
		return map[string]any{
			"success":      false,
			"errorMessage": fmt.Sprintf("File does not exist: %s", filePath),
		}
	}

	// Delete the file
	if err := os.Remove(fullPath); err != nil {
		return map[string]any{
			"success":      false,
			"errorMessage": fmt.Errorf("error deleting file: %w", err),
		}
	}

	return map[string]any{
		"success": true,
		"message": fmt.Sprintf("Successfully deleted file: %s", filePath),
	}
}

func (a *MapEditorApp) UpdateTomlMapEntryByID(updatedMap coreModels.Map) map[string]any {
	// Read the existing TOML file
	mapTomlPath := fmt.Sprintf("%s/data/toml/maps.toml", a.app.DataDirectory)
	var existingData coreModels.MapEditerMapData

	file, err := os.Open(mapTomlPath)
	if err != nil {
		return map[string]any{
			"success":      false,
			"errorMessage": fmt.Errorf("error opening maps.toml: %w", err),
		}
	}
	defer file.Close()

	fileData, err := io.ReadAll(file)
	if err != nil {
		return map[string]any{
			"success":      false,
			"errorMessage": fmt.Errorf("error reading maps.toml: %w", err),
		}
	}

	// Unmarshal existing data
	if len(fileData) > 0 {
		if err := toml.Unmarshal(fileData, &existingData); err != nil {
			return map[string]any{
				"success":      false,
				"errorMessage": fmt.Errorf("error parsing existing maps.toml: %w", err),
			}
		}
	}

	// Find and update the map with the specified ID
	mapFound := false
	for i, mapItem := range existingData.Map {
		if mapItem.ID == updatedMap.ID {
			// Ensure the updated map has the same ID
			existingData.Map[i] = updatedMap
			mapFound = true
			break
		}
	}

	if !mapFound {
		return map[string]any{
			"success":      false,
			"errorMessage": fmt.Sprintf("map with ID %d not found", updatedMap.ID),
		}
	}

	// Marshal and write back to TOML
	out, err := toml.Marshal(existingData)
	if err != nil {
		return map[string]any{
			"success":      false,
			"errorMessage": fmt.Errorf("error marshaling updated maps TOML: %w", err),
		}
	}

	if err := os.WriteFile(mapTomlPath, out, 0644); err != nil {
		return map[string]any{
			"success":      false,
			"errorMessage": fmt.Errorf("error writing updated maps TOML: %w", err),
		}
	}

	return map[string]any{
		"success": true,
		"message": fmt.Sprintf("Successfully updated map with ID %d", updatedMap.ID),
	}
}

func (a *MapEditorApp) DeleteMapByID(id int) map[string]any {
	mapTomlPath := fmt.Sprintf("%s/data/toml/maps.toml", a.app.DataDirectory)
	var data coreModels.MapEditerMapData
	var oldMap coreModels.Map
	// Read the file
	file, err := os.Open(mapTomlPath)
	if err != nil {
		return map[string]any{"success": false, "errorMessage": fmt.Sprintf("Error opening file: %v", err)}
	}
	defer file.Close()

	fileData, err := io.ReadAll(file)
	if err != nil {
		return map[string]any{"success": false, "errorMessage": fmt.Sprintf("Error reading file: %v", err)}
	}

	if err := toml.Unmarshal(fileData, &data); err != nil {
		return map[string]any{"success": false, "errorMessage": fmt.Sprintf("Error parsing TOML: %v", err)}
	}

	// Filter out the map with the given ID
	newMaps := make([]coreModels.Map, 0, len(data.Map))
	mapFound := false
	for _, m := range data.Map {
		if m.ID != id {
			newMaps = append(newMaps, m)
		} else {
			oldMap = m
			mapFound = true
		}
	}

	if !mapFound {
		return map[string]any{"success": false, "errorMessage": fmt.Sprintf("Map with ID %d not found", id)}
	}

	data.Map = newMaps

	// Write back to TOML
	out, err := toml.Marshal(data)
	if err != nil {
		return map[string]any{"success": false, "errorMessage": fmt.Sprintf("Error marshaling TOML: %v", err)}
	}
	if err := os.WriteFile(mapTomlPath, out, 0644); err != nil {
		return map[string]any{"success": false, "errorMessage": fmt.Sprintf("Error writing TOML: %v", err)}
	}

	// Only try to delete JSON file if map name is not empty
	if oldMap.Name != "" {
		jsonFilePath := fmt.Sprintf("%s/data/assets/maps/%s.json", a.app.DataDirectory, oldMap.Name)
		if removeJsonFileErr := os.Remove(jsonFilePath); removeJsonFileErr != nil {
			// Log the error but don't fail the operation since TOML was updated successfully
			fmt.Printf("Warning: Could not delete JSON file %s: %v\n", jsonFilePath, removeJsonFileErr)
		}
	}

	return map[string]any{"success": true}
}
