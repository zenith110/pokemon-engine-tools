package mapeditor

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"

	"github.com/pelletier/go-toml/v2"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	coreModels "github.com/zenith110/pokemon-engine-tools/models"
	core "github.com/zenith110/pokemon-engine-tools/tools-core"
)

type MapEditorApp struct {
	app *core.App
}

// NewJukeboxApp creates a new JukeboxApp struct
func NewMapEditorApp(app *core.App) *MapEditorApp {
	return &MapEditorApp{
		app: app,
	}
}

func (a *MapEditorApp) CreateTilesetImage(fileName string) map[string]any {
	tilesetPath, err := runtime.OpenFileDialog(a.app.Ctx, runtime.OpenDialogOptions{
		Title: "Select tileset .png file",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "PNG Images (*.png)",
				Pattern:     "*.png",
			},
			{
				DisplayName: "All Images (*.png, *.jpg, *.jpeg, *.gif)",
				Pattern:     "*.png;*.jpg;*.jpeg;*.gif",
			},
		},
	})
	if err != nil {
		return map[string]any{
			"success":      false,
			"errorMessage": fmt.Sprintf("Error opening file dialog: %v", err),
		}
	}

	if tilesetPath == "" {
		return map[string]any{
			"success":      false,
			"errorMessage": "No file selected",
		}
	}

	// Validate file exists
	if _, err := os.Stat(tilesetPath); os.IsNotExist(err) {
		return map[string]any{
			"success":      false,
			"errorMessage": "Selected file does not exist",
		}
	}

	// Get file info for size validation
	fileInfo, err := os.Stat(tilesetPath)
	if err != nil {
		return map[string]any{
			"success":      false,
			"errorMessage": fmt.Sprintf("Error getting file info: %v", err),
		}
	}

	// Check file size (limit to 50MB)
	const maxFileSize = 50 * 1024 * 1024 // 50MB
	if fileInfo.Size() > maxFileSize {
		return map[string]any{
			"success":      false,
			"errorMessage": fmt.Sprintf("File too large. Maximum size is %d MB", maxFileSize/(1024*1024)),
		}
	}

	// Check if file is empty
	if fileInfo.Size() == 0 {
		return map[string]any{
			"success":      false,
			"errorMessage": "Selected file is empty",
		}
	}

	// Get the original file extension
	originalFileName := filepath.Base(tilesetPath)
	ext := strings.ToLower(filepath.Ext(originalFileName))

	// Validate file extension
	allowedExtensions := []string{".png", ".jpg", ".jpeg", ".gif"}
	isValidExtension := false
	for _, allowedExt := range allowedExtensions {
		if ext == allowedExt {
			isValidExtension = true
			break
		}
	}

	if !isValidExtension {
		return map[string]any{
			"success":      false,
			"errorMessage": fmt.Sprintf("Invalid file type. Allowed: %s", strings.Join(allowedExtensions, ", ")),
		}
	}

	// Process the filename: replace spaces with underscores and add extension
	processedFileName := strings.ReplaceAll(fileName, " ", "_") + ext

	// Create assets directory if it doesn't exist
	assetsDir := filepath.Join(a.app.DataDirectory, "data/assets", "tilesets")
	if err := os.MkdirAll(assetsDir, 0755); err != nil {
		return map[string]any{
			"success":      false,
			"errorMessage": fmt.Sprintf("Error creating assets directory: %v", err),
		}
	}

	// Copy file to assets directory
	localProjectTilesetPath := filepath.Join(assetsDir, processedFileName)

	// Check if file already exists and handle accordingly
	if _, err := os.Stat(localProjectTilesetPath); err == nil {
		// File exists, generate unique name
		baseName := strings.TrimSuffix(processedFileName, ext)
		counter := 1
		for {
			newFileName := fmt.Sprintf("%s_%d%s", baseName, counter, ext)
			newPath := filepath.Join(assetsDir, newFileName)
			if _, err := os.Stat(newPath); os.IsNotExist(err) {
				processedFileName = newFileName
				localProjectTilesetPath = newPath
				break
			}
			counter++
			if counter > 1000 { // Prevent infinite loop
				return map[string]any{
					"success":      false,
					"errorMessage": "Unable to generate unique filename",
				}
			}
		}
	}

	// Copy the file
	sourceFile, err := os.Open(tilesetPath)
	if err != nil {
		return map[string]any{
			"success":      false,
			"errorMessage": fmt.Sprintf("Error opening source file: %v", err),
		}
	}
	defer sourceFile.Close()

	destFile, err := os.Create(localProjectTilesetPath)
	if err != nil {
		return map[string]any{
			"success":      false,
			"errorMessage": fmt.Sprintf("Error creating destination file: %v", err),
		}
	}
	defer destFile.Close()

	if _, err := io.Copy(destFile, sourceFile); err != nil {
		return map[string]any{
			"success":      false,
			"errorMessage": fmt.Sprintf("Error copying file: %v", err),
		}
	}

	// Verify the copied file
	if _, err := os.Stat(localProjectTilesetPath); os.IsNotExist(err) {
		return map[string]any{
			"success":      false,
			"errorMessage": "File was not copied successfully",
		}
	}

	return map[string]any{
		"success":  true,
		"fileName": processedFileName,
		"filePath": localProjectTilesetPath,
		"fileSize": fileInfo.Size(),
		"message":  "File uploaded successfully",
	}
}

