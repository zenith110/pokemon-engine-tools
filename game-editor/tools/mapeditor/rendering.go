package mapeditor

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"image"
	"image/color"
	"image/draw"
	"image/png"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// TileCache stores loaded tile images
var tileCache = make(map[string]image.Image)

// SSE clients for progress updates
var (
	sseClients   = make(map[string]chan string)
	sseClientsMu sync.RWMutex
)

// RegisterSSEClient registers a new SSE client
func RegisterSSEClient(clientID string) {
	sseClientsMu.Lock()
	defer sseClientsMu.Unlock()
	sseClients[clientID] = make(chan string, 100)
}

// UnregisterSSEClient removes an SSE client
func UnregisterSSEClient(clientID string) {
	sseClientsMu.Lock()
	defer sseClientsMu.Unlock()
	if ch, exists := sseClients[clientID]; exists {
		close(ch)
		delete(sseClients, clientID)
	}
}

// BroadcastProgress sends progress updates to all SSE clients
func BroadcastProgress(eventType, data string) {
	sseClientsMu.RLock()
	defer sseClientsMu.RUnlock()

	message := fmt.Sprintf("event: %s\ndata: %s\n\n", eventType, data)

	for clientID, ch := range sseClients {
		select {
		case ch <- message:
			// Message sent successfully
		default:
			// Channel is full or closed, remove client
			fmt.Printf("Removing unresponsive SSE client: %s\n", clientID)
			delete(sseClients, clientID)
		}
	}
}

// SetupSSERoutes sets up the SSE routes for progress updates
func SetupSSERoutes(router *gin.Engine) {
	router.GET("/sse/progress", func(c *gin.Context) {
		clientID := c.Query("client_id")
		if clientID == "" {
			clientID = fmt.Sprintf("client_%d", time.Now().UnixNano())
		}

		// Set SSE headers
		c.Header("Content-Type", "text/event-stream")
		c.Header("Cache-Control", "no-cache")
		c.Header("Connection", "keep-alive")
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Headers", "Cache-Control")

		// Register client
		RegisterSSEClient(clientID)
		defer UnregisterSSEClient(clientID)

		// Get client channel
		sseClientsMu.RLock()
		clientChan, exists := sseClients[clientID]
		sseClientsMu.RUnlock()

		if !exists {
			c.String(http.StatusInternalServerError, "Client not found")
			return
		}

		// Send initial connection message
		c.SSEvent("connected", map[string]interface{}{
			"client_id": clientID,
			"message":   "SSE connection established",
		})

		// Stream messages to client
		for {
			select {
			case message := <-clientChan:
				c.Data(http.StatusOK, "text/event-stream", []byte(message))
				c.Writer.Flush()
			case <-c.Request.Context().Done():
				return
			}
		}
	})
}

