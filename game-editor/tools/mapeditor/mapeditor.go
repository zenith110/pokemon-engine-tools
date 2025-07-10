package mapeditor

import (
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"path/filepath"

	"github.com/pelletier/go-toml/v2"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	coreModels "github.com/zenith110/pokemon-engine-tools/models"
	core "github.com/zenith110/pokemon-engine-tools/tools-core"
)

type MapEditorApp struct {
	app *core.App
}

// NewJukeboxApp creates a new JukeboxApp struct
func NewMapEditorApp(app *core.App) *MapEditorApp {
	return &MapEditorApp{
		app: app,
	}
}

func (a *MapEditorApp) CreateTilesetImage() map[string]any {
	tilesetPath, err := runtime.OpenFileDialog(a.app.Ctx, runtime.OpenDialogOptions{
		Title: "Select tileset .png file",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "Map (*.png)",
				Pattern:     "*.png",
			},
		},
	})
	if err != nil {
		panic(err)
	}
	fileName := filepath.Base(tilesetPath)
	tilesetImageFile, tilesetImageFileErr := os.Open(tilesetPath)
	if tilesetImageFileErr != nil {
		return map[string]any{
			"success":      false,
			"errorMessage": fmt.Errorf("error occured while opening tileset file %w", tilesetImageFileErr),
		}
	}
	fileData, fileDataErr := ioutil.ReadAll(tilesetImageFile)
	if fileDataErr != nil {
		return map[string]any{
			"success":      false,
			"errorMessage": fmt.Errorf("error while reading tileset image file: %w", fileDataErr),
		}
	}
	if tilesetImageFileCreationErr := os.WriteFile(tilesetPath, fileData, 0644); tilesetImageFileCreationErr != nil {
		return map[string]any{
			"success":      false,
			"errorMessage": fmt.Errorf("error writing tileset image file: %w", tilesetImageFileCreationErr),
		}
	}
	return map[string]any{
		"success":  true,
		"fileName": fileName,
	}
}

func (a *MapEditorApp) CreateTileset(createNewTilesetData coreModels.CreateNewTileset) map[string]any {

	localProjectTilesetPath := fmt.Sprintf("assets/tilesets/%s", createNewTilesetData.FileName)
	var tilesetData coreModels.TilesetData
	tileset := coreModels.Tileset{
		TilesetWidth:       createNewTilesetData.TilesetWidth,
		TilesetHeight:      createNewTilesetData.TilesetHeight,
		Name:               createNewTilesetData.NameOfTileset,
		Path:               localProjectTilesetPath,
		TypeOfTileSet:      createNewTilesetData.TypeOfTileSet,
		TilesetDescription: createNewTilesetData.Description,
	}
	tilesetTomlPath := fmt.Sprintf("%s/data/toml/tileset.toml", a.app.DataDirectory)
	tilesetData.Tilesets = append(tilesetData.Tilesets, tileset)
	var existingTileset coreModels.TilesetData
	file, err := os.Open(tilesetTomlPath)
	if err == nil {
		defer file.Close()
		fileData, err := io.ReadAll(file)
		if err == nil && len(fileData) > 0 {
			// Try to unmarshal existing data
			if err := toml.Unmarshal(fileData, &existingTileset); err == nil {
				// Append new data
				existingTileset.Tilesets = append(existingTileset.Tilesets, tilesetData.Tilesets...)
			} else {
				// Bad TOML, replace with new data
				existingTileset = tilesetData
			}
		} else {
			// File is empty or unreadable, replace with new data
			existingTileset = tilesetData
		}
	} else if os.IsNotExist(err) {
		// File does not exist, use new data
		existingTileset = tilesetData
	} else {
		// Some other error opening file
		return map[string]any{
			"success":      false,
			"errorMessage": fmt.Errorf("error opening tileset.toml: %w", err),
		}
	}

	// Marshal and write back
	out, err := toml.Marshal(existingTileset)
	if err != nil {
		return map[string]any{
			"success":      false,
			"errorMessage": fmt.Errorf("error marshaling tileset TOML: %w", err),
		}
	}
	if err := os.WriteFile(tilesetTomlPath, out, 0644); err != nil {
		return map[string]any{
			"success":      false,
			"errorMessage": fmt.Errorf("error writing tileset TOML: %w", err),
		}
	}
	return map[string]any{
		"success": true,
	}
}
