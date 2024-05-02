package main

import (
	"fmt"
	"io/fs"
	"os"
)

func (a *App) ParseOverworldData() {

}

func (a *App) CreateOverworldFrame(frameSetName string, frame int) {
	// Gets all the files of a directory
	filePath := fmt.Sprintf("%s/data/assets/overworlds", a.dataDirectory)
	entries, _ := os.ReadDir(filePath)
	// Gets the number of current ows, and -1 for 0 indexing
	newOverWorldFolderNumber := len(entries) - 1
	// Creates new directory for the ow
	newOverWorldFolderPath := fmt.Sprintf("%s/%d", filePath, newOverWorldFolderNumber)
	if _, err := os.Stat(newOverWorldFolderPath); os.IsNotExist(err) {
		os.Mkdir(newOverWorldFolderPath, fs.FileMode(os.O_CREATE))
	}
	// Creates folder for the specific frametype
	/*
		Current frametypes are
		swimming
		walking
		running
		surfing
	*/
	frameSetNameFilePath := fmt.Sprintf("%s/%s", newOverWorldFolderPath, frameSetName)
	if _, err := os.Stat(frameSetNameFilePath); os.IsNotExist(err) {
		os.Mkdir(frameSetNameFilePath, fs.FileMode(os.O_CREATE))
	}
}
