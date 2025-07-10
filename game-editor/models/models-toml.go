package models

type TilesetData struct {
	Tilesets []Tileset `toml:"tilesets"`
}
type Tileset struct {
	Name               string `toml:"name"`
	TilesetWidth       int    `toml:"tilesetWidth"`
	TilesetHeight      int    `toml:"tilesetHeight"`
	TypeOfTileSet      string `toml:"typeOfTileSet"`
	Path               string `toml:"path"`
	TilesetDescription string `toml:"tilesetDescription"`
}
