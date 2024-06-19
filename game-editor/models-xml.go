package main

type Layer struct {
	TilesetData []int `xml:"data"`
}

type Tileset struct {
	Image string `xml:"image"`
}

type Map struct {
	Tileset Tileset `xml:"tileset"`
	Layers  []Layer `xml:"layer"`
}
