import { useState } from "react"
import { ScrollArea } from "../../components/ui/scroll-area"
import { Card } from "../../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Button } from "../../components/ui/button"
import { Plus, Trash2 } from "lucide-react"

interface Tile {
    id: string;
    name: string;
    image: string;
}

interface TilePaletteProps {
    selectedTile: { id: string; name: string; image: string } | null;
    setSelectedTile: (tile: { id: string; name: string; image: string } | null) => void;
}

const TilePalette = ({ selectedTile, setSelectedTile }: TilePaletteProps) => {
    const [tileCategories, setTileCategories] = useState<{ [key: string]: Tile[] }>({
        "Ground": [
            { id: "ground_1", name: "Grass", image: "/tiles/ground/grass.png" },
            { id: "ground_2", name: "Dirt", image: "/tiles/ground/dirt.png" },
            { id: "ground_3", name: "Sand", image: "/tiles/ground/sand.png" },
        ],
        "Walls": [
            { id: "wall_1", name: "Stone Wall", image: "/tiles/walls/stone.png" },
            { id: "wall_2", name: "Brick Wall", image: "/tiles/walls/brick.png" },
            { id: "wall_3", name: "Wood Wall", image: "/tiles/walls/wood.png" },
        ],
        "Objects": [
            { id: "obj_1", name: "Tree", image: "/tiles/objects/tree.png" },
            { id: "obj_2", name: "Rock", image: "/tiles/objects/rock.png" },
            { id: "obj_3", name: "Bush", image: "/tiles/objects/bush.png" },
        ],
    })

    const [activeCategory, setActiveCategory] = useState<string>("Ground")

    const handleAddTile = (category: string) => {
        const newTile: Tile = {
            id: `${category.toLowerCase()}_${tileCategories[category].length + 1}`,
            name: `New ${category} Tile`,
            image: "/tiles/placeholder.png",
        }
        setTileCategories({
            ...tileCategories,
            [category]: [...tileCategories[category], newTile],
        })
    }

    const handleRemoveTile = (category: string, tileId: string) => {
        setTileCategories({
            ...tileCategories,
            [category]: tileCategories[category].filter(tile => tile.id !== tileId),
        })
        if (selectedTile?.id === tileId) {
            setSelectedTile(null)
        }
    }

    const handleAddCategory = () => {
        const newCategory = `Category ${Object.keys(tileCategories).length + 1}`
        setTileCategories({
            ...tileCategories,
            [newCategory]: [],
        })
        setActiveCategory(newCategory)
    }

    const handleRemoveCategory = (category: string) => {
        const newCategories = { ...tileCategories }
        delete newCategories[category]
        setTileCategories(newCategories)
        if (activeCategory === category) {
            setActiveCategory(Object.keys(newCategories)[0])
        }
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Tile Palette</h3>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleAddCategory}
                    className="h-8 w-8"
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
                <ScrollArea className="w-full rounded-md border border-slate-800">
                    <TabsList className="w-full flex-wrap h-auto p-1">
                        {Object.keys(tileCategories).map((category) => (
                            <TabsTrigger
                                key={category}
                                value={category}
                                className="flex-1 min-w-[100px] data-[state=active]:bg-slate-800"
                            >
                                {category}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </ScrollArea>

                {Object.entries(tileCategories).map(([category, tiles]) => (
                    <TabsContent key={category} value={category}>
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium">{category}</h4>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleAddTile(category)}
                                    className="h-6 w-6"
                                >
                                    <Plus className="h-3 w-3" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveCategory(category)}
                                    className="h-6 w-6 text-red-500 hover:text-red-400"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                        <ScrollArea className="h-[200px] w-full rounded-md border border-slate-800">
                            <div className="grid grid-cols-2 gap-2 p-2">
                                {tiles.map((tile) => (
                                    <Card
                                        key={tile.id}
                                        className={`relative p-2 cursor-pointer transition-colors ${
                                            selectedTile?.id === tile.id
                                                ? "bg-tealBlue border-tealBlue"
                                                : "bg-slate-800 border-slate-700 hover:border-slate-600"
                                        }`}
                                        onClick={() => setSelectedTile(tile)}
                                    >
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-1 right-1 h-4 w-4 text-red-500 hover:text-red-400"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleRemoveTile(category, tile.id)
                                            }}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                        <div className="aspect-square w-full bg-slate-900 rounded-sm flex items-center justify-center">
                                            <img
                                                src={tile.image}
                                                alt={tile.name}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <p className="text-xs mt-1 text-center truncate">{tile.name}</p>
                                    </Card>
                                ))}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}

export default TilePalette 