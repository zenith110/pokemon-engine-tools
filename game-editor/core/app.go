package core

import (
	"context"
	"fmt"
	"io"
	"os"

	"github.com/pelletier/go-toml/v2"
	Models "github.com/zenith110/pokemon-go-engine-toml-models/models"
)

// App struct
type App struct {
	Ctx           context.Context
	DataDirectory string
}

// NewApp creates a new App application struct
func NewApp() *App {
	app := &App{}

	// Load the last used project on app creation
	projectLastUpdated, err := os.OpenFile("lastused.toml", os.O_CREATE, 0644)
	if err != nil {
		os.Create("lastused.toml")
	} else {
		defer projectLastUpdated.Close()
		var projectsData Models.Project
		b, err := io.ReadAll(projectLastUpdated)
		if err != nil {
			fmt.Printf("error while reading projects is %v", err)
		} else {
			err = toml.Unmarshal(b, &projectsData)
			if err != nil {
				fmt.Printf("error while unmarshaling last used project: %v", err)
			} else if projectsData.FolderLocation != "" {
				app.DataDirectory = projectsData.FolderLocation
				fmt.Printf("Loaded last used project: %s at %s", projectsData.Name, projectsData.FolderLocation)
			}
		}
	}

	return app
}

// Startup initializes the app with context (for Wails v3 compatibility)
func (a *App) Startup(ctx context.Context) {
	a.Ctx = ctx
}
