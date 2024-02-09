package main

import (
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
		trainerEditorPokemon := PokemonTrainerEditor{
			Name:           pokemons.Pokemon[pokemon].Species,
			FrontSprite:    fmt.Sprintf("%s/data/%s", a.dataDirectory.DataDirectory, pokemons.Pokemon[pokemon].AssetData.Front),
			BackSprite:     fmt.Sprintf("%s/data/%s", a.dataDirectory.DataDirectory, pokemons.Pokemon[pokemon].AssetData.Back),
			ShinyFront:     fmt.Sprintf("%s/data/%s", a.dataDirectory.DataDirectory, pokemons.Pokemon[pokemon].AssetData.ShinyFront),
			ShinyBack:      fmt.Sprintf("%s/data/%s", a.dataDirectory.DataDirectory, pokemons.Pokemon[pokemon].AssetData.ShinyBack),
			Icon:           fmt.Sprintf("%s/data/%s", a.dataDirectory.DataDirectory, pokemons.Pokemon[pokemon].AssetData.Icon),
			HP:             pokemons.Pokemon[pokemon].Stats.Hp,
			Defense:        pokemons.Pokemon[pokemon].Stats.Defense,
			SpecialAttack:  pokemons.Pokemon[pokemon].Stats.SpecialAttack,
			Speed:          pokemons.Pokemon[pokemon].Stats.Speed,
			SpecialDefense: pokemons.Pokemon[pokemon].Stats.SpecialDefense,
			Moves:          pokemons.Pokemon[pokemon].Moves,
			Attack:         pokemons.Pokemon[pokemon].Stats.Attack,
			ID:             pokemons.Pokemon[pokemon].ID,
			Abilities:      pokemons.Pokemon[pokemon].Abilities,
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

func (a *App) ParseTrainers() Models.TrainerToml {
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
	fmt.Print(trainers)
	return trainers
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
			Path: fmt.Sprintf("%s/data/assets/trainers_sprite/%s", a.dataDirectory.DataDirectory, sprite.Name()),
		}
		trainerSpritesResult = append(trainerSpritesResult, trainerSprites)
	}
	return trainerSpritesResult
}
