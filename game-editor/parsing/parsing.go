package parsing

import (
	"encoding/base64"
	"fmt"
	"io"
	"os"
	"strings"

	coreModels "github.com/zenith110/pokemon-engine-tools/models"
	core "github.com/zenith110/pokemon-engine-tools/tools-core"

	"github.com/pelletier/go-toml/v2"
	Models "github.com/zenith110/pokemon-go-engine-toml-models/models"
)

type ParsingApp struct {
	app *core.App
}

// NewJukeboxApp creates a new JukeboxApp struct
func NewParsingApp(app *core.App) *ParsingApp {
	return &ParsingApp{
		app: app,
	}
}
func toBase64(byte []byte) string {
	return base64.StdEncoding.EncodeToString(byte)
}
func CreateBase64File(file string) string {
	bytes, _ := os.ReadFile(file)
	var base64String string

	base64String += toBase64(bytes)
	return base64String
}

func ParsePokemonFile(a *ParsingApp) Models.PokemonToml {
	file, err := os.Open(fmt.Sprintf("%s/data/toml/pokemon.toml", a.app.DataDirectory))

	if err != nil {
		fmt.Printf("Error opening pokemon.toml: %v\n", err)
		return Models.PokemonToml{}
	}
	defer file.Close()

	var pokemons Models.PokemonToml

	b, err := io.ReadAll(file)
	if err != nil {
		fmt.Printf("Error reading pokemon.toml: %v\n", err)
		return Models.PokemonToml{}
	}

	err = toml.Unmarshal(b, &pokemons)
	if err != nil {
		fmt.Printf("Error unmarshaling pokemon.toml: %v\n", err)
		return Models.PokemonToml{}
	}
	return pokemons
}
func CreatePokemonTrainerEditorData(pokemons Models.PokemonToml, a *ParsingApp) []coreModels.PokemonTrainerEditor {
	var trainerEditorPokemons []coreModels.PokemonTrainerEditor

	for pokemon := range pokemons.Pokemon {
		var evolutions []coreModels.Evolution
		var types []string

		for pokemonType := range pokemons.Pokemon[pokemon].Types {
			types = append(types, (strings.ToUpper(pokemons.Pokemon[pokemon].Types[pokemonType][:1]) + pokemons.Pokemon[pokemon].Types[pokemonType][1:]))
		}
		for evolution := range pokemons.Pokemon[pokemon].Evolutions {
			if len(pokemons.Pokemon[pokemon].Evolutions[evolution].Methods) == 2 {
				evolutionData := coreModels.Evolution{
					Name:        strings.ToUpper(pokemons.Pokemon[pokemon].Evolutions[evolution].Name[:1]) + pokemons.Pokemon[pokemon].Evolutions[evolution].Name[1:],
					Method1:     pokemons.Pokemon[pokemon].Evolutions[evolution].Methods[0],
					Method2:     pokemons.Pokemon[pokemon].Evolutions[evolution].Methods[1],
					FrontSprite: CreateBase64File(fmt.Sprintf("%s/data/assets/pokemon/front/%s_front.png", a.app.DataDirectory, pokemons.Pokemon[pokemon].Evolutions[evolution].ID)),
					BackSprite:  CreateBase64File(fmt.Sprintf("%s/data/assets/pokemon/back/%s_back.png", a.app.DataDirectory, pokemons.Pokemon[pokemon].Evolutions[evolution].ID)),
					ShinyFront:  CreateBase64File(fmt.Sprintf("%s/data/assets/pokemon/shinyfront/%s_front_shiny.png", a.app.DataDirectory, pokemons.Pokemon[pokemon].Evolutions[evolution].ID)),
					ShinyBack:   CreateBase64File(fmt.Sprintf("%s/data/assets/pokemon/shinyback/%s_shiny_back.png", a.app.DataDirectory, pokemons.Pokemon[pokemon].Evolutions[evolution].ID)),
					Icon:        CreateBase64File(fmt.Sprintf("%s/data/assets/pokemon/icons/%s/%s.png", a.app.DataDirectory, pokemons.Pokemon[pokemon].Evolutions[evolution].ID, pokemons.Pokemon[pokemon].Evolutions[evolution].ID)),
					ID:          pokemons.Pokemon[pokemon].Evolutions[evolution].ID,
				}
				evolutions = append(evolutions, evolutionData)
			} else {
				evolutionData := coreModels.Evolution{
					Name:        strings.ToUpper(pokemons.Pokemon[pokemon].Evolutions[evolution].Name[:1]) + pokemons.Pokemon[pokemon].Evolutions[evolution].Name[1:],
					Method1:     "",
					Method2:     "",
					FrontSprite: CreateBase64File(fmt.Sprintf("%s/data/assets/pokemon/front/%s_front.png", a.app.DataDirectory, pokemons.Pokemon[pokemon].Evolutions[evolution].ID)),
					BackSprite:  CreateBase64File(fmt.Sprintf("%s/data/assets/pokemon/back/%s_back.png", a.app.DataDirectory, pokemons.Pokemon[pokemon].Evolutions[evolution].ID)),
					ShinyFront:  CreateBase64File(fmt.Sprintf("%s/data/assets/pokemon/shinyfront/%s_front_shiny.png", a.app.DataDirectory, pokemons.Pokemon[pokemon].Evolutions[evolution].ID)),
					ShinyBack:   CreateBase64File(fmt.Sprintf("%s/data/assets/pokemon/shinyback/%s_shiny_back.png", a.app.DataDirectory, pokemons.Pokemon[pokemon].Evolutions[evolution].ID)),
					Icon:        CreateBase64File(fmt.Sprintf("%s/data/assets/pokemon/icons/%s/%s.png", a.app.DataDirectory, pokemons.Pokemon[pokemon].Evolutions[evolution].ID, pokemons.Pokemon[pokemon].Evolutions[evolution].ID)),
					ID:          pokemons.Pokemon[pokemon].Evolutions[evolution].ID,
				}
				evolutions = append(evolutions, evolutionData)
			}
		}
		trainerEditorPokemon := coreModels.PokemonTrainerEditor{
			Name:           strings.ToUpper(pokemons.Pokemon[pokemon].Species[:1]) + pokemons.Pokemon[pokemon].Species[1:],
			FrontSprite:    CreateBase64File(fmt.Sprintf("%s/data/assets/pokemon/front/%s_front.png", a.app.DataDirectory, pokemons.Pokemon[pokemon].ID)),
			BackSprite:     CreateBase64File(fmt.Sprintf("%s/data/assets/pokemon/back/%s_back.png", a.app.DataDirectory, pokemons.Pokemon[pokemon].ID)),
			ShinyFront:     CreateBase64File(fmt.Sprintf("%s/data/assets/pokemon/shinyfront/%s_front_shiny.png", a.app.DataDirectory, pokemons.Pokemon[pokemon].ID)),
			ShinyBack:      CreateBase64File(fmt.Sprintf("%s/data/assets/pokemon/shinyback/%s_shiny_back.png", a.app.DataDirectory, pokemons.Pokemon[pokemon].ID)),
			Icon:           CreateBase64File(fmt.Sprintf("%s/data/assets/pokemon/icons/%s/%s.gif", a.app.DataDirectory, pokemons.Pokemon[pokemon].ID, pokemons.Pokemon[pokemon].ID)),
			HP:             pokemons.Pokemon[pokemon].Stats.Hp,
			Defense:        pokemons.Pokemon[pokemon].Stats.Defense,
			SpecialAttack:  pokemons.Pokemon[pokemon].Stats.SpecialAttack,
			Speed:          pokemons.Pokemon[pokemon].Stats.Speed,
			SpecialDefense: pokemons.Pokemon[pokemon].Stats.SpecialDefense,
			Moves:          pokemons.Pokemon[pokemon].Moves,
			Attack:         pokemons.Pokemon[pokemon].Stats.Attack,
			ID:             pokemons.Pokemon[pokemon].ID,
			Abilities:      pokemons.Pokemon[pokemon].Abilities,
			Evolutions:     evolutions,
			Types:          types,
		}
		trainerEditorPokemons = append(trainerEditorPokemons, trainerEditorPokemon)
	}

	return trainerEditorPokemons
}
func (a *ParsingApp) ParsePokemonData() []coreModels.PokemonTrainerEditor {
	pokemons := ParsePokemonFile(a)
	return CreatePokemonTrainerEditorData(pokemons, a)
}
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

func (a *ParsingApp) ParseHeldItems() []coreModels.HeldItem {
	file, err := os.Open(fmt.Sprintf("%s/data/toml/helditems.toml", a.app.DataDirectory))
	if err != nil {
		panic(err)
	}
	defer file.Close()

	var heldItems Models.HeldItemToml

	b, err := io.ReadAll(file)
	if err != nil {
		panic(err)
	}

	err = toml.Unmarshal(b, &heldItems)
	if err != nil {
		panic(err)
	}
	var heldItemsData []coreModels.HeldItem
	for heldItem := range heldItems.HeldItems {
		heldItemData := coreModels.HeldItem{
			Name: heldItems.HeldItems[heldItem].Name,
		}
		heldItemsData = append(heldItemsData, heldItemData)
	}
	return heldItemsData
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
