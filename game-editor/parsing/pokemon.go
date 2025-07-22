package parsing

import (
	"fmt"
	"io"
	"os"
	"strings"
	"sync"

	"github.com/pelletier/go-toml/v2"
	coreModels "github.com/zenith110/pokemon-engine-tools/models"
	Models "github.com/zenith110/pokemon-go-engine-toml-models/models"
)

type OnLoadPokemonEditor struct {
	ID   string `toml:"id"`
	Name string `toml:"species"`
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

func (a *ParsingApp) ParsePokemonData() []OnLoadPokemonEditor {
	return ParsePokemonFile(a)
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
				evoID := evolution.PokemonID
				fmt.Println("Evolution ID:", evoID)
				// Create channel for icon
				iconChan := make(chan string, 1)

				// Load evolution icon
				go func() {
					defer assetsWg.Done()
					iconChan <- CreateBase64File(fmt.Sprintf("%s/data/assets/pokemon/icons/%s/%s.gif", a.app.DataDirectory, evoID, evoID))
				}()

				// Create evolution data
				evolutionData := coreModels.Evolution{
					Name:        strings.ToUpper(evolution.Name[:1]) + evolution.Name[1:],
					Method1:     "",
					Method2:     "",
					ID:          evoID,
					EvolutionID: evolution.EvolutionID,
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
