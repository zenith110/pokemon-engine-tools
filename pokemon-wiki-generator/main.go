package main

import (
	"fmt"
	"html/template"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/pelletier/go-toml/v2"
	"github.com/plus3it/gorecurcopy"
	Models "github.com/zenith110/pokemon-go-engine/models"
)

func SetUpPokemonFolders() {
	_ = os.Mkdir("pokemon-html/assets/", os.ModeAppend)
	_ = os.Mkdir("pokemon-html/assets/pokemon", os.ModeAppend)
	_ = os.Mkdir("pokemon-html/assets/pokemon/front", os.ModeAppend)
	_ = os.Mkdir("pokemon-html/assets/pokemon/back", os.ModeAppend)
	_ = os.Mkdir("pokemon-html/assets/pokemon/shinyfront", os.ModeAppend)
	_ = os.Mkdir("pokemon-html/assets/pokemon/shinyback", os.ModeAppend)
	err := gorecurcopy.CopyDirectory("../assets/pokemon/front", "pokemon-html/assets/pokemon/front")
	err = gorecurcopy.CopyDirectory("../assets/pokemon/back", "pokemon-html/assets/pokemon/back")
	err = gorecurcopy.CopyDirectory("../assets/pokemon/shinyfront", "pokemon-html/assets/pokemon/shinyfront")
	err = gorecurcopy.CopyDirectory("../assets/pokemon/shinyback", "pokemon-html/assets/pokemon/shinyback")
	if err != nil {
		fmt.Printf("%v", err)
	}
}
func CreatePokemonFolder() {
	fileErr := os.Mkdir("pokemon-html", os.ModeAppend)
	SetUpPokemonFolders()
	if fileErr != nil {
		os.Remove("pokemon-html")
		SetUpPokemonFolders()
	}
	file, err := os.Open("pokemon.toml")
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

	for pokemon := range pokemons.Pokemon {
		assetData := Models.AssetData{
			Front:      pokemons.Pokemon[pokemon].AssetData.Front,
			Back:       pokemons.Pokemon[pokemon].AssetData.Back,
			ShinyFront: pokemons.Pokemon[pokemon].AssetData.ShinyFront,
			ShinyBack:  pokemons.Pokemon[pokemon].AssetData.ShinyBack,
		}
		stats := Models.Stats{
			Hp:             pokemons.Pokemon[pokemon].Stats.Hp,
			Defense:        pokemons.Pokemon[pokemon].Stats.Defense,
			SpecialAttack:  pokemons.Pokemon[pokemon].Stats.SpecialAttack,
			Speed:          pokemons.Pokemon[pokemon].Stats.Speed,
			SpecialDefense: pokemons.Pokemon[pokemon].Stats.SpecialDefense,
			Attack:         pokemons.Pokemon[pokemon].Stats.Attack,
		}
		pokemon := Models.Pokemon{
			Species:   pokemons.Pokemon[pokemon].Species,
			AssetData: assetData,
			Stats:     stats,
			Moves:     pokemons.Pokemon[pokemon].Moves,
			ID:        pokemons.Pokemon[pokemon].ID,
			DexEntry:  pokemons.Pokemon[pokemon].DexEntry,
		}

		tmpl, err := template.New("pokemon.tmpl").ParseFiles("pokemon.tmpl")
		if err != nil {
			panic(err)
		}
		var f *os.File
		f, err = os.Create(fmt.Sprintf("pokemon-html/%s.html", pokemon.ID))
		if err != nil {
			panic(err)
		}
		err = tmpl.Execute(f, pokemon)
		if err != nil {
			panic(err)
		}
		err = f.Close()
		if err != nil {
			panic(err)
		}

	}
}
func main() {
	CreatePokemonFolder()
	fs := http.FileServer(http.Dir("./pokemon-html"))
	http.Handle("/", fs)

	log.Print("Listening on :3000...")
	err := http.ListenAndServe(":3000", nil)
	if err != nil {
		log.Fatal(err)
	}
}
