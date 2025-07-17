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

type GrassEncounters struct {
	Name     string `toml:"name"`
	ID       string `toml:"id"`
	MinLevel int    `toml:"minLevel"`
	MaxLevel int    `toml:"maxLevel"`
	Rarity   int    `toml:"rarity"`
	Shiny    bool   `toml:"shiny"`
}
type WaterEncounters struct {
	Name     string `toml:"name"`
	ID       string `toml:"id"`
	MinLevel int    `toml:"minLevel"`
	MaxLevel int    `toml:"maxLevel"`
	Rarity   int    `toml:"rarity"`
	Shiny    bool   `toml:"shiny"`
}
type CaveEncounters struct {
	Name     string `toml:"name"`
	ID       string `toml:"id"`
	MinLevel int    `toml:"minLevel"`
	MaxLevel int    `toml:"maxLevel"`
	Rarity   int    `toml:"rarity"`
	Shiny    bool   `toml:"shiny"`
}
type FishingEncounters struct {
	Name     string `toml:"name"`
	ID       string `toml:"id"`
	MinLevel int    `toml:"minLevel"`
	MaxLevel int    `toml:"maxLevel"`
	Rarity   int    `toml:"rarity"`
	Shiny    bool   `toml:"shiny"`
}
type Map struct {
	Name              string              `toml:"name"`
	ID                int                 `toml:"id"`
	Width             int                 `toml:"width"`
	Height            int                 `toml:"height"`
	TileSize          int                 `toml:"tileSize"`
	Properties        []Properties        `toml:"properties"`
	GrassEncounters   []GrassEncounters   `toml:"grassEncounters"`
	WaterEncounters   []WaterEncounters   `toml:"waterEncounters"`
	CaveEncounters    []CaveEncounters    `toml:"caveEncounters"`
	FishingEncounters []FishingEncounters `toml:"fishingEncounters"`
}
