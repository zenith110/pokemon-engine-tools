package pokemoneditor

import (
	"fmt"
	"io"
	"log"
	"os"

	"github.com/BurntSushi/toml"
	"github.com/google/uuid"
	models "github.com/zenith110/pokemon-engine-tools/models"
	core "github.com/zenith110/pokemon-engine-tools/tools-core"
	Models "github.com/zenith110/pokemon-go-engine-toml-models/models"
)

type PokemonEditorApp struct {
	app *core.App
}

// NewJukeboxApp creates a new JukeboxApp struct
func NewPokemonEditorApp(app *core.App) *PokemonEditorApp {
	return &PokemonEditorApp{
		app: app,
	}
}

func (a *PokemonEditorApp) AddPokemonEvolution(evolutionRequest models.PokemonEvolutionRequest) {
	log.Printf("=== ADDING POKEMON EVOLUTION ===")
	log.Printf("Pokemon ID: %s", evolutionRequest.PokemonId)
	log.Printf("Evolution Data: %+v", evolutionRequest.EvolutionData)

	pokemonFile, err := os.Open(fmt.Sprintf("%s/data/toml/pokemon.toml", a.app.DataDirectory))
	if err != nil {
		log.Printf("ERROR: Failed to open pokemon.toml file: %v", err)
		panic(err)
	}
	defer pokemonFile.Close()
	log.Printf("Successfully opened pokemon.toml file")

	pokemonFileData, err := io.ReadAll(pokemonFile)
	if err != nil {
		log.Printf("ERROR: Failed to read pokemon.toml file: %v", err)
		panic(err)
	}
	log.Printf("Successfully read pokemon.toml file (%d bytes)", len(pokemonFileData))

	var pokemons Models.PokemonToml
	err = toml.Unmarshal(pokemonFileData, &pokemons)
	if err != nil {
		log.Printf("ERROR: Failed to unmarshal pokemon.toml: %v", err)
		panic(err)
	}
	log.Printf("Successfully unmarshaled pokemon.toml, found %d Pokemon", len(pokemons.Pokemon))

	pokemonFound := false
	for i, pokemon := range pokemons.Pokemon {
		if pokemon.ID == evolutionRequest.PokemonId {
			pokemonFound = true
			log.Printf("Found Pokemon %s (index %d), current evolutions: %d", pokemon.ID, i, len(pokemon.Evolutions))

			newEvolution := Models.Evolutions{
				EvolutionID: uuid.New().String(),
				PokemonID:   evolutionRequest.EvolutionData["NewPokemonEvolutionID"],
				Name:        evolutionRequest.EvolutionData["Name"],
				Methods:     []string{evolutionRequest.EvolutionData["Method1"], evolutionRequest.EvolutionData["Method2"]},
			}
			log.Printf("Creating new evolution: ID=%s, Name=%s, Methods=%v", newEvolution.EvolutionID, newEvolution.Name, newEvolution.Methods)

			pokemons.Pokemon[i].Evolutions = append(pokemons.Pokemon[i].Evolutions, newEvolution)
			log.Printf("Added evolution to Pokemon %s, total evolutions now: %d", pokemon.ID, len(pokemons.Pokemon[i].Evolutions))
			break
		}
	}

	if !pokemonFound {
		log.Printf("ERROR: Pokemon with ID %s not found in pokemon.toml", evolutionRequest.PokemonId)
		panic(fmt.Sprintf("Pokemon with ID %s not found", evolutionRequest.PokemonId))
	}

	data, err := toml.Marshal(pokemons)
	if err != nil {
		log.Printf("ERROR: Failed to marshal updated pokemon data: %v", err)
		panic(err)
	}
	log.Printf("Successfully marshaled updated pokemon data (%d bytes)", len(data))

	err = os.WriteFile(fmt.Sprintf("%s/data/toml/pokemon.toml", a.app.DataDirectory), data, 0644)
	if err != nil {
		log.Printf("ERROR: Failed to write pokemon.toml file: %v", err)
		panic(err)
	}
	log.Printf("Successfully wrote updated pokemon.toml file")
	log.Printf("=== EVOLUTION ADDED SUCCESSFULLY ===")
}