// loadTileImage loads a tile image from base64 data
func loadTileImage(imageData string) (image.Image, error) {
	fmt.Printf("Loading tile image, data length: %d\n", len(imageData))
	fmt.Printf("DEBUG: About to check empty data\n")

	// Check for empty or invalid data
	if len(imageData) == 0 {
		fmt.Printf("Empty tile data\n")
		return nil, fmt.Errorf("empty tile data")
	}

	fmt.Printf("DEBUG: About to check data size\n")

	// Check for reasonable data size (prevent memory issues)
	if len(imageData) > 1000000 { // 1MB limit
		fmt.Printf("Tile data too large: %d bytes\n", len(imageData))
		return nil, fmt.Errorf("tile data too large: %d bytes", len(imageData))
	}

	fmt.Printf("DEBUG: About to check cache\n")

	// Check cache first
	if cached, exists := tileCache[imageData]; exists {
		fmt.Printf("Tile found in cache\n")
		return cached, nil
	}

	fmt.Printf("DEBUG: Cache miss, about to process tile\n")

	fmt.Printf("Tile not in cache, processing...\n")

	// Handle data URL format (data:image/png;base64,...)
	var base64Data string
	if strings.HasPrefix(imageData, "data:image/") {
		fmt.Printf("Processing data URL format\n")
		// Extract base64 data from data URL
		parts := strings.Split(imageData, ",")
		fmt.Printf("Split data URL into %d parts\n", len(parts))
		if len(parts) != 2 {
			fmt.Printf("Invalid data URL format - wrong number of parts: %d\n", len(parts))
			return nil, fmt.Errorf("invalid data URL format")
		}
		base64Data = parts[1]
		fmt.Printf("Extracted base64 data from data URL, length: %d\n", len(base64Data))

		// Validate base64 string
		if len(base64Data) == 0 {
			fmt.Printf("Empty base64 data\n")
			return nil, fmt.Errorf("empty base64 data")
		}

		// Check if base64 string is valid (should be multiple of 4 and contain valid characters)
		if len(base64Data)%4 != 0 {
			fmt.Printf("Invalid base64 length: %d (not multiple of 4)\n", len(base64Data))
			return nil, fmt.Errorf("invalid base64 length")
		}

		// Check for valid base64 characters
		validChars := "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
		for i, char := range base64Data {
			if !strings.ContainsRune(validChars, char) {
				fmt.Printf("Invalid base64 character at position %d: %c\n", i, char)
				return nil, fmt.Errorf("invalid base64 character at position %d", i)
			}
		}
		fmt.Printf("Base64 validation passed\n")
	} else {
		// Assume it's already base64 data
		base64Data = imageData
		fmt.Printf("Using raw base64 data, length: %d\n", len(base64Data))
	}

	// Decode base64 image data with timeout
	fmt.Printf("Starting base64 decoding...\n")

	// Use a channel to implement timeout for base64 decoding
	base64Chan := make(chan struct {
		data []byte
		err  error
	}, 1)

	go func() {
		fmt.Printf("Starting base64 decode in goroutine...\n")
		data, decodeErr := base64.StdEncoding.DecodeString(base64Data)
		fmt.Printf("Base64 decode in goroutine completed, error: %v\n", decodeErr)
		base64Chan <- struct {
			data []byte
			err  error
		}{data, decodeErr}
	}()

	// Wait for base64 decoding with timeout
	var data []byte
	var err error
	select {
	case result := <-base64Chan:
		data, err = result.data, result.err
		if err != nil {
			fmt.Printf("Base64 decode failed: %v\n", err)
			return nil, fmt.Errorf("failed to decode base64: %v", err)
		}
		fmt.Printf("Base64 decoded successfully, data length: %d\n", len(data))
	case <-time.After(2 * time.Second): // 2 second timeout for base64 decoding
		fmt.Printf("Base64 decode timeout\n")
		return nil, fmt.Errorf("base64 decode timeout")
	}

	// Decode PNG image with timeout
	fmt.Printf("Starting PNG decoding...\n")

	// Use a channel to implement timeout for PNG decoding
	pngChan := make(chan struct {
		img image.Image
		err error
	}, 1)

	go func() {
		fmt.Printf("Starting PNG decode in goroutine...\n")
		pngImg, pngErr := png.Decode(strings.NewReader(string(data)))
		fmt.Printf("PNG decode in goroutine completed, error: %v\n", pngErr)
		pngChan <- struct {
			img image.Image
			err error
		}{pngImg, pngErr}
	}()

	// Wait for PNG decoding with timeout
	var img image.Image
	var pngDecodeErr error
	select {
	case result := <-pngChan:
		img, pngDecodeErr = result.img, result.err
		if pngDecodeErr != nil {
			fmt.Printf("PNG decode failed: %v\n", pngDecodeErr)
			return nil, fmt.Errorf("failed to decode PNG: %v", pngDecodeErr)
		}
		fmt.Printf("PNG decoded successfully, image bounds: %v\n", img.Bounds())
	case <-time.After(3 * time.Second): // 3 second timeout for PNG decoding
		fmt.Printf("PNG decode timeout\n")
		return nil, fmt.Errorf("PNG decode timeout")
	}

	// Cache the image
	tileCache[imageData] = img
	fmt.Printf("Tile cached successfully\n")
	return img, nil
}

