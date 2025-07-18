package mapeditor

import (
	"encoding/base64"
	"fmt"
	"image"
	"image/color"
	"image/draw"
	"image/png"
	"strings"
)

// TileCache stores loaded tile images
var tileCache = make(map[string]image.Image)

// loadTileImage loads a tile image from base64 data
func loadTileImage(imageData string) (image.Image, error) {
	// Check cache first
	if cached, exists := tileCache[imageData]; exists {
		return cached, nil
	}

	// Decode base64 image data
	data, err := base64.StdEncoding.DecodeString(imageData)
	if err != nil {
		return nil, fmt.Errorf("failed to decode base64: %v", err)
	}

	// Decode PNG image
	img, err := png.Decode(strings.NewReader(string(data)))
	if err != nil {
		return nil, fmt.Errorf("failed to decode PNG: %v", err)
	}

	// Cache the image
	tileCache[imageData] = img
	return img, nil
}

// createCheckerboardPattern creates a checkerboard pattern
func createCheckerboardPattern(size int) image.Image {
	img := image.NewRGBA(image.Rect(0, 0, size*2, size*2))

	// White squares
	draw.Draw(img, image.Rect(0, 0, size, size), &image.Uniform{color.White}, image.Point{}, draw.Src)
	draw.Draw(img, image.Rect(size, size, size*2, size*2), &image.Uniform{color.White}, image.Point{}, draw.Src)

	// Gray squares
	draw.Draw(img, image.Rect(size, 0, size*2, size), &image.Uniform{color.RGBA{204, 204, 204, 255}}, image.Point{}, draw.Src)
	draw.Draw(img, image.Rect(0, size, size, size*2), &image.Uniform{color.RGBA{204, 204, 204, 255}}, image.Point{}, draw.Src)

	return img
}

// renderMap renders the map to a canvas image
func renderMap(req RenderRequest) RenderResponse {
	// Create the output image
	outputWidth := req.Width * req.TileSize
	outputHeight := req.Height * req.TileSize
	outputImg := image.NewRGBA(image.Rect(0, 0, outputWidth, outputHeight))

	// Draw checkerboard pattern if requested
	if req.ShowCheckerboard {
		checkerboard := createCheckerboardPattern(8)
		pattern := image.NewRGBA(image.Rect(0, 0, outputWidth, outputHeight))

		for y := 0; y < outputHeight; y += 16 {
			for x := 0; x < outputWidth; x += 16 {
				draw.Draw(pattern, image.Rect(x, y, x+16, y+16), checkerboard, image.Point{x % 16, y % 16}, draw.Src)
			}
		}
		draw.Draw(outputImg, outputImg.Bounds(), pattern, image.Point{}, draw.Over)
	}

	// Build spatial indices for each layer
	spatialIndices := make(map[int]*SpatialIndex)
	for _, layer := range req.Layers {
		spatialIndices[layer.ID] = NewSpatialIndex()
		for _, tile := range layer.Tiles {
			spatialIndices[layer.ID].SetTile(tile.X, tile.Y, tile)
		}
	}

	// Render layers in order (bottom to top)
	for _, layer := range req.Layers {
		if !layer.Visible {
			continue
		}

		spatialIndex := spatialIndices[layer.ID]
		if spatialIndex == nil {
			continue
		}

		// Get all tiles for this layer
		tiles := spatialIndex.GetAllTiles()

		// Render each tile
		for _, tile := range tiles {
			// Skip tiles outside bounds
			if tile.X < 0 || tile.X >= req.Width || tile.Y < 0 || tile.Y >= req.Height {
				continue
			}

			// Load tile image
			tileImg, err := loadTileImage(tile.TileID)
			if err != nil {
				continue // Skip tiles that fail to load
			}

			// Calculate position
			x := tile.X * req.TileSize
			y := tile.Y * req.TileSize

			// Draw tile
			draw.Draw(outputImg, image.Rect(x, y, x+req.TileSize, y+req.TileSize), tileImg, image.Point{}, draw.Over)
		}
	}

	// Draw grid if requested
	if req.ShowGrid {
		gridColor := color.RGBA{51, 65, 85, 76} // rgba(51,65,85,0.3)

		// Vertical lines
		for x := 0; x <= req.Width; x++ {
			lineX := x * req.TileSize
			for y := 0; y < outputHeight; y++ {
				outputImg.Set(lineX, y, gridColor)
			}
		}

		// Horizontal lines
		for y := 0; y <= req.Height; y++ {
			lineY := y * req.TileSize
			for x := 0; x < outputWidth; x++ {
				outputImg.Set(x, lineY, gridColor)
			}
		}
	}

	// Encode to PNG
	var buf strings.Builder
	err := png.Encode(&buf, outputImg)
	if err != nil {
		return RenderResponse{
			Success: false,
			Error:   fmt.Sprintf("failed to encode image: %v", err),
		}
	}

	// Convert to base64
	imageData := base64.StdEncoding.EncodeToString([]byte(buf.String()))

	return RenderResponse{
		Success:   true,
		ImageData: imageData,
	}
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

	return StampResponse{
		Success: true,
		Layers:  req.Layers,
	}
}
