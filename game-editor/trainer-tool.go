package main

import (
	"fmt"
	"io"
	"log"
	"os"

	"github.com/pelletier/go-toml/v2"
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
	if error == nil {
		return false
	}
	return true
}
func UpdateTrainerToml(a *App, data []byte) {
	// Write the encoded data to a file
	f, err := os.OpenFile(fmt.Sprintf("%s/data/toml/trainers.toml", a.dataDirectory.DataDirectory), os.O_CREATE, 0644)
	if err != nil {
		panic(err)
	}
	defer f.Close()
	if _, err := f.Write(data); err != nil {
		panic(err)
	}
}
func (a *App) UpdateTrainer(trainerJson TrainerJson) {
	file, err := os.Open(fmt.Sprintf("%s/data/toml/trainers.toml", a.dataDirectory.DataDirectory))
	if err != nil {
		log.Fatalf("Error has occured while opening file to edit %v", err)
	}
	if err != nil {
		panic(err)
	}
	defer file.Close()
	var trainers Models.TrainerToml
	bytes, err := io.ReadAll(file)
	if err != nil {
		panic(err)
	}
	err = toml.Unmarshal(bytes, &trainers)
	if err != nil {
		panic(err)
	}
	for trainer := range trainers.Trainers {
		if trainers.Trainers[trainer].ID == trainerJson.Id {
			trainers.Trainers[trainer].Name = trainerJson.Name
		}
	}
	data, err := toml.Marshal(trainers)
	if err != nil {
		panic(fmt.Errorf("error had occured while creating trainer data!\n%v", err))
	}
	fileExist := CheckFileExist(fmt.Sprintf("%s/data/toml/trainers2.toml", a.dataDirectory.DataDirectory))
	if fileExist {
		os.Remove(fmt.Sprintf("%s/data/toml/trainers2.toml", a.dataDirectory.DataDirectory))
		UpdateTrainerToml(a, data)
	} else {
		UpdateTrainerToml(a, data)
	}
}
