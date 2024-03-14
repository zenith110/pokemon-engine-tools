package main

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
	"strings"

	"github.com/pelletier/go-toml/v2"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	Models "github.com/zenith110/pokemon-go-engine/models"
)

func toBase64(byte []byte) string {
	return base64.StdEncoding.EncodeToString(byte)
}
func CreateBase64File(file string) string {
	bytes, _ := os.ReadFile(file)
	var base64String string

	base64String += toBase64(bytes)
	return base64String
}
func (a *App) ParsePokemonData() []PokemonTrainerEditor {
	file, err := os.Open(fmt.Sprintf("%s/data/toml/pokemon.toml", a.dataDirectory.DataDirectory))

	if err != nil {
		panic(err)
	}
	defer file.Close()

	var pokemons Models.PokemonToml

	b, err := io.ReadAll(file)
	if err != nil {
		panic(err)
	}

	err = toml.Unmarshal(b, &pokemons)
	if err != nil {
		panic(err)
	}

	var trainerEditorPokemons []PokemonTrainerEditor

	for pokemon := range pokemons.Pokemon {
		var evolutions []Evolution
		var types []string

		for pokemonType := range pokemons.Pokemon[pokemon].Types {
			types = append(types, (strings.ToUpper(pokemons.Pokemon[pokemon].Types[pokemonType][:1]) + pokemons.Pokemon[pokemon].Types[pokemonType][1:]))
		}
		for evolution := range pokemons.Pokemon[pokemon].Evolutions {
			if len(pokemons.Pokemon[pokemon].Evolutions[evolution].Methods) == 2 {
				evolutionData := Evolution{
					Name:        strings.ToUpper(pokemons.Pokemon[pokemon].Evolutions[evolution].Name[:1]) + pokemons.Pokemon[pokemon].Evolutions[evolution].Name[1:],
					Method1:     pokemons.Pokemon[pokemon].Evolutions[evolution].Methods[0],
					Method2:     pokemons.Pokemon[pokemon].Evolutions[evolution].Methods[1],
					FrontSprite: CreateBase64File(fmt.Sprintf("%s/data/assets/pokemon/front/%s_front.png", a.dataDirectory.DataDirectory, pokemons.Pokemon[pokemon].Evolutions[evolution].ID)),
					BackSprite:  CreateBase64File(fmt.Sprintf("%s/data/assets/pokemon/back/%s_back.png", a.dataDirectory.DataDirectory, pokemons.Pokemon[pokemon].Evolutions[evolution].ID)),
					ShinyFront:  CreateBase64File(fmt.Sprintf("%s/data/assets/pokemon/shinyfront/%s_front_shiny.png", a.dataDirectory.DataDirectory, pokemons.Pokemon[pokemon].Evolutions[evolution].ID)),
					ShinyBack:   CreateBase64File(fmt.Sprintf("%s/data/assets/pokemon/shinyback/%s_shiny_back.png", a.dataDirectory.DataDirectory, pokemons.Pokemon[pokemon].Evolutions[evolution].ID)),
					Icon:        CreateBase64File(fmt.Sprintf("%s/data/assets/pokemon/icons/%s/%s.png", a.dataDirectory.DataDirectory, pokemons.Pokemon[pokemon].Evolutions[evolution].ID, pokemons.Pokemon[pokemon].Evolutions[evolution].ID)),
					ID:          pokemons.Pokemon[pokemon].Evolutions[evolution].ID,
				}
				evolutions = append(evolutions, evolutionData)
			} else {
				evolutionData := Evolution{
					Name:        strings.ToUpper(pokemons.Pokemon[pokemon].Evolutions[evolution].Name[:1]) + pokemons.Pokemon[pokemon].Evolutions[evolution].Name[1:],
					Method1:     "",
					Method2:     "",
					FrontSprite: CreateBase64File(fmt.Sprintf("%s/data/assets/pokemon/front/%s_front.png", a.dataDirectory.DataDirectory, pokemons.Pokemon[pokemon].Evolutions[evolution].ID)),
					BackSprite:  CreateBase64File(fmt.Sprintf("%s/data/assets/pokemon/back/%s_back.png", a.dataDirectory.DataDirectory, pokemons.Pokemon[pokemon].Evolutions[evolution].ID)),
					ShinyFront:  CreateBase64File(fmt.Sprintf("%s/data/assets/pokemon/shinyfront/%s_front_shiny.png", a.dataDirectory.DataDirectory, pokemons.Pokemon[pokemon].Evolutions[evolution].ID)),
					ShinyBack:   CreateBase64File(fmt.Sprintf("%s/data/assets/pokemon/shinyback/%s_shiny_back.png", a.dataDirectory.DataDirectory, pokemons.Pokemon[pokemon].Evolutions[evolution].ID)),
					Icon:        CreateBase64File(fmt.Sprintf("%s/data/assets/pokemon/icons/%s/%s.png", a.dataDirectory.DataDirectory, pokemons.Pokemon[pokemon].Evolutions[evolution].ID, pokemons.Pokemon[pokemon].Evolutions[evolution].ID)),
					ID:          pokemons.Pokemon[pokemon].Evolutions[evolution].ID,
				}
				evolutions = append(evolutions, evolutionData)
			}
		}
		trainerEditorPokemon := PokemonTrainerEditor{
			Name:           strings.ToUpper(pokemons.Pokemon[pokemon].Species[:1]) + pokemons.Pokemon[pokemon].Species[1:],
			FrontSprite:    CreateBase64File(fmt.Sprintf("%s/data/assets/pokemon/front/%s_front.png", a.dataDirectory.DataDirectory, pokemons.Pokemon[pokemon].ID)),
			BackSprite:     CreateBase64File(fmt.Sprintf("%s/data/assets/pokemon/back/%s_back.png", a.dataDirectory.DataDirectory, pokemons.Pokemon[pokemon].ID)),
			ShinyFront:     CreateBase64File(fmt.Sprintf("%s/data/assets/pokemon/shinyfront/%s_front_shiny.png", a.dataDirectory.DataDirectory, pokemons.Pokemon[pokemon].ID)),
			ShinyBack:      CreateBase64File(fmt.Sprintf("%s/data/assets/pokemon/shinyback/%s_shiny_back.png", a.dataDirectory.DataDirectory, pokemons.Pokemon[pokemon].ID)),
			Icon:           CreateBase64File(fmt.Sprintf("%s/data/assets/pokemon/icons/%s/%s.gif", a.dataDirectory.DataDirectory, pokemons.Pokemon[pokemon].ID, pokemons.Pokemon[pokemon].ID)),
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

func (a *App) ParseTrainerClass() Models.TrainerClasses {
	file, err := os.Open(fmt.Sprintf("%s/data/toml/trainerclasses.toml", a.dataDirectory.DataDirectory))
	if err != nil {
		panic(err)
	}
	defer file.Close()
	var trainerclasses Models.TrainerClasses
	bytes, err := io.ReadAll(file)
	if err != nil {
		panic(err)
	}
	err = toml.Unmarshal(bytes, &trainerclasses)
	if err != nil {
		panic(err)
	}

	return trainerclasses
}

func (a *App) ParseHeldItems() []HeldItem {
	file, err := os.Open(fmt.Sprintf("%s/data/toml/helditems.toml", a.dataDirectory.DataDirectory))
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
	var heldItemsData []HeldItem
	for heldItem := range heldItems.HeldItems {
		heldItemData := HeldItem{
			Name: heldItems.HeldItems[heldItem].Name,
		}
		heldItemsData = append(heldItemsData, heldItemData)
	}
	return heldItemsData
}

func (a *App) SetDataFolder() {
	selection, err := runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select the engine directory",
	})
	if err != nil {
		panic(err)
	}
	selection = strings.ReplaceAll(selection, "\\", "/")

	options := OptionsConfig{
		DataDirectory: selection,
	}
	content, err := json.Marshal(options)
	if err != nil {
		fmt.Println(err)
	}
	err = os.WriteFile("settings.json", content, 0644)
	if err != nil {
		log.Fatal(err)
	}
	a.dataDirectory, _ = SetupConfig()
}

func (a *App) ParseTrainers() []TrainerJson {
	file, err := os.Open(fmt.Sprintf("%s/data/toml/trainers.toml", a.dataDirectory.DataDirectory))
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
	var trainersData []TrainerJson
	for trainer := range trainers.Trainers {
		var pokemons []PokemonJson
		for pokemon := range trainers.Trainers[trainer].Pokemons {
			pokemonData := PokemonJson{
				Species:        trainers.Trainers[trainer].Pokemons[pokemon].Species,
				HP:             trainers.Trainers[trainer].Pokemons[pokemon].HP,
				Speed:          trainers.Trainers[trainer].Pokemons[pokemon].Speed,
				SpecialAttack:  trainers.Trainers[trainer].Pokemons[pokemon].SpecialAttack,
				SpecialDefense: trainers.Trainers[trainer].Pokemons[pokemon].SpecialDefense,
				Attack:         trainers.Trainers[trainer].Pokemons[pokemon].Attack,
				Defense:        trainers.Trainers[trainer].Pokemons[pokemon].Defense,
				Front:          CreateBase64File(fmt.Sprintf("%s/data/assets/pokemon/front/%s_front.png", a.dataDirectory.DataDirectory, trainers.Trainers[trainer].Pokemons[pokemon].ID)),
				ID:             trainers.Trainers[trainer].Pokemons[pokemon].ID,
				Icon:           CreateBase64File(fmt.Sprintf("%s/data/assets/pokemon/icons/%s/%s.gif", a.dataDirectory.DataDirectory, trainers.Trainers[trainer].Pokemons[pokemon].ID, trainers.Trainers[trainer].Pokemons[pokemon].ID)),
				Moves:          trainers.Trainers[trainer].Pokemons[pokemon].Moves,
			}
			pokemons = append(pokemons, pokemonData)

		}
		trainerData := TrainerJson{
			Name:      trainers.Trainers[trainer].Name,
			Sprite:    CreateBase64File(fmt.Sprintf("%s/data/assets/trainers_sprite/%s", a.dataDirectory.DataDirectory, trainers.Trainers[trainer].Sprite)),
			Id:        trainers.Trainers[trainer].ID,
			ClassType: trainers.Trainers[trainer].ClassType,
			Pokemons:  pokemons,
		}
		trainersData = append(trainersData, trainerData)
	}
	return trainersData
}

func (a *App) GrabTrainerSprites() []TrainerSprite {
	trainerSprites, err := os.ReadDir(fmt.Sprintf("%s/data/assets/trainers_sprite", a.dataDirectory.DataDirectory))
	if err != nil {
		fmt.Printf("Error is %v", err)
	}
	var trainerSpritesResult []TrainerSprite
	for _, sprite := range trainerSprites {
		trainerSprites := TrainerSprite{
			Name: sprite.Name(),
			Path: CreateBase64File(fmt.Sprintf("%s/data/assets/trainers_sprite/%s", a.dataDirectory.DataDirectory, sprite.Name())),
		}
		trainerSpritesResult = append(trainerSpritesResult, trainerSprites)
	}
	return trainerSpritesResult
}

func (a *App) GrabAllMoves() Models.AllMoves {
	movesFileName := fmt.Sprintf("%s/data/toml/moves.toml", a.dataDirectory.DataDirectory)
	fmt.Print(movesFileName)
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
