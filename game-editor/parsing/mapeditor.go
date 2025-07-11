package parsing

import (
	"fmt"
	"io"
	"os"

	"github.com/pelletier/go-toml/v2"
	coreModels "github.com/zenith110/pokemon-engine-tools/models"
)

func (a *ParsingApp) GetAllTilesets() []coreModels.Tileset {
	var tilesets []coreModels.Tileset
	var tilesetData coreModels.TilesetData
	tilesetTomlPath := fmt.Sprintf("%s/data/toml/tilesets.toml", a.app.DataDirectory)
	tilesetFile, tilesetFileErr := os.Open(tilesetTomlPath)
	if tilesetFileErr != nil {
		fmt.Printf("Error occured while opening the toml file: %v\n", tilesetFileErr)
	}
	b, err := io.ReadAll(tilesetFile)
	if err != nil {
		fmt.Printf("Error reading tilesets.toml: %v\n", err)
		return tilesets
	}

	err = toml.Unmarshal(b, &tilesetData)
	if err != nil {
		fmt.Printf("Error unmarshaling tileset.toml: %v\n", err)
		return tilesets
	}

	for _, tileset := range tilesetData.Tilesets {
		tilesets = append(tilesets, tileset)
	}
	return tilesets
}

func (a *ParsingApp) GetAllMaps() []coreModels.Map {
	var maps []coreModels.Map
	var mapsData coreModels.MapEditerMapData
	tilesetTomlPath := fmt.Sprintf("%s/data/toml/maps.toml", a.app.DataDirectory)
	mapFile, mapFileErr := os.Open(tilesetTomlPath)
	if mapFileErr != nil {
		fmt.Printf("Error occured while opening the toml file: %v\n", mapFileErr)
	}
	b, err := io.ReadAll(mapFile)
	if err != nil {
		fmt.Printf("Error reading maps.toml: %v\n", err)
		return maps
	}

	err = toml.Unmarshal(b, &mapsData)
	if err != nil {
		fmt.Printf("Error unmarshaling tileset.toml: %v\n", err)
		return maps
	}

	for _, mapData := range mapsData.Map {
		maps = append(maps, mapData)
	}
	return maps
}
