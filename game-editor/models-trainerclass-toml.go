package main

type TrainerClasses struct {
	Data []Data `toml:"data"`
}
type Data struct {
	Name  string `toml:"name"`
	Music string `toml:"music"`
}
