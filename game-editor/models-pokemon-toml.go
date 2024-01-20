package main

type PokemonToml struct {
	Pokemon []Pokemon `toml:"pokemon"`
}
type Abilities struct {
	Name     string `toml:"name"`
	IsHidden bool   `toml:"isHidden"`
}
type Moves struct {
	Name   string `toml:"name"`
	Level  int    `toml:"level"`
	Method string `toml:"method"`
}
type Evolutions struct {
	Name    string   `toml:"name"`
	Methods []string `toml:"methods"`
	ID      string   `toml:"id"`
}
type Stats struct {
	Hp             int `toml:"hp"`
	Attack         int `toml:"attack"`
	Defense        int `toml:"defense"`
	SpecialAttack  int `toml:"special-attack"`
	SpecialDefense int `toml:"special-defense"`
	Speed          int `toml:"speed"`
}
type AssetData struct {
	Front      string `toml:"front"`
	Back       string `toml:"back"`
	ShinyFront string `toml:"shiny_front"`
	ShinyBack  string `toml:"shiny_back"`
	Icon       string `toml:"icon"`
}
type Pokemon struct {
	ID         string       `toml:"id"`
	Species    string       `toml:"species"`
	Types      []string     `toml:"types"`
	DexEntry   string       `toml:"dexEntry"`
	Abilities  []Abilities  `toml:"abilities"`
	Moves      []Moves      `toml:"moves"`
	Evolutions []Evolutions `toml:"evolutions"`
	Stats      Stats        `toml:"stats"`
	AssetData  AssetData    `toml:"assetData"`
}
