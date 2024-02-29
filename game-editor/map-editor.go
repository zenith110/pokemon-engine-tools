package main

import (
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func (a *App) SetMapTileset() string {

	selection, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select tileset file",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "Images (*.png)",
				Pattern:     "*.png",
			},
		},
	})
	if err != nil {
		panic(err)
	}

	return CreateBase64Image(selection)
}
