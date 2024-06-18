package main

import (
	"github.com/zenith110/pokemon-go-engine/models"
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

type MapInput struct {
	Name            string
	XAxisMax        int
	YAxisMax        int
	TilesetLocation string
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