// createCheckerboardPattern creates a checkerboard pattern
func createCheckerboardPattern(size int) image.Image {
	img := image.NewRGBA(image.Rect(0, 0, size*2, size*2))

	// White squares
	draw.Draw(img, image.Rect(0, 0, size, size), &image.Uniform{color.White}, image.Point{}, draw.Src)
	draw.Draw(img, image.Rect(size, size, size*2, size*2), &image.Uniform{color.White}, image.Point{}, draw.Src)

	// Light gray squares (more visible)
	draw.Draw(img, image.Rect(size, 0, size*2, size), &image.Uniform{color.RGBA{200, 200, 200, 255}}, image.Point{}, draw.Src)
	draw.Draw(img, image.Rect(0, size, size, size*2), &image.Uniform{color.RGBA{200, 200, 200, 255}}, image.Point{}, draw.Src)

	return img
}

// renderMap renders the map to a canvas image with SSE progress updates
func renderMap(req RenderRequest) RenderResponse {
	// Add panic recovery
	defer func() {
		if r := recover(); r != nil {
			fmt.Printf("Panic recovered in renderMap: %v\n", r)
		}
	}()

	// Emit initial progress via SSE
	progressData := map[string]any{
		"current": 0,
		"total":   100,
		"message": "Starting map rendering...",
	}
	progressJSON, _ := json.Marshal(progressData)
	BroadcastProgress("map-render-progress", string(progressJSON))

	// Create the output image
	outputWidth := req.Width * req.TileSize
	outputHeight := req.Height * req.TileSize
	outputImg := image.NewRGBA(image.Rect(0, 0, outputWidth, outputHeight))

	// Fill with white background to avoid transparent areas showing as dark
	draw.Draw(outputImg, outputImg.Bounds(), &image.Uniform{color.White}, image.Point{}, draw.Src)

	// Emit progress for canvas creation
	progressData = map[string]any{
		"current": 10,
		"total":   100,
		"message": "Creating canvas...",
	}
	progressJSON, _ = json.Marshal(progressData)
	BroadcastProgress("map-render-progress", string(progressJSON))

	// Draw checkerboard pattern if requested
	if req.ShowCheckerboard {
		fmt.Printf("Drawing checkerboard pattern for %dx%d image\n", outputWidth, outputHeight)
		checkerboard := createCheckerboardPattern(8)
		pattern := image.NewRGBA(image.Rect(0, 0, outputWidth, outputHeight))

		for y := 0; y < outputHeight; y += 16 {
			for x := 0; x < outputWidth; x += 16 {
				draw.Draw(pattern, image.Rect(x, y, x+16, y+16), checkerboard, image.Point{x % 16, y % 16}, draw.Src)
			}
		}
		draw.Draw(outputImg, outputImg.Bounds(), pattern, image.Point{}, draw.Over)
		fmt.Printf("Checkerboard pattern drawn successfully\n")
	} else {
		fmt.Printf("ShowCheckerboard is false, skipping checkerboard pattern\n")
	}

	// Emit progress for checkerboard
	progressData = map[string]any{
		"current": 15,
		"total":   100,
		"message": "Drawing background...",
	}
	progressJSON, _ = json.Marshal(progressData)
	BroadcastProgress("map-render-progress", string(progressJSON))

	// Build spatial indices for each layer
	spatialIndices := make(map[int]*SpatialIndex)
	for _, layer := range req.Layers {
		spatialIndices[layer.ID] = NewSpatialIndex()
		for _, tile := range layer.Tiles {
			spatialIndices[layer.ID].SetTile(tile.X, tile.Y, tile)
		}
	}

	// Emit progress for spatial indexing
	progressData = map[string]any{
		"current": 20,
		"total":   100,
		"message": "Building spatial indices...",
	}
	progressJSON, _ = json.Marshal(progressData)
	BroadcastProgress("map-render-progress", string(progressJSON))

	// Calculate total tiles for progress tracking
	totalTiles := 0
	for _, layer := range req.Layers {
		if layer.Visible {
			totalTiles += len(layer.Tiles)
		}
	}

	fmt.Printf("Total tiles to render: %d\n", totalTiles)
	fmt.Printf("Map dimensions: %dx%d, tile size: %d\n", req.Width, req.Height, req.TileSize)

	// Safety check for empty layers
	if totalTiles == 0 {
		fmt.Printf("No tiles to render, skipping tile rendering phase\n")
		// Emit progress for empty rendering
		progressData = map[string]any{
			"current": 85,
			"total":   100,
			"message": "No tiles to render, drawing grid...",
		}
		progressJSON, _ = json.Marshal(progressData)
		BroadcastProgress("map-render-progress", string(progressJSON))
	} else {
		// Render layers in order (bottom to top)
		tilesRendered := 0
		for layerIndex, layer := range req.Layers {
			fmt.Printf("Processing layer %d (%s), visible: %v, tiles: %d\n", layer.ID, layer.Name, layer.Visible, len(layer.Tiles))
			if !layer.Visible {
				fmt.Printf("Skipping layer %d - not visible\n", layer.ID)
				continue
			}

			// Emit progress for layer start
			progressData = map[string]any{
				"current": 25 + (layerIndex * 15),
				"total":   100,
				"message": fmt.Sprintf("Rendering layer: %s", layer.Name),
			}
			progressJSON, _ = json.Marshal(progressData)
			BroadcastProgress("map-render-progress", string(progressJSON))

			spatialIndex := spatialIndices[layer.ID]
			if spatialIndex == nil {
				fmt.Printf("Skipping layer %d - no spatial index\n", layer.ID)
				continue
			}

			// Get all tiles for this layer
			tiles := spatialIndex.GetAllTiles()
			fmt.Printf("Layer %d has %d tiles to render\n", layer.ID, len(tiles))

			// Render each tile
			startTime := time.Now()

			for tileIndex, tile := range tiles {
				// Check for overall timeout (30 seconds)
				if time.Since(startTime) > 30*time.Second {
					fmt.Printf("Tile processing timeout reached after %v, stopping rendering\n", time.Since(startTime))
					break
				}

				fmt.Printf("Processing tile at (%d, %d) with tileId: %s\n", tile.X, tile.Y, tile.TileID[:50]+"...") // Show first 50 chars
				fmt.Printf("DEBUG: Tile at (%d, %d) has length: %d\n", tile.X, tile.Y, len(tile.TileID))

				// Check for problematic tile IDs BEFORE attempting to load
				if len(tile.TileID) == 0 {
					fmt.Printf("Skipping tile at (%d, %d) - empty tile ID\n", tile.X, tile.Y)
					continue
				}

				// Check if tile data looks like a valid data URL or base64
				if strings.HasPrefix(tile.TileID, "data:image/") {
					fmt.Printf("Tile at (%d, %d) is data URL format\n", tile.X, tile.Y)
					// Validate data URL format
					if !strings.Contains(tile.TileID, ",") {
						fmt.Printf("Skipping tile at (%d, %d) - invalid data URL format (no comma)\n", tile.X, tile.Y)
						continue
					}

					// Check if base64 part is reasonable length
					parts := strings.Split(tile.TileID, ",")
					if len(parts) != 2 || len(parts[1]) < 20 {
						fmt.Printf("Skipping tile at (%d, %d) - invalid data URL or base64 too short (parts: %d, base64 length: %d)\n", tile.X, tile.Y, len(parts), len(parts[1]))
						continue
					}
					fmt.Printf("Tile at (%d, %d) passed data URL validation\n", tile.X, tile.Y)
				} else {
					// Assume it's raw base64 data - check minimum length
					if len(tile.TileID) < 20 {
						fmt.Printf("Skipping tile at (%d, %d) - base64 data too short (%d chars, minimum 20 required)\n", tile.X, tile.Y, len(tile.TileID))
						continue
					}
					fmt.Printf("Tile at (%d, %d) is raw base64 format, length: %d\n", tile.X, tile.Y, len(tile.TileID))
				}

				// Skip tiles outside bounds
				if tile.X < 0 || tile.X >= req.Width || tile.Y < 0 || tile.Y >= req.Height {
					fmt.Printf("Skipping tile at (%d, %d) - outside bounds\n", tile.X, tile.Y)
					continue
				}

				fmt.Printf("Tile at (%d, %d) passed all validation checks, proceeding to load\n", tile.X, tile.Y)

				// Load tile image with timeout protection
				var tileImg image.Image
				var err error

				// Use a channel to implement timeout for tile loading
				tileChan := make(chan struct {
					img image.Image
					err error
				}, 1)

				go func() {
					fmt.Printf("Starting to load tile at (%d, %d)\n", tile.X, tile.Y)

					// Add a timeout wrapper around the entire loadTileImage function
					loadChan := make(chan struct {
						img image.Image
						err error
					}, 1)

					go func() {
						img, loadErr := loadTileImage(tile.TileID)
						loadChan <- struct {
							img image.Image
							err error
						}{img, loadErr}
					}()

					// Wait for loadTileImage with a short timeout
					select {
					case result := <-loadChan:
						fmt.Printf("Finished loading tile at (%d, %d), error: %v\n", tile.X, tile.Y, result.err)
						tileChan <- result
					case <-time.After(1 * time.Second): // 1 second timeout for entire function
						fmt.Printf("Tile loading timeout for (%d, %d) - function hung\n", tile.X, tile.Y)
						tileChan <- struct {
							img image.Image
							err error
						}{nil, fmt.Errorf("tile loading timeout - function hung")}
					}
				}()

				// Wait for tile loading with timeout
				select {
				case result := <-tileChan:
					tileImg, err = result.img, result.err
					fmt.Printf("Tile loading completed for (%d, %d)\n", tile.X, tile.Y)
				case <-time.After(5 * time.Second): // Increased to 5 second timeout
					fmt.Printf("Tile loading timeout for (%d, %d) - skipping\n", tile.X, tile.Y)
					continue
				}

				if err != nil {
					fmt.Printf("Failed to load tile image at (%d, %d): %v\n", tile.X, tile.Y, err)
					continue // Skip tiles that fail to load
				}

				fmt.Printf("Successfully loaded tile at (%d, %d)\n", tile.X, tile.Y)

				// Calculate position
				x := tile.X * req.TileSize
				y := tile.Y * req.TileSize

				// Draw tile
				draw.Draw(outputImg, image.Rect(x, y, x+req.TileSize, y+req.TileSize), tileImg, image.Point{}, draw.Over)

				tilesRendered++

				// Emit progress every 10 tiles or at the end
				if tileIndex%10 == 0 || tileIndex == len(tiles)-1 {
					// Safety check for division by zero
					var progress int
					if totalTiles > 0 {
						progress = 25 + (layerIndex * 15) + int((float64(tilesRendered)/float64(totalTiles))*60)
					} else {
						progress = 25 + (layerIndex * 15) + 60 // Max progress for this layer
					}
					// Ensure progress doesn't exceed 85 (before grid drawing)
					if progress > 85 {
						progress = 85
					}
					fmt.Printf("Emitting progress: %d%% (tiles rendered: %d/%d)\n", progress, tilesRendered, totalTiles)
					progressData = map[string]any{
						"current": progress,
						"total":   100,
						"message": fmt.Sprintf("Rendering tiles... (%d/%d)", tilesRendered, totalTiles),
					}
					progressJSON, _ = json.Marshal(progressData)
					BroadcastProgress("map-render-progress", string(progressJSON))
				}
			}
		}
	}

	// Emit progress for grid drawing
	progressData = map[string]any{
		"current": 85,
		"total":   100,
		"message": "Drawing grid...",
	}
	progressJSON, _ = json.Marshal(progressData)
	BroadcastProgress("map-render-progress", string(progressJSON))

	// Emit progress for encoding
	progressData = map[string]any{
		"current": 90,
		"total":   100,
		"message": "Encoding image...",
	}
	progressJSON, _ = json.Marshal(progressData)
	BroadcastProgress("map-render-progress", string(progressJSON))

	// Encode to PNG
	fmt.Printf("Starting PNG encoding...\n")
	var buf strings.Builder
	err := png.Encode(&buf, outputImg)
	if err != nil {
		fmt.Printf("PNG encoding failed: %v\n", err)
		return RenderResponse{
			Success: false,
			Error:   fmt.Sprintf("failed to encode image: %v", err),
		}
	}
	fmt.Printf("PNG encoding completed, buffer size: %d\n", buf.Len())

	// Convert to base64 for JSON serialization (but more efficiently)
	pngBytes := []byte(buf.String())
	imageData := base64.StdEncoding.EncodeToString(pngBytes)
	fmt.Printf("Base64 encoding completed, data length: %d\n", len(imageData))

	// Emit final progress
	fmt.Printf("Emitting final progress (100%%)\n")
	progressData = map[string]any{
		"current": 100,
		"total":   100,
		"message": "Map rendering completed",
	}
	progressJSON, _ = json.Marshal(progressData)
	BroadcastProgress("map-render-progress", string(progressJSON))
	fmt.Printf("Final progress event emitted successfully\n")

	// Emit completion event
	completionData := map[string]any{
		"success":   true,
		"imageData": imageData,
		"message":   "Map rendering completed successfully",
	}
	completionJSON, _ := json.Marshal(completionData)
	BroadcastProgress("map-render-complete", string(completionJSON))

	fmt.Printf("RenderMap function completed successfully\n")
	return RenderResponse{
		Success:   true,
		ImageData: imageData,
	}
}