func (a *PokemonEditorApp) UpdatePokemonEvolution(evolutionRequest models.PokemonEvolutionRequest) {
	log.Printf("=== UPDATING POKEMON EVOLUTION ===")
	log.Printf("Pokemon ID: %s", evolutionRequest.PokemonId)
	log.Printf("Evolution Data: %+v", evolutionRequest.EvolutionData)

	pokemonFile, err := os.Open(fmt.Sprintf("%s/data/toml/pokemon.toml", a.app.DataDirectory))
	if err != nil {
		log.Printf("ERROR: Failed to open pokemon.toml file: %v", err)
		panic(err)
	}
	defer pokemonFile.Close()
	log.Printf("Successfully opened pokemon.toml file")

	pokemonFileData, err := io.ReadAll(pokemonFile)
	if err != nil {
		log.Printf("ERROR: Failed to read pokemon.toml file: %v", err)
		panic(err)
	}
	log.Printf("Successfully read pokemon.toml file (%d bytes)", len(pokemonFileData))

	var pokemons Models.PokemonToml
	err = toml.Unmarshal(pokemonFileData, &pokemons)
	if err != nil {
		log.Printf("ERROR: Failed to unmarshal pokemon.toml: %v", err)
		panic(err)
	}
	log.Printf("Successfully unmarshaled pokemon.toml, found %d Pokemon", len(pokemons.Pokemon))

	pokemonFound := false
	evolutionFound := false
	for i, pokemon := range pokemons.Pokemon {
		if pokemon.ID == evolutionRequest.PokemonId {
			pokemonFound = true
			log.Printf("Found Pokemon %s (index %d), evolutions: %d", pokemon.ID, i, len(pokemon.Evolutions))

			for j, evolution := range pokemon.Evolutions {
				if evolution.EvolutionID == evolutionRequest.EvolutionData["EvolutionID"] {
					evolutionFound = true
					log.Printf("Found evolution %s (index %d), current methods: %v", evolution.EvolutionID, j, evolution.Methods)

					oldMethods := evolution.Methods
					newMethods := []string{evolutionRequest.EvolutionData["Method1"], evolutionRequest.EvolutionData["Method2"]}
					pokemons.Pokemon[i].Evolutions[j].PokemonID = evolutionRequest.EvolutionData["NewPokemonEvolutionID"]
					pokemons.Pokemon[i].Evolutions[j].Name = evolutionRequest.EvolutionData["Name"]
					pokemons.Pokemon[i].Evolutions[j].Methods = newMethods
					log.Printf("Updated evolution methods: %v -> %v", oldMethods, newMethods)
					break
				}
			}
			break
		}
	}

	if !pokemonFound {
		log.Printf("ERROR: Pokemon with ID %s not found in pokemon.toml", evolutionRequest.PokemonId)
		panic(fmt.Sprintf("Pokemon with ID %s not found", evolutionRequest.PokemonId))
	}

	if !evolutionFound {
		log.Printf("ERROR: Evolution with ID %s not found for Pokemon %s", evolutionRequest.EvolutionData["ID"], evolutionRequest.PokemonId)
		panic(fmt.Sprintf("Evolution with ID %s not found", evolutionRequest.EvolutionData["ID"]))
	}

	data, err := toml.Marshal(pokemons)
	if err != nil {
		log.Printf("ERROR: Failed to marshal updated pokemon data: %v", err)
		panic(err)
	}
	log.Printf("Successfully marshaled updated pokemon data (%d bytes)", len(data))

	err = os.WriteFile(fmt.Sprintf("%s/data/toml/pokemon.toml", a.app.DataDirectory), data, 0644)
	if err != nil {
		log.Printf("ERROR: Failed to write pokemon.toml file: %v", err)
		panic(err)
	}
	log.Printf("Successfully wrote updated pokemon.toml file")
	log.Printf("=== EVOLUTION UPDATED SUCCESSFULLY ===")
}

