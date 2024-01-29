package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
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

func SetupConfig() (OptionsConfig, string) {
	file, err := os.Open("settings.json")
	if err != nil {
		options := OptionsConfig{
			DataDirectory: "",
		}
		content, err := json.Marshal(options)
		if err != nil {
			fmt.Println(err)
		}
		err = os.WriteFile("settings.json", content, 0644)
		if err != nil {
			log.Fatal(err)
		}
	}
	defer file.Close()
	var config OptionsConfig
	bytes, err := io.ReadAll(file)
	if err != nil {
		fmt.Printf("Error is %v", err)
		var options OptionsConfig
		return options, "First time loading!"
	}
	err = json.Unmarshal(bytes, &config)
	if err != nil {
		fmt.Printf("Error is %v", err)
		var options OptionsConfig
		return options, "First time loading!"
	}
	return config, "Success"
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	directory, check := SetupConfig()
	if check == "Success" {
		a.dataDirectory = directory
	} else {
		fmt.Print("First time loading settings.json!")
	}
}