// renderAffectedArea renders only a specific region of the map
func renderAffectedArea(req RenderRequest, startX, startY, regionW, regionH int) (string, error) {
	// Create a temporary image for the affected area
	areaWidth := regionW * req.TileSize
	areaHeight := regionH * req.TileSize
	areaImg := image.NewRGBA(image.Rect(0, 0, areaWidth, areaHeight))

	// Draw checkerboard pattern in the affected area if requested
	if req.ShowCheckerboard {
		checkerboard := createCheckerboardPattern(8)
		for y := 0; y < areaHeight; y += 16 {
			for x := 0; x < areaWidth; x += 16 {
				draw.Draw(areaImg, image.Rect(x, y, x+16, y+16), checkerboard, image.Point{x % 16, y % 16}, draw.Src)
			}
		}
	}

	// Build spatial indices for each layer
	spatialIndices := make(map[int]*SpatialIndex)
	for _, layer := range req.Layers {
		spatialIndices[layer.ID] = NewSpatialIndex()
		for _, tile := range layer.Tiles {
			spatialIndices[layer.ID].SetTile(tile.X, tile.Y, tile)
		}
	}

	// Render layers in order (bottom to top) for the affected area only
	for _, layer := range req.Layers {
		if !layer.Visible {
			continue
		}

		spatialIndex := spatialIndices[layer.ID]
		if spatialIndex == nil {
			continue
		}

		// Get tiles in the affected area
		for x := startX; x < startX+regionW; x++ {
			for y := startY; y < startY+regionH; y++ {
				tile, exists := spatialIndex.GetTile(x, y)
				if !exists {
					continue
				}

				// Load tile image
				tileImg, err := loadTileImage(tile.TileID)
				if err != nil {
					continue // Skip tiles that fail to load
				}

				// Calculate position within the area image
				areaX := (x - startX) * req.TileSize
				areaY := (y - startY) * req.TileSize

				// Draw tile
				draw.Draw(areaImg, image.Rect(areaX, areaY, areaX+req.TileSize, areaY+req.TileSize), tileImg, image.Point{}, draw.Over)
			}
		}
	}

	// Draw grid lines in the affected area if requested

	// Encode to PNG
	var buf strings.Builder
	err := png.Encode(&buf, areaImg)
	if err != nil {
		return "", fmt.Errorf("failed to encode area image: %v", err)
	}

	// Convert to base64
	imageData := base64.StdEncoding.EncodeToString([]byte(buf.String()))
	return imageData, nil
}

