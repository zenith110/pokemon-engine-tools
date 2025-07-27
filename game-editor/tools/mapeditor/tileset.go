package mapeditor

import (
	"encoding/base64"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"time"

	"encoding/json"
	"image"
	"sync"

	"github.com/pelletier/go-toml/v2"
	"github.com/wailsapp/wails/v3/pkg/application"
	coreModels "github.com/zenith110/pokemon-engine-tools/models"
	core "github.com/zenith110/pokemon-engine-tools/tools-core"
)

// MapEditorApp struct for tileset operations
type MapEditorApp struct {
	app      *core.App
	wailsApp *application.App
}

// RenderProgress tracks the progress of map rendering
type RenderProgress struct {
	Current   int    `json:"current"`
	Total     int    `json:"total"`
	Message   string `json:"message"`
	Success   bool   `json:"success"`
	Timestamp int64  `json:"timestamp"`
	ImageData string `json:"imageData,omitempty"`
}

// Global render progress tracking
var (
	renderProgressMutex   sync.RWMutex
	currentRenderProgress RenderProgress
	isRendering           bool
)

// NewMapEditorApp creates a new MapEditorApp struct
func NewMapEditorApp(app *core.App) *MapEditorApp {
	return &MapEditorApp{
		app: app,
	}
}

// SetWailsApp sets the Wails application instance for event emission
func (a *MapEditorApp) SetWailsApp(wailsApp *application.App) {
	a.wailsApp = wailsApp
}

// RenderMap renders the map using Go backend
func (a *MapEditorApp) RenderMap(req RenderRequest) map[string]any {
	// Start rendering in background
	go a.renderMapInBackground(req)

	return map[string]any{
		"success": true,
		"message": "Map rendering started",
	}
}

// GetRenderProgress returns the current render progress
func (a *MapEditorApp) GetRenderProgress() map[string]any {
	renderProgressMutex.RLock()
	defer renderProgressMutex.RUnlock()

	return map[string]any{
		"success":     currentRenderProgress.Success,
		"current":     currentRenderProgress.Current,
		"total":       currentRenderProgress.Total,
		"message":     currentRenderProgress.Message,
		"timestamp":   currentRenderProgress.Timestamp,
		"isRendering": isRendering,
		"imageData":   currentRenderProgress.ImageData,
	}
}

// updateRenderProgress updates the render progress and emits an event
func (a *MapEditorApp) updateRenderProgress(current int, total int, message string, imageData string) {
	renderProgressMutex.Lock()
	currentRenderProgress = RenderProgress{
		Current:   current,
		Total:     total,
		Message:   message,
		Success:   true,
		Timestamp: time.Now().Unix(),
		ImageData: imageData,
	}
	renderProgressMutex.Unlock()

	// Emit progress event to frontend using Wails v3
	if a.wailsApp != nil {
		progressData, _ := json.Marshal(currentRenderProgress)
		a.wailsApp.Event.Emit("map-render-progress", string(progressData))
	}
}

// renderMapInBackground handles the actual map rendering with progress updates
func (a *MapEditorApp) renderMapInBackground(req RenderRequest) {
	// Add timeout protection for the entire rendering process
	done := make(chan bool, 1)

	go func() {
		// Initialize render progress
		renderProgressMutex.Lock()
		currentRenderProgress = RenderProgress{
			Current:   0,
			Total:     100, // Use percentage-based progress
			Message:   "Starting map rendering...",
			Success:   true,
			Timestamp: time.Now().Unix(),
		}
		isRendering = true
		renderProgressMutex.Unlock()

		// Send initial progress
		a.updateRenderProgress(0, 100, "Starting map rendering...", "")

		// Perform actual rendering
		response := renderMap(req)

		if response.Success {
			fmt.Printf("RenderMap returned success, imageData length: %d\n", len(response.ImageData))
			if len(response.ImageData) > 0 {
				fmt.Printf("ImageData preview: %s...\n", response.ImageData[:100])
			} else {
				fmt.Printf("WARNING: ImageData is empty!\n")
			}

			// Send completion with image data
			a.updateRenderProgress(100, 100, "Map rendering completed successfully", response.ImageData)

			// Mark as not rendering
			renderProgressMutex.Lock()
			isRendering = false
			renderProgressMutex.Unlock()

			// Emit completion event with the rendered map data
			if a.wailsApp != nil {
				eventData := map[string]any{
					"success":   true,
					"imageData": response.ImageData,
					"message":   "Map rendering completed successfully",
				}
				fmt.Printf("Emitting map-render-complete event with imageData length: %d\n", len(response.ImageData))
				a.wailsApp.Event.Emit("map-render-complete", eventData)
			}

			fmt.Printf("Map rendering completed successfully\n")
		} else {
			fmt.Printf("RenderMap failed: %s\n", response.Error)

			// Send error
			a.updateRenderProgress(0, 100, "Map rendering failed: "+response.Error, "")

			// Mark as not rendering
			renderProgressMutex.Lock()
			isRendering = false
			renderProgressMutex.Unlock()

			// Emit error event
			if a.wailsApp != nil {
				a.wailsApp.Event.Emit("map-render-error", map[string]any{
					"success": false,
					"error":   response.Error,
					"message": "Map rendering failed",
				})
			}

			fmt.Printf("Map rendering failed: %s\n", response.Error)
		}

		done <- true
	}()

	// Wait for rendering to complete or timeout
	select {
	case <-done:
		fmt.Printf("Rendering completed successfully\n")
	case <-time.After(60 * time.Second): // 60 second timeout
		fmt.Printf("Rendering timeout reached, forcing completion\n")

		// Mark as not rendering
		renderProgressMutex.Lock()
		isRendering = false
		renderProgressMutex.Unlock()

		// Emit timeout error event
		if a.wailsApp != nil {
			a.wailsApp.Event.Emit("map-render-error", map[string]any{
				"success": false,
				"error":   "Rendering timeout",
				"message": "Map rendering timed out after 60 seconds",
			})
		}
	}
}

// StampTile places a tile stamp using Go backend
func (a *MapEditorApp) StampTile(req StampRequest) StampResponse {
	return stampTile(req)
}

// ClearTileCache clears the tile cache to free memory
func (a *MapEditorApp) ClearTileCache() map[string]any {
	tileCache = make(map[string]image.Image)
	return map[string]any{
		"success": true,
		"message": "Tile cache cleared",
	}
}

func (a *MapEditorApp) CreateTilesetImage(fileName string) map[string]any {
	// For now, return a simple response since we removed the file dialog
	// TODO: Implement file dialog using Wails v3 approach
	return map[string]any{
		"success":      false,
		"errorMessage": "File dialog not implemented yet - using Wails v3",
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
