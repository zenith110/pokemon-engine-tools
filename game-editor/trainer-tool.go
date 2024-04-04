package main

import (
	"fmt"
	"io"
	"log"
	"os"
	"strings"

	"github.com/pelletier/go-toml/v2"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	Models "github.com/zenith110/pokemon-go-engine/models"
)

func (a *App) CreateTrainerData(trainerJson TrainerJson) {
	var pokemons []Models.Pokemons
	for index := range trainerJson.Pokemons {

		pokemon := Models.Pokemons{
			Species:        trainerJson.Pokemons[index].Species,
			Level:          trainerJson.Pokemons[index].Level,
			Moves:          trainerJson.Pokemons[index].Moves,
			HeldItem:       trainerJson.Pokemons[index].HeldItem,
			HP:             trainerJson.Pokemons[index].HP,
			Defense:        trainerJson.Pokemons[index].Defense,
			Attack:         trainerJson.Pokemons[index].Attack,
			SpecialAttack:  trainerJson.Pokemons[index].SpecialAttack,
			SpecialDefense: trainerJson.Pokemons[index].SpecialDefense,
			Speed:          trainerJson.Pokemons[index].Speed,
			ID:             trainerJson.Pokemons[index].ID,
		}

		pokemons = append(pokemons, pokemon)
	}

	var trainers []Models.Trainers

	trainer := Models.Trainers{
		Name:      trainerJson.Name,
		Sprite:    trainerJson.Sprite,
		ID:        trainerJson.Id,
		Pokemons:  pokemons,
		ClassType: trainerJson.ClassType,
	}

	trainers = append(trainers, trainer)
	trainerConfig := Models.TrainerToml{
		Trainers: trainers,
	}
	data, err := toml.Marshal(trainerConfig)
	if err != nil {
		panic(fmt.Errorf("error had occured while creating trainer data!\n%v", err))
	}

	// Write the encoded data to a file
	f, err := os.OpenFile(fmt.Sprintf("%s/data/toml/trainers.toml", a.dataDirectory.DataDirectory), os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		panic(err)
	}
	defer f.Close()
	if _, err := f.Write(data); err != nil {
		panic(err)
	}
}
func CheckFileExist(filepath string) bool {
	_, error := os.Stat(filepath)
	return error == nil
}

func (a *App) UpdateTrainer(trainerJson TrainerJson) {

	file, err := os.Open(fmt.Sprintf("%s/data/toml/trainers.toml", a.dataDirectory.DataDirectory))
	if err != nil {
		log.Fatalf("Error has occured while opening file to edit %v", err)
	}

	defer file.Close()
	var trainers Models.TrainerToml
	bytes, err := io.ReadAll(file)
	if err != nil {
		fmt.Printf("Error has occured reading data %v", err)
	}
	err = toml.Unmarshal(bytes, &trainers)
	if err != nil {
		fmt.Printf("Error has occured reading unmarshling into struct %v", err)
	}
	for trainer := range trainers.Trainers {
		if trainers.Trainers[trainer].ID == trainerJson.Id {
			var pokemons []Models.Pokemons
			for pokemonIndex := range trainerJson.Pokemons {
				pokemon := Models.Pokemons{
					ID:             trainerJson.Pokemons[pokemonIndex].ID,
					HP:             trainerJson.Pokemons[pokemonIndex].HP,
					Species:        trainerJson.Pokemons[pokemonIndex].Species,
					Speed:          trainerJson.Pokemons[pokemonIndex].Speed,
					Attack:         trainerJson.Pokemons[pokemonIndex].Attack,
					Defense:        trainerJson.Pokemons[pokemonIndex].Defense,
					SpecialAttack:  trainerJson.Pokemons[pokemonIndex].SpecialAttack,
					SpecialDefense: trainerJson.Pokemons[pokemonIndex].SpecialDefense,
					Moves:          trainerJson.Pokemons[pokemonIndex].Moves,
					Level:          trainerJson.Pokemons[pokemonIndex].Level,
					HeldItem:       trainerJson.Pokemons[pokemonIndex].HeldItem,
				}
				pokemons = append(pokemons, pokemon)
			}
			trainers.Trainers[trainer].Name = trainerJson.Name
			trainers.Trainers[trainer].Pokemons = pokemons
			trainers.Trainers[trainer].ClassType = trainerJson.ClassType
			trainers.Trainers[trainer].Sprite = trainerJson.Sprite
		}
	}

	data, err := toml.Marshal(trainers)
	if err != nil {
		panic(fmt.Errorf("error had occured while creating trainer data!\n%v", err))
	}
	os.Remove(fmt.Sprintf("%s/data/toml/trainers.toml", a.dataDirectory.DataDirectory))
	f, err := os.OpenFile(fmt.Sprintf("%s/data/toml/trainers.toml", a.dataDirectory.DataDirectory), os.O_CREATE, 0644)
	if err != nil {
		log.Fatalf("Error occured while opening file %v", err)
	}
	defer f.Close()
	if _, err := f.Write(data); err != nil {
		fmt.Printf("Error occured while writing data %v", err)
	}
}

func (a *App) UpdateTrainerSprite() string {
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
	selectionUpdated := strings.ReplaceAll(selection, "\\", "/")
	selectionSplit := strings.Split(selectionUpdated, "/")
	selectionFinal := selectionSplit[len(selectionSplit)-1]
	return selectionFinal
}