func (a *PokemonEditorApp) DeletePokemonEvolution(evolutionRequest models.PokemonEvolutionRequest) {
	log.Printf("=== DELETING POKEMON EVOLUTION ===")
	log.Printf("Pokemon ID: %s", evolutionRequest.PokemonId)
	log.Printf("Evolution Data: %+v", evolutionRequest.EvolutionData)
	log.Printf("Evolution ID to delete: %s", evolutionRequest.EvolutionData["ID"])

	pokemonFile, err := os.Open(fmt.Sprintf("%s/data/toml/pokemon.toml", a.app.DataDirectory))
	if err != nil {
		log.Printf("ERROR: Failed to open pokemon.toml file: %v", err)
		panic(err)
	}
	defer pokemonFile.Close()
	log.Printf("Successfully opened pokemon.toml file")

	pokemonFileData, err := io.ReadAll(pokemonFile)
	if err != nil {
		log.Printf("ERROR: Failed to read pokemon.toml file: %v", err)
		panic(err)
	}
	log.Printf("Successfully read pokemon.toml file (%d bytes)", len(pokemonFileData))

	var pokemons Models.PokemonToml
	err = toml.Unmarshal(pokemonFileData, &pokemons)
	if err != nil {
		log.Printf("ERROR: Failed to unmarshal pokemon.toml: %v", err)
		panic(err)
	}
	log.Printf("Successfully unmarshaled pokemon.toml, found %d Pokemon", len(pokemons.Pokemon))

	pokemonFound := false
	evolutionFound := false
	for i, pokemon := range pokemons.Pokemon {
		if pokemon.ID == evolutionRequest.PokemonId {
			pokemonFound = true
			log.Printf("Found Pokemon %s (index %d), current evolutions: %d", pokemon.ID, i, len(pokemon.Evolutions))

			// Log all evolutions for debugging
			for j, evolution := range pokemon.Evolutions {
				log.Printf("  Evolution %d: ID=%s, Name=%s, Methods=%v", j, evolution.EvolutionID, evolution.Name, evolution.Methods)
			}

			var filteredEvolutions []Models.Evolutions
			deletedCount := 0

			for _, evolution := range pokemon.Evolutions {
				log.Printf("Checking evolution ID: %s (type: %T) against target: %s (type: %T)",
					evolution.EvolutionID, evolution.EvolutionID, evolutionRequest.EvolutionData["EvolutionID"], evolutionRequest.EvolutionData["EvolutionID"])

				if evolution.EvolutionID != evolutionRequest.EvolutionData["EvolutionID"] {
					filteredEvolutions = append(filteredEvolutions, evolution)
					log.Printf("Keeping evolution %s", evolution.EvolutionID)
				} else {
					evolutionFound = true
					deletedCount++
					log.Printf("Marked evolution %s for deletion", evolution.EvolutionID)
				}
			}

			pokemons.Pokemon[i].Evolutions = filteredEvolutions
			log.Printf("Deleted %d evolution(s), remaining evolutions: %d", deletedCount, len(filteredEvolutions))
			break
		}
	}

	if !pokemonFound {
		log.Printf("ERROR: Pokemon with ID %s not found in pokemon.toml", evolutionRequest.PokemonId)
		panic(fmt.Sprintf("Pokemon with ID %s not found", evolutionRequest.PokemonId))
	}

	if !evolutionFound {
		log.Printf("ERROR: Evolution with ID %s not found for Pokemon %s", evolutionRequest.EvolutionData["ID"], evolutionRequest.PokemonId)
		panic(fmt.Sprintf("Evolution with ID %s not found", evolutionRequest.EvolutionData["ID"]))
	}

	data, err := toml.Marshal(pokemons)
	if err != nil {
		log.Printf("ERROR: Failed to marshal updated pokemon data: %v", err)
		panic(err)
	}
	log.Printf("Successfully marshaled updated pokemon data (%d bytes)", len(data))

	err = os.WriteFile(fmt.Sprintf("%s/data/toml/pokemon.toml", a.app.DataDirectory), data, 0644)
	if err != nil {
		log.Printf("ERROR: Failed to write pokemon.toml file: %v", err)
		panic(err)
	}
	log.Printf("Successfully wrote updated pokemon.toml file")
	log.Printf("=== EVOLUTION DELETED SUCCESSFULLY ===")
}
