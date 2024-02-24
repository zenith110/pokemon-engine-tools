package main

import (
	"github.com/zenith110/pokemon-go-engine/models"
	Models "github.com/zenith110/pokemon-go-engine/models"
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
}

type TrainerJson struct {
	Name      string        `json:"name"`
	Sprite    string        `json:"sprite"`
	Id        string        `json:"id"`
	Pokemons  []PokemonJson `json:"pokemons"`
	ClassType string        `toml:"classType"`
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
	Moves          []Models.Moves
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
