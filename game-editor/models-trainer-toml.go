package main

type TrainerToml struct {
	Trainers []Trainers `toml:"trainers"`
}
type Pokemons struct {
	Species        string   `toml:"species"`
	Level          int      `toml:"level"`
	Moves          []string `toml:"moves"`
	HeldItem       string   `toml:"heldItem"`
	HP             int      `toml:"hp"`
	Attack         int      `toml:"attack"`
	Defense        int      `toml:"defense"`
	Speed          int      `toml:"speed"`
	SpecialAttack  int      `toml:"specialAttack"`
	SpecialDefense int      `toml:"specialDefense"`
	ID             int      `toml:"id"`
}
type Trainers struct {
	Name      string     `toml:"name"`
	Sprite    string     `toml:"sprite"`
	ID        string     `toml:"id"`
	ClassType string     `toml:"classType"`
	Pokemons  []Pokemons `toml:"pokemon"`
}
