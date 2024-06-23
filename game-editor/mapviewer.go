package main

import (
	"bufio"
	"fmt"
	"io"
	"os"
	"strings"

	"github.com/lafriks/go-tiled"
	"github.com/lafriks/go-tiled/render"
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
	fo, err := os.Create(fmt.Sprintf("%s/data/assets/tilesets/%s", a.dataDirectory, tilesetName))
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
func TiledParser(mapPath string, a *App, mapName string) string {
	gameMap, err := tiled.LoadFile(mapPath)
	if err != nil {
		fmt.Errorf("error while loading map!\nerror is %v", err)
	}
	renderer, err := render.NewRenderer(gameMap)
	if err != nil {
		fmt.Printf("map unsupported for rendering: %s", err.Error())
		os.Exit(2)
	}
	mapFinalPath := fmt.Sprintf("%s/data/assets/maps/%s.png", a.dataDirectory, mapName)
	mapAssetPath, _ := os.Open(mapFinalPath)
	err = renderer.SaveAsPng(mapAssetPath)
	if err != nil {
		fmt.Printf("Could not save tileset image!\nError is %v", err)
	}
	return CreateBase64File(mapFinalPath)
}
func (a *App) CreateMap(mapJson MapInput) string {
	mapPath, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select tiled .xml file",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "Map (*.xml)",
				Pattern:     "*.xml",
			},
		},
	})
	if err != nil {
		panic(err)
	}
	base64Picture := TiledParser(mapPath, a, mapJson.Name)

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
	f, err := os.OpenFile(fmt.Sprintf("%s/data/toml/maps.toml", a.dataDirectory), os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		panic(err)
	}
	defer f.Close()
	if _, err := f.Write(data); err != nil {
		panic(err)
	}
	return base64Picture
}
