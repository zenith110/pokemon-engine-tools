package main

import (
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/lafriks/go-tiled"
	"github.com/lafriks/go-tiled/render"
	"github.com/pelletier/go-toml/v2"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func TiledParser(mapPath string, a *App) map[string]string {

	fileName := strings.Split(strings.Replace(mapPath, `\`, "/", -1), "/")

	finalFileName := strings.Replace(fileName[len(fileName)-1], ".tmx", "", -1)
	gameMap, err := tiled.LoadFile(mapPath)
	if err != nil {
		fmt.Printf("error parsing map: %s", err.Error())
		os.Exit(2)
	}

	renderer, err := render.NewRenderer(gameMap)
	if err != nil {
		fmt.Printf("map unsupported for rendering: %s", err.Error())
		os.Exit(2)
	}
	err = renderer.RenderVisibleLayers()
	if err != nil {
		fmt.Printf("layer unsupported for rendering: %s", err.Error())
		os.Exit(2)
	}
	mapFinalPath := fmt.Sprintf("%s/data/assets/maps/%s.png", a.dataDirectory, finalFileName)

	f, err := os.Create(mapFinalPath)
	if err != nil {
		fmt.Printf("Error occured while creating map!\n Error is %v\n", err)
	}
	defer f.Close()
	err = renderer.SaveAsPng(f)

	if err != nil {
		fmt.Printf("Could not save tileset image!\nError is %v", err)
	}

	mapData := map[string]string{
		"mapImage":      CreateBase64File(mapFinalPath),
		"tilesetHeight": strconv.Itoa(gameMap.Height),
		"tilesetWidth":  strconv.Itoa(gameMap.Width),
		"tilesetPath":   gameMap.Tilesets[0].Source,
		"mapName":       finalFileName,
	}

	return mapData
}
func (a *App) CreateMap() string {
	mapPath, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select tiled .tmx file",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "Map (*.tmx)",
				Pattern:     "*.tmx",
			},
		},
	})
	if err != nil {
		panic(err)
	}
	tiledData := TiledParser(mapPath, a)
	xAxisMax, _ := strconv.Atoi(tiledData["tilesetWidth"])
	yAxisMax, _ := strconv.Atoi(tiledData["tilesetHeight"])

	mapOutput := MapOutput{
		Name:            tiledData["mapName"],
		XAxisMax:        xAxisMax,
		YAxisMax:        yAxisMax,
		TilesetLocation: tiledData["tilesetPath"],
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
	return tiledData["mapImage"]
}
