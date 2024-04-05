package main

import (
	"fmt"
	"io"
	"log"
	"os"

	"github.com/pelletier/go-toml/v2"
	Models "github.com/zenith110/pokemon-go-engine/models"
)

func ParseMovesFile(file *os.File) Models.AllMoves {
	var moves Models.AllMoves

	b, err := io.ReadAll(file)
	if err != nil {
		panic(err)
	}

	err = toml.Unmarshal(b, &moves)
	if err != nil {
		panic(err)
	}
	return moves
}
func (a *App) ParseMoves() Models.AllMoves {
	file, err := os.Open(fmt.Sprintf("%s/data/toml/moves.toml", a.dataDirectory.DataDirectory))
	if err != nil {
		panic(err)
	}
	defer file.Close()
	moves := ParseMovesFile(file)
	return moves
}

func (a *App) UpdateMove(UpdatedMove) {
	file, err := os.Open(fmt.Sprintf("%s/data/toml/moves.toml", a.dataDirectory.DataDirectory))
	if err != nil {
		log.Fatalf("Error has occured while opening file to edit %v", err)
	}

	defer file.Close()
	var moves Models.AllMoves
	bytes, err := io.ReadAll(file)
	if err != nil {
		fmt.Printf("Error has occured reading data %v", err)
	}
	err = toml.Unmarshal(bytes, &moves)
	if err != nil {
		fmt.Printf("Error has occured reading unmarshling into struct %v", err)
	}
	for move := range moves.Move {
		if moves.Move[move].Id == trainerJson.Id {
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
