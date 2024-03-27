package main

import (
	"bufio"
	"fmt"
	"io"
	"os"
	"strings"

	"github.com/pelletier/go-toml/v2"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func (a *App) SetMapTileset() string {

	selection, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select tileset file",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "Images (*.png)",
				Pattern:     "*.png",
			},
		},
	})
	if err != nil {
		panic(err)
	}
	formattedTilesetName := strings.ReplaceAll(selection, "\\", "/")

	splittedTilesetName := strings.Split(formattedTilesetName, "/")
	tilesetName := splittedTilesetName[len(splittedTilesetName)-1]

	fi, err := os.Open(selection)
	if err != nil {
		panic(err)
	}

	// close fi on exit and check for its returned error
	defer func() {
		if err := fi.Close(); err != nil {
			panic(err)
		}
	}()
	// make a read buffer
	r := bufio.NewReader(fi)

	// open output file
	fo, err := os.Create(fmt.Sprintf("%s/data/assets/tilesets/%s", a.dataDirectory.DataDirectory, tilesetName))
	if err != nil {
		panic(err)
	}
	// close fo on exit and check for its returned error
	defer func() {
		if err := fo.Close(); err != nil {
			panic(err)
		}
	}()
	// make a write buffer
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
	return tilesetName
}

func (a *App) CreateMapConfig(mapJson MapInput) {
	mapOutput := MapOutput{
		Name:            mapJson.Name,
		XAxisMax:        mapJson.XAxisMax,
		YAxisMax:        mapJson.YAxisMax,
		TilesetLocation: mapJson.TilesetLocation,
	}
	var mapOutputs []MapOutput
	mapOutputs = append(mapOutputs, mapOutput)
	mapData := MapData{
		Map: mapOutputs,
	}

	data, err := toml.Marshal(mapData)
	if err != nil {
		panic(fmt.Errorf("error had occured while creating map data!\n%v", err))
	}

	// Write the encoded data to a file
	f, err := os.OpenFile(fmt.Sprintf("%s/data/toml/maps.toml", a.dataDirectory.DataDirectory), os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		panic(err)
	}
	defer f.Close()
	if _, err := f.Write(data); err != nil {
		panic(err)
	}
}
