package mapeditor

// Tile represents a single tile in the map
type Tile struct {
	X      int    `json:"x"`
	Y      int    `json:"y"`
	TileID string `json:"tileId"`
}

// Layer represents a map layer
type Layer struct {
	ID      int    `json:"id"`
	Name    string `json:"name"`
	Visible bool   `json:"visible"`
	Locked  bool   `json:"locked"`
	Tiles   []Tile `json:"tiles"`
}

// RenderRequest represents a request to render the map
type RenderRequest struct {
	Width            int     `json:"width"`
	Height           int     `json:"height"`
	TileSize         int     `json:"tileSize"`
	Layers           []Layer `json:"layers"`
	ShowGrid         bool    `json:"showGrid"`
	ShowCheckerboard bool    `json:"showCheckerboard"`
}

// RenderResponse represents the response from rendering
type RenderResponse struct {
	Success   bool   `json:"success"`
	ImageData string `json:"imageData,omitempty"`
	Error     string `json:"error,omitempty"`
}

// StampRequest represents a request to stamp a tile on the map
type StampRequest struct {
	SelectedTile  *SelectedTile `json:"selectedTile"`
	X             int           `json:"x"`
	Y             int           `json:"y"`
	Width         int           `json:"width"`
	Height        int           `json:"height"`
	Layers        []Layer       `json:"layers"`
	ActiveLayerID int           `json:"activeLayerId"`
}

// SelectedTile represents a selected tile for stamping
type SelectedTile struct {
	ID       string     `json:"id"`
	Name     string     `json:"name"`
	Image    string     `json:"image"`
	Width    int        `json:"width"`
	Height   int        `json:"height"`
	SubTiles [][]string `json:"subTiles,omitempty"`
}

// StampResponse represents the response from stamping a tile
type StampResponse struct {
	Success   bool    `json:"success"`
	Layers    []Layer `json:"layers"`
	ImageData string  `json:"imageData,omitempty"`
	Error     string  `json:"error,omitempty"`
}