// stampTile places a tile stamp on the map
func stampTile(req StampRequest) StampResponse {
	// Validate input
	if req.SelectedTile == nil || req.X < 0 || req.Y < 0 {
		return StampResponse{
			Success: false,
			Error:   "invalid input parameters",
		}
	}

	regionW := req.SelectedTile.Width
	if regionW == 0 {
		regionW = 1
	}
	regionH := req.SelectedTile.Height
	if regionH == 0 {
		regionH = 1
	}

	// Find the active layer
	var activeLayer *Layer
	for i := range req.Layers {
		if req.Layers[i].ID == req.ActiveLayerID {
			activeLayer = &req.Layers[i]
			break
		}
	}

	if activeLayer == nil {
		return StampResponse{
			Success: false,
			Error:   "active layer not found",
		}
	}

	// Create spatial index for efficient operations
	spatialIndex := NewSpatialIndex()
	for _, tile := range activeLayer.Tiles {
		spatialIndex.SetTile(tile.X, tile.Y, tile)
	}

	// Remove existing tiles in the region
	for dx := 0; dx < regionW; dx++ {
		for dy := 0; dy < regionH; dy++ {
			tx := req.X + dx
			ty := req.Y + dy

			if tx < 0 || tx >= req.Width || ty < 0 || ty >= req.Height {
				continue
			}

			spatialIndex.RemoveTile(tx, ty)
		}
	}

	// Add new tiles
	newTiles := make([]Tile, 0)
	for dx := 0; dx < regionW; dx++ {
		for dy := 0; dy < regionH; dy++ {
			tx := req.X + dx
			ty := req.Y + dy

			if tx < 0 || tx >= req.Width || ty < 0 || ty >= req.Height {
				continue
			}

			// Determine tile image
			tileImage := req.SelectedTile.Image
			if req.SelectedTile.SubTiles != nil && len(req.SelectedTile.SubTiles) > dx && len(req.SelectedTile.SubTiles[dx]) > dy {
				tileImage = req.SelectedTile.SubTiles[dx][dy]
			}

			newTile := Tile{
				X:      tx,
				Y:      ty,
				TileID: tileImage,
			}

			spatialIndex.SetTile(tx, ty, newTile)
			newTiles = append(newTiles, newTile)
		}
	}

	// Update layer tiles
	activeLayer.Tiles = spatialIndex.GetAllTiles()

	// Render the affected area
	renderReq := RenderRequest{
		Width:            req.Width,
		Height:           req.Height,
		TileSize:         32, // Default tile size, should be configurable
		Layers:           req.Layers,
		ShowCheckerboard: true,
	}

	imageData, err := renderAffectedArea(renderReq, req.X, req.Y, regionW, regionH) // Pass nil for ctx as it's not used in renderAffectedArea
	if err != nil {
		return StampResponse{
			Success: false,
			Error:   fmt.Sprintf("failed to render affected area: %v", err),
		}
	}

	return StampResponse{
		Success:   true,
		Layers:    req.Layers,
		ImageData: imageData,
	}
}
