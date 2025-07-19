package mapeditor

import (
	"encoding/json"
	"fmt"
	"image"
	"sync"
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// RenderMap renders the map using Go backend and sends data via SSE
func (a *MapEditorApp) RenderMap(req RenderRequest) map[string]any {
	// Start rendering in background with SSE updates
	go a.renderMapInBackground(req)

	return map[string]any{
		"success": true,
		"message": "Map rendering started",
	}
}

// RenderMapWithProgress renders the map with SSE progress updates
func (a *MapEditorApp) RenderMapWithProgress(req RenderRequest) map[string]any {
	// Start rendering in background with progress updates
	go a.renderMapInBackground(req)

	return map[string]any{
		"success": true,
		"message": "Map rendering started",
	}
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

	// Emit progress event to frontend
	progressData, _ := json.Marshal(currentRenderProgress)
	runtime.EventsEmit(a.app.Ctx, "map-render-progress", string(progressData))
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

		// Perform actual rendering with SSE events
		response := renderMap(req, a.app.Ctx)

		if response.Success {
			fmt.Printf("RenderMap returned success, imageData length: %d\n", len(response.ImageData))
			if len(response.ImageData) > 0 {
				fmt.Printf("ImageData preview: %s...\n", response.ImageData[:100])
			} else {
				fmt.Printf("WARNING: ImageData is empty!\n")
			}

			// Send completion with image data via SSE
			a.updateRenderProgress(100, 100, "Map rendering completed successfully", response.ImageData)

			// Mark as not rendering
			renderProgressMutex.Lock()
			isRendering = false
			renderProgressMutex.Unlock()

			// Emit completion event with the rendered map data
			eventData := map[string]any{
				"success":   true,
				"imageData": response.ImageData,
				"message":   "Map rendering completed successfully",
			}
			fmt.Printf("Emitting map-render-complete event with imageData length: %d\n", len(response.ImageData))
			runtime.EventsEmit(a.app.Ctx, "map-render-complete", eventData)

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
			runtime.EventsEmit(a.app.Ctx, "map-render-error", map[string]any{
				"success": false,
				"error":   response.Error,
				"message": "Map rendering failed",
			})

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
		runtime.EventsEmit(a.app.Ctx, "map-render-error", map[string]any{
			"success": false,
			"error":   "Rendering timeout",
			"message": "Map rendering timed out after 60 seconds",
		})
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

// PreloadProgress tracks the progress of tile preloading
type PreloadProgress struct {
	Current   int    `json:"current"`
	Total     int    `json:"total"`
	Message   string `json:"message"`
	Success   bool   `json:"success"`
	Timestamp int64  `json:"timestamp"`
}

// Global progress tracking
var (
	preloadProgressMutex   sync.RWMutex
	currentPreloadProgress PreloadProgress
	isPreloading           bool
)

// PreloadTilesWithProgress preloads tile images with progress updates and renders the map
func (a *MapEditorApp) PreloadTilesWithProgress(tileIds []string, req RenderRequest) map[string]any {
	// Start preloading in background with progress updates
	go a.preloadTilesInBackground(tileIds, req)

	return map[string]any{
		"success": true,
		"message": "Tile preloading and map rendering started",
	}
}

// GetPreloadProgress returns the current preload progress
func (a *MapEditorApp) GetPreloadProgress() map[string]any {
	preloadProgressMutex.RLock()
	defer preloadProgressMutex.RUnlock()

	return map[string]any{
		"success":      currentPreloadProgress.Success,
		"current":      currentPreloadProgress.Current,
		"total":        currentPreloadProgress.Total,
		"message":      currentPreloadProgress.Message,
		"timestamp":    currentPreloadProgress.Timestamp,
		"isPreloading": isPreloading,
	}
}

// updateProgress updates the progress and emits an event
func (a *MapEditorApp) updateProgress(current int, total int, message string) {
	preloadProgressMutex.Lock()
	currentPreloadProgress = PreloadProgress{
		Current:   current,
		Total:     total,
		Message:   message,
		Success:   true,
		Timestamp: time.Now().Unix(),
	}
	preloadProgressMutex.Unlock()

	// Emit progress event to frontend
	progressData, _ := json.Marshal(currentPreloadProgress)
	runtime.EventsEmit(a.app.Ctx, "tile-preload-progress", string(progressData))
}

// preloadTilesInBackground handles the actual tile preloading with progress updates
func (a *MapEditorApp) preloadTilesInBackground(tileIds []string, req RenderRequest) {
	// Set preloading state
	preloadProgressMutex.Lock()
	isPreloading = true
	preloadProgressMutex.Unlock()

	totalTiles := len(tileIds)

	// Initialize progress
	a.updateProgress(0, totalTiles, "Starting tile preloading and map rendering...")

	// Preload tiles in batches for better performance
	batchSize := 10
	for i := 0; i < totalTiles; i += batchSize {
		end := i + batchSize
		if end > totalTiles {
			end = totalTiles
		}

		batch := tileIds[i:end]

		// Preload batch of tiles
		for _, tileId := range batch {
			// Safe slice for preview (avoid panic on short strings)
			preview := tileId
			if len(tileId) > 50 {
				preview = tileId[:50] + "..."
			}

			fmt.Printf("DEBUG: Processing tile during preloading: %s (length: %d)\n", preview, len(tileId))

			// Validate tile data before attempting to load
			if len(tileId) == 0 {
				fmt.Printf("Skipping empty tile during preloading\n")
				continue
			}

			// Skip tiles that are too short to be valid PNG images
			if len(tileId) < 500 {
				fmt.Printf("Skipping tile during preloading - data too short (%d chars, minimum 500 required)\n", len(tileId))
				continue
			}

			fmt.Printf("DEBUG: Tile passed validation, attempting to load\n")

			// Load tile into cache with timeout protection
			tileChan := make(chan struct {
				img image.Image
				err error
			}, 1)

			go func(tid string) {
				fmt.Printf("DEBUG: Starting loadTileImage in goroutine for tile: %s\n", preview)
				img, loadErr := loadTileImage(tid)
				fmt.Printf("DEBUG: loadTileImage completed for tile: %s, error: %v\n", preview, loadErr)
				tileChan <- struct {
					img image.Image
					err error
				}{img, loadErr}
			}(tileId)

			// Wait for tile loading with timeout
			select {
			case result := <-tileChan:
				if result.err != nil {
					fmt.Printf("Failed to preload tile %s: %v\n", preview, result.err)
				} else {
					fmt.Printf("Preloaded tile: %s\n", preview)
				}
			case <-time.After(2 * time.Second): // 2 second timeout for preloading
				fmt.Printf("Preload timeout for tile %s - skipping\n", preview)
			}
		}

		// Update progress
		progress := end
		message := fmt.Sprintf("Preloading tiles... (%d/%d)", progress, totalTiles)
		a.updateProgress(progress, totalTiles, message)

		// Small delay to prevent overwhelming the system
		time.Sleep(10 * time.Millisecond)
	}

	// After preloading tiles, render the map using SSE
	a.updateProgress(totalTiles, totalTiles, "Tiles preloaded, starting map rendering...")

	fmt.Printf("DEBUG: About to emit tile-preload-complete event\n")

	// Emit completion event
	runtime.EventsEmit(a.app.Ctx, "tile-preload-complete", map[string]any{
		"success": true,
		"total":   totalTiles,
		"message": "Tile preloading completed, map rendering started",
	})

	fmt.Printf("DEBUG: tile-preload-complete event emitted\n")
	fmt.Printf("Tile preloading completed, map rendering started\n")

	// Use the SSE-enabled rendering instead of direct renderMap call
	// Don't use goroutine here - let the rendering complete before marking preloading as done
	a.renderMapInBackground(req)

	// Mark preloading as complete after rendering is done
	preloadProgressMutex.Lock()
	isPreloading = false
	preloadProgressMutex.Unlock()
}

// RenderMapAfterPreload renders the map after tile preloading is complete
func (a *MapEditorApp) RenderMapAfterPreload(req RenderRequest) map[string]any {
	// Start rendering in background with progress updates
	go a.renderMapAfterPreloadInBackground(req)

	return map[string]any{
		"success": true,
		"message": "Map rendering started after preloading",
	}
}

// renderMapAfterPreloadInBackground handles map rendering after preloading
func (a *MapEditorApp) renderMapAfterPreloadInBackground(req RenderRequest) {
	// Initialize render progress
	renderProgressMutex.Lock()
	currentRenderProgress = RenderProgress{
		Current:   0,
		Total:     100, // Use percentage-based progress
		Message:   "Starting map rendering after preloading...",
		Success:   true,
		Timestamp: time.Now().Unix(),
	}
	isRendering = true
	renderProgressMutex.Unlock()

	// Send initial progress
	a.updateRenderProgress(0, 100, "Starting map rendering after preloading...", "")

	// Perform actual rendering with SSE events
	response := renderMap(req, a.app.Ctx)

	if response.Success {
		// Send completion with image data
		a.updateRenderProgress(100, 100, "Map rendering completed successfully", response.ImageData)

		// Mark as not rendering
		renderProgressMutex.Lock()
		isRendering = false
		renderProgressMutex.Unlock()

		// Emit completion event
		runtime.EventsEmit(a.app.Ctx, "map-render-complete", map[string]any{
			"success":   true,
			"imageData": response.ImageData,
			"message":   "Map rendering completed successfully",
		})

		fmt.Printf("Map rendering completed successfully after preloading\n")
	} else {
		// Send error
		a.updateRenderProgress(0, 100, "Map rendering failed: "+response.Error, "")

		// Mark as not rendering
		renderProgressMutex.Lock()
		isRendering = false
		renderProgressMutex.Unlock()

		// Emit error event
		runtime.EventsEmit(a.app.Ctx, "map-render-error", map[string]any{
			"success": false,
			"error":   response.Error,
			"message": "Map rendering failed",
		})

		fmt.Printf("Map rendering failed after preloading: %s\n", response.Error)
	}
}
