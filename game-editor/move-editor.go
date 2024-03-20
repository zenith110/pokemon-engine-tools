package main

import (
	"fmt"
	"io"
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
