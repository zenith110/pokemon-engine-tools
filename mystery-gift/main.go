package main

import (
	"fmt"

	utils "github.com/zenith110/mystery-gift/utils"
)

func main() {
	fmt.Print("Set up db!\n")
	utils.SetUpDB()
	fmt.Print("Have successfully set up db!\nInserting data now!\n")
	utils.InsertDBData()
	go utils.WatchGiftsFile()
	fmt.Print("Have successfully inserted data!\n")
	utils.HandleRoutes()
}
