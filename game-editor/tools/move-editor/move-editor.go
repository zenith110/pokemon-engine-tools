package moveeditor

import (
	"fmt"
	"io"
	"log"
	"os"
	"strconv"

	"github.com/pelletier/go-toml/v2"
	coreModels "github.com/zenith110/pokemon-engine-tools/models"
	core "github.com/zenith110/pokemon-engine-tools/tools-core"
	Models "github.com/zenith110/pokemon-go-engine-toml-models/models"
)

type MoveEditorApp struct {
	app *core.App
}

// NewJukeboxApp creates a new JukeboxApp struct
func NewMoveEditorApp(app *core.App) *MoveEditorApp {
	return &MoveEditorApp{
		app: app,
	}
}
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
func (a *MoveEditorApp) ParseMoves() Models.AllMoves {
	file, err := os.Open(fmt.Sprintf("%s/data/toml/moves.toml", a.app.DataDirectory))
	if err != nil {
		panic(err)
	}
	defer file.Close()
	moves := ParseMovesFile(file)
	return moves
}

func (a *MoveEditorApp) UpdateMove(updatedMove coreModels.UpdatedMove) {
	file, err := os.Open(fmt.Sprintf("%s/data/toml/moves.toml", a.app.DataDirectory))
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
	os.Remove(fmt.Sprintf("%s/data/toml/moves.toml", a.app.DataDirectory))
	f, err := os.OpenFile(fmt.Sprintf("%s/data/toml/moves.toml", a.app.DataDirectory), os.O_CREATE, 0644)
	if err != nil {
		log.Fatalf("Error occured while opening file %v\n", err)
	}
	defer f.Close()
	if _, err := f.Write(data); err != nil {
		fmt.Printf("Error occured while writing data %v\n", err)
	}
}
