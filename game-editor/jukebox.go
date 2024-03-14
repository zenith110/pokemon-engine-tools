package main

import (
	"bufio"
	"fmt"
	"io"
	"os"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func (a *App) GrabMusicTracks() []Song {
	musicTracks, err := os.ReadDir(fmt.Sprintf("%s/data/assets/music", a.dataDirectory.DataDirectory))
	if err != nil {
		fmt.Printf("Error is %v", err)
	}
	var musicTrackResults []Song
	for _, song := range musicTracks {
		fmt.Print(song.Name())
		songData := Song{
			Name: song.Name(),
			Path: CreateBase64File(fmt.Sprintf("%s/data/assets/music/%s", a.dataDirectory.DataDirectory, song.Name())),
		}
		musicTrackResults = append(musicTrackResults, songData)
	}
	return musicTrackResults
}

func (a *App) UploadNewSong() {
	selection, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
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
	fo, err := os.Create(fmt.Sprintf("%s/data/assets/music/%s", a.dataDirectory.DataDirectory, songName))
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
