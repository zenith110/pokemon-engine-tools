package mapeditor

import (
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/lafriks/go-tiled"
	"github.com/lafriks/go-tiled/render"
	"github.com/pelletier/go-toml/v2"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	coreModels "github.com/zenith110/pokemon-engine-tools/models"
	parsing "github.com/zenith110/pokemon-engine-tools/parsing"
	core "github.com/zenith110/pokemon-engine-tools/tools-core"
)

type MapEditorApp struct {
	app *core.App
}

// NewJukeboxApp creates a new JukeboxApp struct
func NewMapEditorApp(app *core.App) *MapEditorApp {
	return &MapEditorApp{
		app: app,
	}
}

func TiledParser(mapPath string, a *MapEditorApp) map[string]string {

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
	mapFinalPath := fmt.Sprintf("%s/data/assets/maps/%s.png", a.app.DataDirectory, finalFileName)

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
		"mapImage":      parsing.CreateBase64File(mapFinalPath),
		"tilesetHeight": strconv.Itoa(gameMap.Height),
		"tilesetWidth":  strconv.Itoa(gameMap.Width),
		"tilesetPath":   gameMap.Tilesets[0].Source,
		"mapName":       finalFileName,
	}

	return mapData
}
func (a *MapEditorApp) CreateMap() string {
	mapPath, err := runtime.OpenFileDialog(a.app.Ctx, runtime.OpenDialogOptions{
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

	mapOutput := coreModels.MapOutput{
		Name:            tiledData["mapName"],
		XAxisMax:        xAxisMax,
		YAxisMax:        yAxisMax,
		TilesetLocation: tiledData["tilesetPath"],
	}

	var mapOutputs []coreModels.MapOutput
	mapOutputs = append(mapOutputs, mapOutput)
	mapData := coreModels.MapData{
		Map: mapOutputs,
	}

	data, err := toml.Marshal(mapData)
	if err != nil {
		panic(fmt.Errorf("error had occured while creating map data!\n%v", err))
	}

	// Write the encoded data to a file
	f, err := os.OpenFile(fmt.Sprintf("%s/data/toml/maps.toml", a.app.DataDirectory), os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		panic(err)
	}
	defer f.Close()
	if _, err := f.Write(data); err != nil {
		panic(err)
	}
	return tiledData["mapImage"]
}