func (a *MapEditorApp) GetTilesetImageData(filePath string) map[string]any {
	localFilePath := fmt.Sprintf("%s/%s", a.app.DataDirectory, filePath)
	// Validate file exists
	if _, err := os.Stat(localFilePath); os.IsNotExist(err) {
		return map[string]any{
			"success":      false,
			"errorMessage": "File does not exist",
		}
	}

	// Read file data
	fileData, err := os.ReadFile(localFilePath)
	if err != nil {
		return map[string]any{
			"success":      false,
			"errorMessage": fmt.Sprintf("Error reading file: %v", err),
		}
	}

	// Convert to base64
	base64Data := base64.StdEncoding.EncodeToString(fileData)
	dataURL := fmt.Sprintf("data:image/png;base64,%s", base64Data)

	return map[string]any{
		"success":     true,
		"imageData":   dataURL,
		"tilesetPath": localFilePath,
	}
}

func (a *MapEditorApp) CreateTileset(createNewTilesetData coreModels.CreateNewTileset) map[string]any {

	localProjectTilesetPath := fmt.Sprintf("data/assets/tilesets/%s", createNewTilesetData.FileName)
	var tilesetData coreModels.TilesetData
	tileset := coreModels.Tileset{
		TilesetWidth:       createNewTilesetData.TilesetWidth,
		TilesetHeight:      createNewTilesetData.TilesetHeight,
		Name:               createNewTilesetData.NameOfTileset,
		Path:               localProjectTilesetPath,
		TypeOfTileSet:      createNewTilesetData.TypeOfTileSet,
		TilesetDescription: createNewTilesetData.Description,
	}
	tilesetTomlPath := fmt.Sprintf("%s/data/toml/tilesets.toml", a.app.DataDirectory)
	tilesetData.Tilesets = append(tilesetData.Tilesets, tileset)
	var existingTileset coreModels.TilesetData
	file, err := os.Open(tilesetTomlPath)
	if err == nil {
		defer file.Close()
		fileData, err := io.ReadAll(file)
		if err == nil && len(fileData) > 0 {
			// Try to unmarshal existing data
			if err := toml.Unmarshal(fileData, &existingTileset); err == nil {
				// Append new data
				existingTileset.Tilesets = append(existingTileset.Tilesets, tilesetData.Tilesets...)
			} else {
				// Bad TOML, replace with new data
				existingTileset = tilesetData
			}
		} else {
			// File is empty or unreadable, replace with new data
			existingTileset = tilesetData
		}
	} else if os.IsNotExist(err) {
		// File does not exist, use new data
		existingTileset = tilesetData
	} else {
		// Some other error opening file
		return map[string]any{
			"success":      false,
			"errorMessage": fmt.Errorf("error opening tileset.toml: %w", err),
		}
	}

	// Marshal and write back
	out, err := toml.Marshal(existingTileset)
	if err != nil {
		return map[string]any{
			"success":      false,
			"errorMessage": fmt.Errorf("error marshaling tileset TOML: %w", err),
		}
	}
	if err := os.WriteFile(tilesetTomlPath, out, 0644); err != nil {
		return map[string]any{
			"success":      false,
			"errorMessage": fmt.Errorf("error writing tileset TOML: %w", err),
		}
	}
	return map[string]any{
		"success": true,
	}
}

