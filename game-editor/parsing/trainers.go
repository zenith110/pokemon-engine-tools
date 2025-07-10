package parsing

import (
	"fmt"
	"io"
	"os"

	"github.com/pelletier/go-toml/v2"
	coreModels "github.com/zenith110/pokemon-engine-tools/models"
	Models "github.com/zenith110/pokemon-go-engine-toml-models/models"
)

func ParseTrainerClassFile(a *ParsingApp) []byte {
	file, err := os.Open(fmt.Sprintf("%s/data/toml/trainerclasses.toml", a.app.DataDirectory))
	if err != nil {
		panic(err)
	}
	defer file.Close()

	bytes, err := io.ReadAll(file)
	if err != nil {
		panic(err)
	}
	return bytes
}
func ParseTrainerClassModel(trainerclasses Models.TrainerClasses, bytes []byte) Models.TrainerClasses {
	err := toml.Unmarshal(bytes, &trainerclasses)
	if err != nil {
		panic(err)
	}
	return trainerclasses
}
func (a *ParsingApp) ParseTrainerClass() Models.TrainerClasses {
	bytes := ParseTrainerClassFile(a)
	var trainerclasses Models.TrainerClasses
	return ParseTrainerClassModel(trainerclasses, bytes)
}

func (a *ParsingApp) ParseTrainers() []coreModels.TrainerJson {
	file, err := os.Open(fmt.Sprintf("%s/data/toml/trainers.toml", a.app.DataDirectory))
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
	var trainersData []coreModels.TrainerJson
	for trainer := range trainers.Trainers {
		var pokemons []coreModels.PokemonJson
		for pokemon := range trainers.Trainers[trainer].Pokemons {
			pokemonData := coreModels.PokemonJson{
				Species:        trainers.Trainers[trainer].Pokemons[pokemon].Species,
				HP:             trainers.Trainers[trainer].Pokemons[pokemon].HP,
				Speed:          trainers.Trainers[trainer].Pokemons[pokemon].Speed,
				SpecialAttack:  trainers.Trainers[trainer].Pokemons[pokemon].SpecialAttack,
				SpecialDefense: trainers.Trainers[trainer].Pokemons[pokemon].SpecialDefense,
				Attack:         trainers.Trainers[trainer].Pokemons[pokemon].Attack,
				Defense:        trainers.Trainers[trainer].Pokemons[pokemon].Defense,
				Front:          CreateBase64File(fmt.Sprintf("%s/data/assets/pokemon/front/%s_front.png", a.app.DataDirectory, trainers.Trainers[trainer].Pokemons[pokemon].ID)),
				ID:             trainers.Trainers[trainer].Pokemons[pokemon].ID,
				Icon:           CreateBase64File(fmt.Sprintf("%s/data/assets/pokemon/icons/%s/%s.gif", a.app.DataDirectory, trainers.Trainers[trainer].Pokemons[pokemon].ID, trainers.Trainers[trainer].Pokemons[pokemon].ID)),
				Moves:          trainers.Trainers[trainer].Pokemons[pokemon].Moves,
				Level:          trainers.Trainers[trainer].Pokemons[pokemon].Level,
				HeldItem:       trainers.Trainers[trainer].Pokemons[pokemon].HeldItem,
				Cry:            CreateBase64File(fmt.Sprintf("%s/data/assets/pokemon/cries/%s.wav", a.app.DataDirectory, trainers.Trainers[trainer].Pokemons[pokemon].ID)),
			}
			pokemons = append(pokemons, pokemonData)

		}

		trainerData := coreModels.TrainerJson{
			Name:       trainers.Trainers[trainer].Name,
			Sprite:     CreateBase64File(fmt.Sprintf("%s/data/assets/trainers_sprite/%s", a.app.DataDirectory, trainers.Trainers[trainer].Sprite)),
			SpriteName: trainers.Trainers[trainer].Sprite,
			Id:         trainers.Trainers[trainer].ID,
			ClassType:  trainers.Trainers[trainer].ClassType,
			Pokemons:   pokemons,
		}
		trainersData = append(trainersData, trainerData)
	}
	return trainersData
}

func (a *ParsingApp) GrabTrainerSprites() []coreModels.TrainerSprite {
	trainerSprites, err := os.ReadDir(fmt.Sprintf("%s/data/assets/trainers_sprite", a.app.DataDirectory))
	if err != nil {
		fmt.Printf("Error is %v", err)
	}
	var trainerSpritesResult []coreModels.TrainerSprite
	for _, sprite := range trainerSprites {
		trainerSprites := coreModels.TrainerSprite{
			Name: sprite.Name(),
			Path: CreateBase64File(fmt.Sprintf("%s/data/assets/trainers_sprite/%s", a.app.DataDirectory, sprite.Name())),
		}
		trainerSpritesResult = append(trainerSpritesResult, trainerSprites)
	}
	return trainerSpritesResult
}
