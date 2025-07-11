package parsing

import (
	"fmt"
	"os"
	"strconv"

	coreModels "github.com/zenith110/pokemon-engine-tools/models"
)

func (j *ParsingApp) GrabMusicTracks() []coreModels.Song {
	musicTracks, err := os.ReadDir(fmt.Sprintf("%s/data/assets/music", j.app.DataDirectory))
	if err != nil {
		fmt.Printf("Error is %v", err)
	}
	var musicTrackResults []coreModels.Song
	for _, song := range musicTracks {
		songId := 0
		songData := coreModels.Song{
			Name: song.Name(),
			Path: CreateBase64File(fmt.Sprintf("%s/data/assets/music/%s", j.app.DataDirectory, song.Name())),
			ID:   strconv.Itoa(songId),
		}
		songId += 1
		musicTrackResults = append(musicTrackResults, songData)
	}
	return musicTrackResults
}
