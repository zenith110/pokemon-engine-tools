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
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) Startup(ctx context.Context) {
	a.Ctx = ctx
	projectLastUpdated, err := os.OpenFile("lastused.toml", os.O_CREATE, 0644)
	if err != nil {
		os.Create("lastused.toml")
	}
	defer projectLastUpdated.Close()
	var projectsData Models.Project
	b, err := io.ReadAll(projectLastUpdated)
	if err != nil {
		fmt.Printf("error while reading projects is %v", err)
	}

	err = toml.Unmarshal(b, &projectsData)
	if err != nil {
		panic(err)
	}
	if projectsData.FolderLocation == "" {
		fmt.Print("Ignoring")
	}
	a.DataDirectory = projectsData.FolderLocation
}
