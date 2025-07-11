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

type MapEditerMapData struct {
	Map []Map `toml:"map"`
}
type Properties struct {
	TilesetImagePath string `toml:"tilesetImagePath"`
	FilePath         string `toml:"filePath"`
	TypeOfMap        string `toml:"typeOfMap"`
	BgMusic          string `toml:"bgMusic"`
	Description      string `toml:"description"`
}
type Map struct {
	Name       string       `toml:"name"`
	ID         int          `toml:"id"`
	Width      int          `toml:"width"`
	Height     int          `toml:"height"`
	Properties []Properties `toml:"properties"`
	TileSize   int          `toml:"tileSize"`
}
