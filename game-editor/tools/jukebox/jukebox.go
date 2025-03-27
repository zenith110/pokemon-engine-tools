package jukebox

import (
	"bufio"
	"fmt"
	"io"
	"os"
	"strconv"
	"strings"

	coreModels "github.com/zenith110/pokemon-engine-tools/models"
	parsing "github.com/zenith110/pokemon-engine-tools/parsing"
	core "github.com/zenith110/pokemon-engine-tools/tools-core"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// JukeboxApp struct
type JukeboxApp struct {
	app *core.App
}

// NewJukeboxApp creates a new JukeboxApp struct
func NewJukeboxApp(app *core.App) *JukeboxApp {
	return &JukeboxApp{
		app: app,
	}
}

func (j *JukeboxApp) GrabMusicTracks() []coreModels.Song {
	musicTracks, err := os.ReadDir(fmt.Sprintf("%s/data/assets/music", j.app.DataDirectory))
	if err != nil {
		fmt.Printf("Error is %v", err)
	}
	var musicTrackResults []coreModels.Song
	for _, song := range musicTracks {
		songId := 0
		songData := coreModels.Song{
			Name: song.Name(),
			Path: parsing.CreateBase64File(fmt.Sprintf("%s/data/assets/music/%s", j.app.DataDirectory, song.Name())),
			ID:   strconv.Itoa(songId),
		}
		songId += 1
		musicTrackResults = append(musicTrackResults, songData)
	}
	return musicTrackResults
}

func (j *JukeboxApp) UploadNewSong() {
	selection, err := runtime.OpenFileDialog(j.app.Ctx, runtime.OpenDialogOptions{
		Title: "Select song",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "Music (*.ogg)",
				Pattern:     "*.ogg",
			},
		},
	})
	if err != nil {
		panic(err)
	}
	formattedSongName := strings.ReplaceAll(selection, "\\", "/")

	splittedSongName := strings.Split(formattedSongName, "/")
	songName := splittedSongName[len(splittedSongName)-1]
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
	fo, err := os.Create(fmt.Sprintf("%s/data/assets/music/%s", j.app.DataDirectory, songName))
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
}
