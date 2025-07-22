package main

import (
	"embed"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/wailsapp/wails/v3/pkg/application"
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
	app := application.New(application.Options{
		Name:        "Pokemon Go Engine Game Editor",
		Description: "A tool for editing the Pokemon Go Engine",
		OnStartup:   app.Startup,
		Services: []application.Service{
			application.NewService(&core.App{}),
			application.NewService(&mapEditor.MapEditorApp{}),
			application.NewService(&overworldEditor.OverworldEditorApp{}),
			application.NewService(&trainerEditor.TrainerEditorApp{}),
			application.NewService(&moveEditor.MoveEditorApp{}),
			application.NewService(&jukebox.JukeboxApp{}),
			application.NewService(&parsing.ParsingApp{}),
			application.NewService(&pokemonEditor.PokemonEditorApp{}),
		},
		Assets: application.AssetOptions{
			Handler: application.AssetFileServerFS(assets),
		},
		Mac: application.MacOptions{
			ApplicationShouldTerminateAfterLastWindowClosed: true,
		},
	})

	// Create a new window with the necessary options.
	// 'Title' is the title of the window.
	// 'Mac' options tailor the window when running on macOS.
	// 'BackgroundColour' is the background colour of the window.
	// 'URL' is the URL that will be loaded into the webview.
	app.Window.NewWithOptions(application.WebviewWindowOptions{
		Title: "Pokemon Go Engine Game Editor",
		Mac: application.MacWindow{
			InvisibleTitleBarHeight: 50,
			Backdrop:                application.MacBackdropTranslucent,
			TitleBar:                application.MacTitleBarHiddenInset,
		},
		BackgroundColour: application.NewRGB(27, 38, 54),
		URL:              "/",
	})

	// Create a goroutine that emits an event containing the current time every second.
	// The frontend can listen to this event and update the UI accordingly.
	go func() {
		for {
			now := time.Now().Format(time.RFC1123)
			app.Event.Emit("time", now)
			time.Sleep(time.Second)
		}
	}()

	// Run the application. This blocks until the application has been exited.
	err := app.Run()

	// If an error occurred while running the application, log it and exit.
	if err != nil {
		log.Fatal(err)
	}
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
