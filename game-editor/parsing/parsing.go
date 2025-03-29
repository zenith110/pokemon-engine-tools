package parsing

import (
	"encoding/base64"
	"fmt"
	"io"
	"os"
	"strings"
	"sync"

	coreModels "github.com/zenith110/pokemon-engine-tools/models"
	core "github.com/zenith110/pokemon-engine-tools/tools-core"

	"github.com/pelletier/go-toml/v2"
	Models "github.com/zenith110/pokemon-go-engine-toml-models/models"
)

type ParsingApp struct {
	app *core.App
}

type OnLoadPokemonEditor struct {
	ID   string `toml:"id"`
	Name string `toml:"species"`
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

func ParsePokemonFile(a *ParsingApp) []OnLoadPokemonEditor {
	file, err := os.Open(fmt.Sprintf("%s/data/toml/pokemon.toml", a.app.DataDirectory))

	if err != nil {
		fmt.Printf("Error opening pokemon.toml: %v\n", err)
		return []OnLoadPokemonEditor{}
	}
	defer file.Close()

	var pokemons Models.PokemonToml

	b, err := io.ReadAll(file)
	if err != nil {
		fmt.Printf("Error reading pokemon.toml: %v\n", err)
		return []OnLoadPokemonEditor{}
	}

	err = toml.Unmarshal(b, &pokemons)
	if err != nil {
		fmt.Printf("Error unmarshaling pokemon.toml: %v\n", err)
		return []OnLoadPokemonEditor{}
	}

	onLoadData := make([]OnLoadPokemonEditor, 0, len(pokemons.Pokemon))
	for _, pokemon := range pokemons.Pokemon {
		onLoad := OnLoadPokemonEditor{
			ID:   pokemon.ID,
			Name: strings.ToUpper(pokemon.Species[:1]) + pokemon.Species[1:],
		}
		onLoadData = append(onLoadData, onLoad)
	}
	return onLoadData
}

func CreatePokemonTrainerEditorData(pokemons Models.PokemonToml, a *ParsingApp) []coreModels.PokemonTrainerEditor {
	var trainerEditorPokemons []coreModels.PokemonTrainerEditor
	resultChan := make(chan coreModels.PokemonTrainerEditor, len(pokemons.Pokemon))
	var wg sync.WaitGroup

	for _, pokemonData := range pokemons.Pokemon {
		wg.Add(1)
		go func(data Models.Pokemon) {
			defer wg.Done()
			var evolutions []coreModels.Evolution
			var types []string
			var assetsWg sync.WaitGroup

			// Load types
			for _, pokemonType := range data.Types {
				types = append(types, strings.ToUpper(pokemonType[:1])+pokemonType[1:])
			}

			// Load evolutions concurrently
			for _, evolution := range data.Evolutions {
				assetsWg.Add(1)
				evoID := evolution.ID

				// Create channel for icon
				iconChan := make(chan string, 1)

				// Load evolution icon
				go func() {
					defer assetsWg.Done()
					iconChan <- CreateBase64File(fmt.Sprintf("%s/data/assets/pokemon/icons/%s/%s.gif", a.app.DataDirectory, evoID, evoID))
				}()

				// Create evolution data
				evolutionData := coreModels.Evolution{
					Name:    strings.ToUpper(evolution.Name[:1]) + evolution.Name[1:],
					Method1: "",
					Method2: "",
					ID:      evoID,
				}

				if len(evolution.Methods) == 2 {
					evolutionData.Method1 = evolution.Methods[0]
					evolutionData.Method2 = evolution.Methods[1]
				}

				// Collect icon
				evolutionData.Icon = <-iconChan
				close(iconChan)

				evolutions = append(evolutions, evolutionData)
			}

			// Load main Pokémon assets concurrently
			assetsWg.Add(6)

			// Create separate channels for each main asset type
			frontChan := make(chan string, 1)
			backChan := make(chan string, 1)
			shinyFrontChan := make(chan string, 1)
			shinyBackChan := make(chan string, 1)
			iconChan := make(chan string, 1)
			cryChan := make(chan string, 1)

			go func() {
				defer assetsWg.Done()
				frontChan <- CreateBase64File(fmt.Sprintf("%s/data/assets/pokemon/front/%s_front.png", a.app.DataDirectory, data.ID))
			}()
			go func() {
				defer assetsWg.Done()
				backChan <- CreateBase64File(fmt.Sprintf("%s/data/assets/pokemon/back/%s_back.png", a.app.DataDirectory, data.ID))
			}()
			go func() {
				defer assetsWg.Done()
				shinyFrontChan <- CreateBase64File(fmt.Sprintf("%s/data/assets/pokemon/shinyfront/%s_front_shiny.png", a.app.DataDirectory, data.ID))
			}()
			go func() {
				defer assetsWg.Done()
				shinyBackChan <- CreateBase64File(fmt.Sprintf("%s/data/assets/pokemon/shinyback/%s_shiny_back.png", a.app.DataDirectory, data.ID))
			}()
			go func() {
				defer assetsWg.Done()
				iconChan <- CreateBase64File(fmt.Sprintf("%s/data/assets/pokemon/icons/%s/%s.gif", a.app.DataDirectory, data.ID, data.ID))
			}()
			go func() {
				defer assetsWg.Done()
				cryChan <- CreateBase64File(fmt.Sprintf("%s/data/assets/pokemon/cries/%s.wav", a.app.DataDirectory, data.ID))
			}()

			// Create the main Pokémon data
			trainerEditorPokemon := coreModels.PokemonTrainerEditor{
				Name:           strings.ToUpper(data.Species[:1]) + data.Species[1:],
				HP:             data.Stats.Hp,
				Defense:        data.Stats.Defense,
				SpecialAttack:  data.Stats.SpecialAttack,
				Speed:          data.Stats.Speed,
				SpecialDefense: data.Stats.SpecialDefense,
				Moves:          data.Moves,
				Attack:         data.Stats.Attack,
				ID:             data.ID,
				Abilities:      data.Abilities,
				Evolutions:     evolutions,
				Types:          types,
			}

			// Wait for all assets to be loaded
			assetsWg.Wait()

			// Collect main Pokémon assets in order
			trainerEditorPokemon.FrontSprite = <-frontChan
			trainerEditorPokemon.BackSprite = <-backChan
			trainerEditorPokemon.ShinyFront = <-shinyFrontChan
			trainerEditorPokemon.ShinyBack = <-shinyBackChan
			trainerEditorPokemon.Icon = <-iconChan
			trainerEditorPokemon.Cry = <-cryChan

			// Close channels
			close(frontChan)
			close(backChan)
			close(shinyFrontChan)
			close(shinyBackChan)
			close(iconChan)
			close(cryChan)

			resultChan <- trainerEditorPokemon
		}(pokemonData)
	}

	// Wait for all Pokémon to be processed
	go func() {
		wg.Wait()
		close(resultChan)
	}()

	// Collect results
	for pokemon := range resultChan {
		trainerEditorPokemons = append(trainerEditorPokemons, pokemon)
	}

	return trainerEditorPokemons
}
func (a *ParsingApp) ParsePokemonData() []OnLoadPokemonEditor {
	return ParsePokemonFile(a)
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

func (a *ParsingApp) LoadPokemonById(id string) coreModels.PokemonTrainerEditor {
	file, err := os.Open(fmt.Sprintf("%s/data/toml/pokemon.toml", a.app.DataDirectory))
	if err != nil {
		fmt.Printf("Error opening pokemon.toml: %v\n", err)
		return coreModels.PokemonTrainerEditor{}
	}
	defer file.Close()

	var pokemons Models.PokemonToml
	b, err := io.ReadAll(file)
	if err != nil {
		fmt.Printf("Error reading pokemon.toml: %v\n", err)
		return coreModels.PokemonTrainerEditor{}
	}

	err = toml.Unmarshal(b, &pokemons)
	if err != nil {
		fmt.Printf("Error unmarshaling pokemon.toml: %v\n", err)
		return coreModels.PokemonTrainerEditor{}
	}

	// Find the specific Pokémon
	var pokemonData Models.Pokemon
	for _, p := range pokemons.Pokemon {
		if p.ID == id {
			pokemonData = p
			break
		}
	}

	// Create a temporary PokemonToml with just this Pokémon
	tempToml := Models.PokemonToml{
		Pokemon: []Models.Pokemon{pokemonData},
	}

	// Use existing function to load assets
	result := CreatePokemonTrainerEditorData(tempToml, a)
	if len(result) > 0 {
		return result[0]
	}
	return coreModels.PokemonTrainerEditor{}
}
