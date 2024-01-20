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
)

func (a *App) ParsePokemonData() []PokemonTrainerEditor {

	file, err := os.Open(fmt.Sprintf("%s/toml/pokemon.toml", a.dataDirectory.DataDirectory))
	if err != nil {
		panic(err)
	}
	defer file.Close()

	var pokemons PokemonToml

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
			FrontSprite:    pokemons.Pokemon[pokemon].AssetData.Front,
			BackSprite:     pokemons.Pokemon[pokemon].AssetData.Back,
			Icon:           pokemons.Pokemon[pokemon].AssetData.Icon,
			HP:             pokemons.Pokemon[pokemon].Stats.Hp,
			Defense:        pokemons.Pokemon[pokemon].Stats.Defense,
			SpecialAttack:  pokemons.Pokemon[pokemon].Stats.SpecialAttack,
			Speed:          pokemons.Pokemon[pokemon].Stats.Speed,
			SpecialDefense: pokemons.Pokemon[pokemon].Stats.SpecialDefense,
			Moves:          pokemons.Pokemon[pokemon].Moves,
			Attack:         pokemons.Pokemon[pokemon].Stats.Attack,
			ID:             pokemons.Pokemon[pokemon].ID,
		}
		trainerEditorPokemons = append(trainerEditorPokemons, trainerEditorPokemon)
	}

	return trainerEditorPokemons
}

func (a *App) ParseTrainerClass() TrainerClasses {
	file, err := os.Open(fmt.Sprintf("%s/toml/trainerclasses.toml", a.dataDirectory.DataDirectory))
	if err != nil {
		panic(err)
	}
	defer file.Close()
	var trainerclasses TrainerClasses
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
	file, err := os.Open(fmt.Sprintf("%s/toml/helditems.toml", a.dataDirectory.DataDirectory))
	if err != nil {
		panic(err)
	}
	defer file.Close()

	var heldItems HeldItemToml

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
		Title: "Select a directory",
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

}

func (a *App) ParseTrainers() TrainerToml {
	file, err := os.Open(fmt.Sprintf("%s/toml/trainers.toml", a.dataDirectory.DataDirectory))
	if err != nil {
		panic(err)
	}
	defer file.Close()
	var trainers TrainerToml
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
