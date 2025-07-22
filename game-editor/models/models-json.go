package models

import (
	"github.com/zenith110/pokemon-go-engine-toml-models/models"
)

type PokemonJson struct {
	Species        string   `json:"species"`
	Level          int      `json:"level"`
	HP             int      `json:"hp"`
	Attack         int      `json:"attack"`
	Defense        int      `json:"defense"`
	Speed          int      `json:"speed"`
	SpecialAttack  int      `json:"specialAttack"`
	SpecialDefense int      `json:"specialDefense"`
	Moves          []string `json:"moves"`
	HeldItem       string   `json:"heldItem"`
	ID             string   `json:"id"`
	Front          string   `json:"front"`
	Icon           string   `json:"icon"`
	Cry            string   `json:"cry"`
}

type TrainerJson struct {
	Name       string        `json:"name"`
	Sprite     string        `json:"sprite"`
	SpriteName string        `json:"spritename"`
	Id         string        `json:"id"`
	Pokemons   []PokemonJson `json:"pokemons"`
	ClassType  string        `json:"classType"`
}

type OptionsConfig struct {
	DataDirectory string `json:"dataDirectory"`
}
type Evolution struct {
	Name        string
	FrontSprite string
	BackSprite  string
	ShinyFront  string
	ShinyBack   string
	Icon        string
	ID          string
	Method1     string
	Method2     string
	EvolutionID string
}
type PokemonTrainerEditor struct {
	Name           string
	FrontSprite    string
	BackSprite     string
	ShinyFront     string
	ShinyBack      string
	Icon           string
	HP             int
	Defense        int
	SpecialAttack  int
	Speed          int
	SpecialDefense int
	Attack         int
	Moves          []models.Moves
	ID             string
	Abilities      []models.Abilities
	Evolutions     []Evolution
	Types          []string
	Cry            string
}

type CreateNewTileset struct {
	TilesetHeight int    `json:"tilesetHeight"`
	TilesetWidth  int    `json:"tilesetWidth"`
	NameOfTileset string `json:"nameOfTileset"`
	Description   string `json:"tilesetDescription"`
	TypeOfTileSet string `json:"typeOfTileset"`
	FileName      string `json:"fileName"`
}
type MapTile struct {
	X          int    `json:"x"`
	Y          int    `json:"y"`
	TileID     string `json:"tileId"`
	AutoTileID string `json:"autoTileId,omitempty"`
}

type MapLayer struct {
	ID      int       `json:"id"`
	Name    string    `json:"name"`
	Visible bool      `json:"visible"`
	Locked  bool      `json:"locked,omitempty"`
	Tiles   []MapTile `json:"tiles"`
}
type MapEncounter struct {
	Name             string `json:"name"`
	ID               string `json:"id"`
	MinLevel         int    `json:"minLevel"`
	MaxLevel         int    `json:"maxLevel"`
	Rarity           int    `json:"rarity"`
	Shiny            bool   `json:"shiny"`
	TimeOfDayToCatch string `json:"timeOfDayToCatch"`
}

type FishingEncounter struct {
	Name             string `json:"name"`
	ID               string `json:"id"`
	MinLevel         int    `json:"minLevel"`
	MaxLevel         int    `json:"maxLevel"`
	Rarity           int    `json:"rarity"`
	Shiny            bool   `json:"shiny"`
	TimeOfDayToCatch string `json:"timeOfDayToCatch"`
	HighestRod       string `json:"highestRod"`
}

type MapEncounters struct {
	Grass   []MapEncounter     `json:"grass"`
	Fishing []FishingEncounter `json:"fishing"`
	Cave    []MapEncounter     `json:"cave"`
	Diving  []MapEncounter     `json:"diving"`
}
type MapProperties struct {
	Music string `json:"music"`
}
type MapJsonData struct {
	ID                   int           `json:"id"`
	Name                 string        `json:"name"`
	Width                int           `json:"width"`
	Height               int           `json:"height"`
	TileSize             int           `json:"tileSize"`
	Type                 string        `json:"type"`
	TilesetPath          string        `json:"tilesetPath"`
	Layers               []MapLayer    `json:"layers"`
	CurrentSelectedLayer string        `json:"currentlySelectedLayer"`
	MapEncounters        MapEncounters `json:"mapEncounters"`
	Properties           MapProperties `json:"properties"`
}
type HeldItem struct {
	Name string
}

type TrainerSprite struct {
	Name string
	Path string
}
type Song struct {
	Name string
	Path string
	ID   string
}

type MapOutput struct {
	Name            string `toml:"name"`
	XAxisMax        int    `toml:"xaxismax"`
	YAxisMax        int    `toml:"yaxismax"`
	TilesetLocation string `toml:"tilesetlocation"`
}

type MapData struct {
	Map []MapOutput `toml:"map"`
}

type ProjectCreation struct {
	Name      string `json:"name"`
	ID        string `json:"id"`
	Directory string `json:"directory"`
}

type UpdatedMove struct {
	Power       int    `json:"power"`
	PP          int    `json:"pp"`
	Accuracy    int    `json:"accuracy"`
	Type        string `json:"type"`
	Name        string `json:"name"`
	Id          string `json:"id"`
	Description string `json:"description"`
}

type GithubInfo struct {
	Ref    string `json:"ref"`
	NodeID string `json:"node_id"`
	URL    string `json:"url"`
	Object Object `json:"object"`
}
type Object struct {
	Sha  string `json:"sha"`
	Type string `json:"type"`
	URL  string `json:"url"`
}

type ProjectSelect struct {
	CreatedDateTime string `json:"CreatedDateTime"`
	FolderLocation  string `json:"FolderLocation"`
	ID              string `json:"ID"`
	LastUsed        string `json:"LastUsed"`
	Name            string `json:"Name"`
	VersionOfEngine string `json:"VersionOfEngine"`
}

type OverworldDataJson struct {
	ID             string `json:"ID"`
	OverworldId    string `json:"OverworldId"`
	SwimmingFrames []models.OverworldDirectionFrame
	RunningFrames  []models.OverworldDirectionFrame
	WalkingFrames  []models.OverworldDirectionFrame
	IsPlayer       bool `json:"IsPlayer"`
	SurfingFrames  []models.OverworldDirectionFrame
	Name           string `json:"Name"`
}

type PokemonEvolutionRequest struct {
	PokemonId     string            `json:"pokemonId"`
	EvolutionData map[string]string `json:"evolutionData"`
}

type PokemonEvolutionResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}
