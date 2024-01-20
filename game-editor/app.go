package main

import (
	"context"
	"encoding/json"
	"io"
	"os"
)

// App struct
type App struct {
	ctx           context.Context
	dataDirectory OptionsConfig
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

func SetupConfig() OptionsConfig {
	file, err := os.Open("settings.json")
	if err != nil {
		panic(err)
	}
	defer file.Close()
	var config OptionsConfig
	bytes, err := io.ReadAll(file)
	if err != nil {
		panic(err)
	}
	err = json.Unmarshal(bytes, &config)
	if err != nil {
		panic(err)
	}
	return config
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.dataDirectory = SetupConfig()
	a.ctx = ctx
}
