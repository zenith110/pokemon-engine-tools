package main

import (
	"bufio"
	"fmt"
	"io"
	"io/fs"
	"os"
	"strconv"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func (a *App) ParseOverworldData() {

}
func (a *App) CheckOverworldId() int {
	// Gets all the files of a directory
	basePath := "data/assets/overworlds"
	filePath := fmt.Sprintf("%s/%s", a.dataDirectory, basePath)
	entries, _ := os.ReadDir(filePath)
	var newOverWorldFolderNumber = 0
	if len(entries) <= 0 {
		newOverWorldFolderNumber = 0
	} else {
		// Gets the number of current ows, and -1 for 0 indexing
		newOverWorldFolderNumber = len(entries) - 1
	}
	return newOverWorldFolderNumber
}

// Creates a frame, returns base64 version of the frame + base location in game engine
func (a *App) CreateOverworldFrame(frameSetName string, frame int, overworldId int, direction string) map[string]string {
	selection, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select trainer image",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "Images (*.png)",
				Pattern:     "*.png",
			},
		},
	})
	if err != nil {
		panic(fmt.Errorf("error has occured while updating trainer sprite"))
	}

	// Gets all the files of a directory
	basePath := "data/assets/overworlds"
	filePath := fmt.Sprintf("%s/%s", a.dataDirectory, basePath)

	// Creates new directory for the ow
	newOverWorldFolderPath := fmt.Sprintf("%s/%d", filePath, overworldId)
	if _, err := os.Stat(newOverWorldFolderPath); os.IsNotExist(err) {
		os.MkdirAll(newOverWorldFolderPath, fs.FileMode(os.O_CREATE))
	}
	// Creates folder for the specific frametype
	/*
		Current frametypes are
		swimming
		walking
		running
		surfing
	*/
	frameSetNameFilePath := fmt.Sprintf("%s/%s/%s", newOverWorldFolderPath, frameSetName, direction)
	if _, err := os.Stat(frameSetNameFilePath); os.IsNotExist(err) {
		os.MkdirAll(frameSetNameFilePath, 0700)
	}
	fi, err := os.Open(selection)
	if err != nil {
		panic(err)
	}
	// close file on exit and check for its returned error
	defer func() {
		if err := fi.Close(); err != nil {
			panic(err)
		}
	}()
	// make a read buffer to stream the data
	r := bufio.NewReader(fi)

	// Creates the file corresponding to the frame
	outputFile := fmt.Sprintf("%s/%d.png", frameSetNameFilePath, frame)

	// open output file
	fo, err := os.Create(outputFile)
	if err != nil {
		panic(err)
	}
	// close fo on exit and check for its returned error
	defer func() {
		if err := fo.Close(); err != nil {
			panic(err)
		}
	}()
	// make a write buffer to stream the data
	w := bufio.NewWriter(fo)

	// make a buffer to keep chunks that are read
	buf := make([]byte, 1024)
	for {
		// read a chunk
		n, err := r.Read(buf)
		if err != nil && err != io.EOF {
			panic(err)
		}
		if n == 0 {
			break
		}

		// write a chunk
		if _, err := w.Write(buf[:n]); err != nil {
			panic(err)
		}
	}

	if err = w.Flush(); err != nil {
		panic(err)
	}
	frameData := make(map[string]string)
	localPath := fmt.Sprintf("%s/%s/%d.png", basePath, frameSetName, frame)
	frameData["path"] = localPath
	frameData["sprite"] = CreateBase64File(outputFile)
	frameData["direction"] = direction
	frameData["frameNumber"] = strconv.Itoa(frame)
	return frameData
}
