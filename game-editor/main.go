package main

import (
	"embed"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	parsing "github.com/zenith110/pokemon-engine-tools/parsing"
	core "github.com/zenith110/pokemon-engine-tools/tools-core"
	jukebox "github.com/zenith110/pokemon-engine-tools/tools/jukebox"
	mapEditor "github.com/zenith110/pokemon-engine-tools/tools/map-editor"
	moveEditor "github.com/zenith110/pokemon-engine-tools/tools/move-editor"
	overworldEditor "github.com/zenith110/pokemon-engine-tools/tools/overworld-editor"
	pokemonEditor "github.com/zenith110/pokemon-engine-tools/tools/pokemon-editor"
	trainerEditor "github.com/zenith110/pokemon-engine-tools/tools/trainer-editor"
)

//go:embed all:frontend/dist
var assets embed.FS

type FileLoader struct {
	http.Handler
}

func NewFileLoader() *FileLoader {
	return &FileLoader{}
}

func (h *FileLoader) ServeHTTP(res http.ResponseWriter, req *http.Request) {
	var err error
	requestedFilename := strings.TrimPrefix(req.URL.Path, "/")
	fileData, err := os.ReadFile(requestedFilename)
	if err != nil {
		res.WriteHeader(http.StatusBadRequest)
		res.Write([]byte(fmt.Sprintf("Could not load file %s", requestedFilename)))
	}

	res.Write(fileData)
}
func main() {
	// Create an instance of the app structure
	app := core.NewApp()
	mapEditorSetup := mapEditor.NewMapEditorApp(app)
	overworldEditorSetup := overworldEditor.NewOverworldEditorApp(app)
	trainerEditorSetup := trainerEditor.NewTrainerEditorApp(app)
	moveEditorSetup := moveEditor.NewMoveEditorApp(app)
	jukeboxSetup := jukebox.NewJukeboxApp(app)
	parsingSetup := parsing.NewParsingApp(app)
	pokemonEditorSetup := pokemonEditor.NewPokemonEditorApp(app)
	// Create application with options
	err := wails.Run(&options.App{
		Title:  "Game Editor",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets:  assets,
			Handler: NewFileLoader(),
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.Startup,
		Bind: []interface{}{
			app,
			mapEditorSetup,
			overworldEditorSetup,
			trainerEditorSetup,
			moveEditorSetup,
			jukeboxSetup,
			parsingSetup,
			pokemonEditorSetup,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
