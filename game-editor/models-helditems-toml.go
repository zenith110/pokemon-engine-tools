package main

type HeldItemToml struct {
	HeldItems []HeldItems `toml:"heldItems"`
}
type Functionality struct {
	Status      string `toml:"status"`
	Description string `toml:"description"`
}
type HeldItems struct {
	Name          string          `toml:"name"`
	Functionality []Functionality `toml:"functionality"`
}
