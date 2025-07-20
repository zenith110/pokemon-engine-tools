package mapeditor

import "fmt"

// SpatialIndex for efficient tile lookups
type SpatialIndex struct {
	tiles map[string]Tile
}

func NewSpatialIndex() *SpatialIndex {
	return &SpatialIndex{
		tiles: make(map[string]Tile),
	}
}

func (si *SpatialIndex) SetTile(x, y int, tile Tile) {
	key := fmt.Sprintf("%d,%d", x, y)
	si.tiles[key] = tile
}

func (si *SpatialIndex) GetTile(x, y int) (Tile, bool) {
	key := fmt.Sprintf("%d,%d", x, y)
	tile, exists := si.tiles[key]
	return tile, exists
}

func (si *SpatialIndex) RemoveTile(x, y int) {
	key := fmt.Sprintf("%d,%d", x, y)
	delete(si.tiles, key)
}

func (si *SpatialIndex) GetAllTiles() []Tile {
	tiles := make([]Tile, 0, len(si.tiles))
	for _, tile := range si.tiles {
		tiles = append(tiles, tile)
	}
	return tiles
}
