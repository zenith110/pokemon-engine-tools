package mapeditor

import (
	"image"
)

// RenderMap renders the map using Go backend
func (a *MapEditorApp) RenderMap(req RenderRequest) RenderResponse {
	return renderMap(req)
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
