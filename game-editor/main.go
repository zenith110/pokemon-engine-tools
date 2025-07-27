//go:build !dev

package main

import (
	"context"
	"embed"
	"log"
	"time"

	"github.com/gin-gonic/gin"
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

func main() {
	// Create the core app
	coreApp := core.NewApp()

	// Initialize the core app with context (Wails v3 startup)
	// Note: In Wails v3, we need to call startup manually since OnStartup is not available
	ctx := context.Background()
	coreApp.Startup(ctx)

	// Create all the editor apps
	mapEditorApp := mapEditor.NewMapEditorApp(coreApp)
	overworldEditorApp := overworldEditor.NewOverworldEditorApp(coreApp)
	trainerEditorApp := trainerEditor.NewTrainerEditorApp(coreApp)
	moveEditorApp := moveEditor.NewMoveEditorApp(coreApp)
	jukeboxApp := jukebox.NewJukeboxApp(coreApp)
	parsingApp := parsing.NewParsingApp(coreApp)
	pokemonEditorApp := pokemonEditor.NewPokemonEditorApp(coreApp)

	// Set up Gin router for SSE
	gin.SetMode(gin.ReleaseMode)
	router := gin.New()
	router.Use(gin.Recovery())

	// Set up SSE routes
	mapEditor.SetupSSERoutes(router)

	// Start SSE server in background
	go func() {
		log.Println("Starting SSE server on :8080")
		if err := router.Run(":8080"); err != nil {
			log.Printf("SSE server error: %v", err)
		}
	}()

	// Create the Wails v3 application
	app := application.New(application.Options{
		Name:        "Pokemon Go Engine Game Editor",
		Description: "A tool for editing the Pokemon Go Engine",
		Services: []application.Service{
			application.NewService(coreApp),
			application.NewService(mapEditorApp),
			application.NewService(overworldEditorApp),
			application.NewService(trainerEditorApp),
			application.NewService(moveEditorApp),
			application.NewService(jukeboxApp),
			application.NewService(parsingApp),
			application.NewService(pokemonEditorApp),
		},
		Assets: application.AssetOptions{
			Handler: application.AssetFileServerFS(assets),
		},
		Mac: application.MacOptions{
			ApplicationShouldTerminateAfterLastWindowClosed: true,
		},
	})

	// Set the Wails app instance for event emission
	mapEditorApp.SetWailsApp(app)

	// Create a new window with the necessary options
	app.Window.NewWithOptions(application.WebviewWindowOptions{
		Title:  "Pokemon Go Engine Game Editor",
		Width:  1024,
		Height: 768,
		Mac: application.MacWindow{
			InvisibleTitleBarHeight: 50,
			Backdrop:                application.MacBackdropTranslucent,
			TitleBar:                application.MacTitleBarHiddenInset,
		},
		BackgroundColour: application.NewRGB(27, 38, 54),
		URL:              "/",
	})

	// Create a goroutine that emits an event containing the current time every second
	go func() {
		for {
			now := time.Now().Format(time.RFC1123)
			app.Event.Emit("time", now)
			time.Sleep(time.Second)
		}
	}()

	// Run the application. This blocks until the application has been exited
	err := app.Run()

	// If an error occurred while running the application, log it and exit
	if err != nil {
		log.Fatal(err)
	}
}
