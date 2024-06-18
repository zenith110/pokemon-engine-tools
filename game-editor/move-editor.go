package main

import (
	"fmt"
	"io"
	"log"
	"os"
	"strconv"

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
	file, err := os.Open(fmt.Sprintf("%s/data/toml/moves.toml", a.dataDirectory))
	if err != nil {
		panic(err)
	}
	defer file.Close()
	moves := ParseMovesFile(file)
	return moves
}

func (a *App) UpdateMove(updatedMove UpdatedMove) {
	file, err := os.Open(fmt.Sprintf("%s/data/toml/moves.toml", a.dataDirectory))
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
		fmt.Printf("Error has occured reading unmarshling into struct %v\n", err)
	}
	for move := range moves.Move {
		id := strconv.Itoa(moves.Move[move].ID)
		if id == updatedMove.Id {
			moves.Move[move].Accuracy = updatedMove.Accuracy
			moves.Move[move].Pp = updatedMove.PP
			moves.Move[move].Power = updatedMove.Power
			moves.Move[move].Type = updatedMove.Type
			moves.Move[move].Name = updatedMove.Name
		}
	}
	data, err := toml.Marshal(moves)
	if err != nil {
		panic(fmt.Errorf("error had occured while creating move data!\n%v", err))
	}
	os.Remove(fmt.Sprintf("%s/data/toml/moves.toml", a.dataDirectory))
	f, err := os.OpenFile(fmt.Sprintf("%s/data/toml/moves.toml", a.dataDirectory), os.O_CREATE, 0644)
	if err != nil {
		log.Fatalf("Error occured while opening file %v\n", err)
	}
	defer f.Close()
	if _, err := f.Write(data); err != nil {
		fmt.Printf("Error occured while writing data %v\n", err)
	}
}
