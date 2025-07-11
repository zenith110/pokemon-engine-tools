package parsing

import (
	"fmt"
	"io"
	"os"

	"github.com/pelletier/go-toml/v2"
	coreModels "github.com/zenith110/pokemon-engine-tools/models"
)

func (a *ParsingApp) GetAllTilesets() []string {
	var tilesets []string
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
		tilesets = append(tilesets, tileset.Name)
	}
	return tilesets
}
