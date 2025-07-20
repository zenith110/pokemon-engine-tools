package parsing

import (
	"fmt"
	"io"
	"os"

	"github.com/pelletier/go-toml/v2"
	coreModels "github.com/zenith110/pokemon-engine-tools/models"
	Models "github.com/zenith110/pokemon-go-engine-toml-models/models"
)

func (a *ParsingApp) ParseHeldItems() []coreModels.HeldItem {
	file, err := os.Open(fmt.Sprintf("%s/data/toml/helditems.toml", a.app.DataDirectory))
	if err != nil {
		panic(err)
	}
	defer file.Close()

	var heldItems Models.HeldItemToml

	b, err := io.ReadAll(file)
	if err != nil {
		panic(err)
	}

	err = toml.Unmarshal(b, &heldItems)
	if err != nil {
		panic(err)
	}
	var heldItemsData []coreModels.HeldItem
	for heldItem := range heldItems.HeldItems {
		heldItemData := coreModels.HeldItem{
			Name: heldItems.HeldItems[heldItem].Name,
		}
		heldItemsData = append(heldItemsData, heldItemData)
	}
	return heldItemsData
}
