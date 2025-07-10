package parsing

import core "github.com/zenith110/pokemon-engine-tools/tools-core"

type ParsingApp struct {
	app *core.App
}

func NewParsingApp(app *core.App) *ParsingApp {
	return &ParsingApp{app: app}
}
