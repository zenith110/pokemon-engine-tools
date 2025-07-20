package mapeditor

import (
	"encoding/base64"
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

// MapEditorApp struct for tileset operations
type MapEditorApp struct {
	app *core.App
}

// NewMapEditorApp creates a new MapEditorApp struct
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
			"errorMessage": fmt.Sprintf("Error opening tilesets.toml: %v", err),
		}
	}

	// Marshal to TOML
	out, err := toml.Marshal(existingTileset)
	if err != nil {
		return map[string]any{
			"success":      false,
			"errorMessage": fmt.Sprintf("Error marshaling tileset TOML: %v", err),
		}
	}

	// Ensure directory exists
	tilesetDir := filepath.Dir(tilesetTomlPath)
	if err := os.MkdirAll(tilesetDir, 0755); err != nil {
		return map[string]any{
			"success":      false,
			"errorMessage": fmt.Sprintf("Error creating tileset directory: %v", err),
		}
	}

	// Write TOML file
	if err := os.WriteFile(tilesetTomlPath, out, 0644); err != nil {
		return map[string]any{
			"success":      false,
			"errorMessage": fmt.Sprintf("Error writing tileset TOML: %v", err),
		}
	}

	return map[string]any{
		"success": true,
		"message": fmt.Sprintf("Successfully created tileset: %s", createNewTilesetData.NameOfTileset),
	}
}