func (a *MapEditorApp) CreateMap(mapData coreModels.MapEditerMapData) map[string]any {
	// First, create/update the TOML file as before
	mapTomlPath := fmt.Sprintf("%s/data/toml/maps.toml", a.app.DataDirectory)
	var existingMap coreModels.MapEditerMapData
	file, err := os.Open(mapTomlPath)
	if err == nil {
		defer file.Close()
		fileData, err := io.ReadAll(file)
		if err == nil && len(fileData) > 0 {
			// Try to unmarshal existing data
			if err := toml.Unmarshal(fileData, &existingMap); err == nil {
				// Append new data
				existingMap.Map = append(existingMap.Map, mapData.Map...)
			} else {
				// Bad TOML, replace with new data
				existingMap = mapData
			}
		} else {
			// File is empty or unreadable, replace with new data
			existingMap = mapData
		}
	} else if os.IsNotExist(err) {
		// File does not exist, use new data
		existingMap = mapData
	} else {
		// Some other error opening file
		return map[string]any{
			"success":      false,
			"errorMessage": fmt.Errorf("error opening maps.toml: %w", err),
		}
	}

	// Marshal and write back TOML
	out, err := toml.Marshal(existingMap)
	if err != nil {
		return map[string]any{
			"success":      false,
			"errorMessage": fmt.Errorf("error marshaling maps TOML: %w", err),
		}
	}
	if err := os.WriteFile(mapTomlPath, out, 0644); err != nil {
		return map[string]any{
			"success":      false,
			"errorMessage": fmt.Errorf("error writing maps TOML: %w", err),
		}
	}

	// Now create JSON file for each map
	for _, mapItem := range mapData.Map {
		// Create JSON data structure
		jsonData := coreModels.MapJsonData{
			ID:                   mapItem.ID,
			Name:                 mapItem.Name,
			Width:                mapItem.Width,
			Height:               mapItem.Height,
			TileSize:             mapItem.TileSize,
			Type:                 mapItem.Properties[0].TypeOfMap,
			TilesetPath:          mapItem.Properties[0].TilesetImagePath,
			CurrentSelectedLayer: "",
			Layers: []coreModels.MapLayer{
				{
					ID:      1,
					Name:    "Ground",
					Visible: true,
					Locked:  false,
					Tiles:   []coreModels.MapTile{},
				},
				{
					ID:      2,
					Name:    "Objects",
					Visible: true,
					Locked:  false,
					Tiles:   []coreModels.MapTile{},
				},
			},
		}

		jsonData.Properties.Music = mapItem.Properties[0].BgMusic

		// Create JSON file path
		jsonFilePath := fmt.Sprintf("%s/%s", a.app.DataDirectory, mapItem.Properties[0].FilePath)

		// Ensure directory exists
		jsonDir := filepath.Dir(jsonFilePath)
		if err := os.MkdirAll(jsonDir, 0755); err != nil {
			return map[string]any{
				"success":      false,
				"errorMessage": fmt.Errorf("error creating JSON directory: %w", err),
			}
		}

		// Marshal to JSON
		jsonBytes, err := json.MarshalIndent(jsonData, "", "  ")
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
	}

	return map[string]any{
		"success": true,
	}
}

func (a *MapEditorApp) UpdateMapJson(mapData coreModels.MapJsonData) map[string]any {
	// Create JSON file path - we need to construct this from the map data
	// Since MapJsonData doesn't have a file path, we'll construct it based on the map name
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
