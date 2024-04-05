package main

import (
	"fmt"
	"os"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"gopkg.in/src-d/go-git.v4"
)

func (a *App) GrabProjectWorkspace() string {
	selection, err := runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select engine base directory",
	})
	if err != nil {
		panic(err)
	}
	selectionUpdated := strings.ReplaceAll(selection, "\\", "/")
	return selectionUpdated
}
func (a *App) CreateProject(projectCreationData ProjectCreation) bool {
	_, err := git.PlainClone(projectCreationData.Directory, false, &git.CloneOptions{
		URL:      "https://github.com/zenith110/pokemon-go-engine",
		Progress: os.Stdout,
	})
	if err != nil {
		fmt.Printf("error is: %v", err)
		return false
	}
	err = os.RemoveAll(fmt.Sprintf("%s/.git", projectCreationData.Directory))
	if err != nil {
		fmt.Printf("error is: %v", err)
		return false
	}
	return true
}
