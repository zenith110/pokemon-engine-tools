package main

import (
	"bufio"
	"fmt"
	"image"
	"image/gif"
	"image/png"
	"io"
	"io/fs"
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/andybons/gogif"
	"github.com/pelletier/go-toml/v2"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"github.com/zenith110/pokemon-go-engine/models"
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

func CreateImagesArray(filePath string) []image.Image {
	var images []image.Image
	files, err := os.ReadDir(filePath)
	if err != nil {
		fmt.Printf("Error has occured while making image array!\nError is %v", err)
	}
	for _, file := range files {
		if strings.Contains(file.Name(), ".png") {
			overworldFramePath := fmt.Sprintf("%s/%s", filePath, file.Name())

			f, err := os.Open(overworldFramePath)
			if err != nil {
				fmt.Printf("Error has occured while opening file %s!\nError is %v", file.Name(), err)
			}
			defer f.Close()
			image, err := png.Decode(f)
			if err != nil {
				fmt.Printf("Error occured while reading %s!\nError is %v", file.Name(), err)
			}
			fmt.Print(image)
			images = append(images, image)
		}
	}

	return images
}

// Creates a frame, returns base64 version of the frame + base location in game engine
func (a *App) CreateOverworldFrame(frameSetName string, frame int, overworldId int, direction string) map[string]string {
	selection, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select overworld frame",
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
		fmt.Errorf("error has occured while opening file!\nerror is: %v", err)
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
	localPath := fmt.Sprintf("%s/%d/%s/%d.png", basePath, frame, frameSetName, frame)
	frameData["path"] = localPath
	frameData["sprite"] = CreateBase64File(outputFile)
	frameData["direction"] = direction
	frameData["frameNumber"] = strconv.Itoa(frame)
	return frameData
}

func (a *App) CreteOverworldGif(frameSetName string, frame int, overworldId int, direction string) string {
	// Gets all the files of a directory
	basePath := "data/assets/overworlds"
	filePath := fmt.Sprintf("%s/%s", a.dataDirectory, basePath)

	// Creates new directory for the ow
	newOverWorldFolderPath := fmt.Sprintf("%s/%d", filePath, overworldId)
	animatedOverworldBase := fmt.Sprintf("%s/%s/%s", newOverWorldFolderPath, frameSetName, direction)

	animatedOverworldFileName := fmt.Sprintf("%s/%s/%s/%d.gif", newOverWorldFolderPath, frameSetName, direction, overworldId)
	// Creates a writer to be used for the gif
	animatedOverworld, err := os.Create(animatedOverworldFileName)

	if err != nil {
		fmt.Printf("Error has been thrown while creating a gif!\nError is %v", err)
	}
	outputGif := &gif.GIF{
		LoopCount: 0,
	}

	// Goes through all the png files and adds them to an array to animate
	images := CreateImagesArray(animatedOverworldBase)

	for _, imageBase := range images {
		bounds := imageBase.Bounds()
		palettedImage := image.NewPaletted(bounds, nil)
		quantizer := gogif.MedianCutQuantizer{NumColor: 64}
		quantizer.Quantize(palettedImage, bounds, imageBase, image.Point{})

		// Add new frame to animated GIF
		outputGif.Image = append(outputGif.Image, palettedImage)
		outputGif.Delay = append(outputGif.Delay, 0)
	}
	defer animatedOverworld.Close()
	gif.EncodeAll(animatedOverworld, outputGif)
	overworldGif := CreateBase64File(animatedOverworldFileName)
	return overworldGif

}

func (a *App) CreateOverworldTomlEntry(overworldData OverworldDataJson) {
	fmt.Print(overworldData)
	var overworlds []models.Overworld

	overworld := models.Overworld{
		Name:     overworldData.Name,
		ID:       overworldData.ID,
		IsPlayer: overworldData.IsPlayer,
		Swimming: models.Swimming{
			OverworldDirectionFrames: overworldData.SwimmingFrames,
		},
		Surfing: models.Surfing{
			OverworldDirectionFrames: overworldData.SwimmingFrames,
		},
		Running: models.Running{
			OverworldDirectionFrames: overworldData.RunningFrames,
		},
		Walking: models.Walking{
			OverworldDirectionFrames: overworldData.WalkingFrames,
		},
	}
	overworlds = append(overworlds, overworld)
	overworldsHolder := models.OverworldsHolder{
		Overworlds: overworlds,
	}
	data, err := toml.Marshal(overworldsHolder)
	if err != nil {
		fmt.Printf("error while creating overworld data! %v\n", err)
	}

	f, err := os.OpenFile(fmt.Sprintf("%s/data/assets/toml/overworlds.toml", a.dataDirectory), os.O_CREATE|os.O_APPEND, 0644)
	if err != nil {
		log.Fatalf("Error occured while opening file %v\n", err)

	}
	defer f.Close()
	if _, err := f.Write(data); err != nil {
		fmt.Printf("Error occured while writing data %v\n", err)
	}
}
