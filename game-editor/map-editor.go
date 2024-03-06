package main

import (
	"fmt"
	"os"

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

	return selection
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
