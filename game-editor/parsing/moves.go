package parsing

import (
	"fmt"
	"io"
	"os"

	"github.com/pelletier/go-toml/v2"
	Models "github.com/zenith110/pokemon-go-engine-toml-models/models"
)

func (a *ParsingApp) GrabAllMoves() Models.AllMoves {
	movesFileName := fmt.Sprintf("%s/data/toml/moves.toml", a.app.DataDirectory)
	moves, err := os.Open(movesFileName)
	if err != nil {
		fmt.Printf("Error is %v", err)
	}
	defer moves.Close()
	var movesData Models.AllMoves
	b, err := io.ReadAll(moves)
	if err != nil {
		panic(fmt.Errorf("error is %v", err))
	}

	err = toml.Unmarshal(b, &movesData)
	if err != nil {
		panic(err)
	}
	return movesData
}
