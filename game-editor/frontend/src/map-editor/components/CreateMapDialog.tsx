import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Textarea } from "../../components/ui/textarea"
import { GetAllTilesets, GrabMusicTracks } from "../../../bindings/github.com/zenith110/pokemon-engine-tools/parsing/ParsingApp"
import { Song } from "../../models/song"
import { models } from "../../../bindings/github.com/zenith110/pokemon-engine-tools/models"
import { CreateMapData } from "../types"

interface CreateMapDialogProps {
    onCreateMap: (mapData: CreateMapData) => void;
    handleCreateMap: (mapData: CreateMapData) => void;
}

const CreateMapDialog = ({ handleCreateMap }: CreateMapDialogProps) => {
    const [open, setOpen] = useState(false)
    const [width, setWidth] = useState("20")
    const [height, setHeight] = useState("20")
    const [type, setType] = useState("overworld")
    const [tileset, setTileset] = useState<models.Tileset>();
    const [mapName, setMapName] = useState("")
    const [description, setDescription] = useState("")
    const [music, setMusic] = useState("")
    const [tilesets, setTilesets] = useState<models.Tileset[]>([])
    const [musicTracks, setMusicTracks] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    // Fetch tilesets and music tracks on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const [tilesetList, musicList] = await Promise.all([
                    GetAllTilesets(),
                    GrabMusicTracks()
                ])

                setTilesets(tilesetList)
                // Extract song names from Song objects
                const songNames = musicList.map((song: Song) => song.Name)
                setMusicTracks(songNames)
                // Set first tileset as default if available
                if (tilesetList.length > 0 && !tileset) {
                    setTileset(() => tilesetList[0])
                }
            } catch (error) {
                console.error('Error fetching data:', error)
                setError('Failed to load tilesets or music tracks')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleSubmit = async() => {
        // Validation
        if (!mapName.trim()) {
            setError("Map name is required")
            return
        }
        if (!tileset) {
            setError("Please select a tileset")
            return
        }
        if (parseInt(width) <= 0 || parseInt(height) <= 0) {
            setError("Map dimensions must be greater than 0")
            return
        }
        if (parseInt(width) > 200 || parseInt(height) > 200) {
            setError("Map dimensions cannot exceed 200x200")
            return
        }
        if (tilesets.length === 0) {
            setError("No tilesets available. Please create a tileset first.")
            return
        }

        setError("")
        
        // Call handleCreateMap to navigate to map view with tileset loaded
        handleCreateMap({
            width: parseInt(width),
            height: parseInt(height),
            type: type,
            tilesetPath: tileset?.Path || "",
            tilesetSize: tileset?.TilesetHeight,
            mapName: mapName.trim(),
            description: description.trim(),
            music: music || "",
            properties: {
                tilesetPath: tileset?.Path || "",
                tilesetName: tileset?.Name || "",
                tileSize: `${tileset.TilesetHeight}`,
            }
        })
        
        // Close the dialog
        setOpen(false)
        
        // Reset all form fields
        setMapName("")
        setDescription("")
        setWidth("20")
        setHeight("20")
        setType("overworld")
        setTileset(undefined)
        setMusic("")
        setError("")
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="bg-slate-800 border-slate-700 hover:bg-slate-700">New Map</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-slate-900 text-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Map</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {/* Basic Map Information */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-slate-300">Basic Information</h3>
                        
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="mapName" className="text-right">Map Name *</Label>
                            <Input
                                id="mapName"
                                type="text"
                                value={mapName}
                                onChange={(e) => setMapName(e.target.value)}
                                className="col-span-3 bg-slate-800 border-slate-700 text-white"
                                placeholder="Enter map name"
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="col-span-3 bg-slate-800 border-slate-700 text-white"
                                placeholder="Optional map description"
                                rows={2}
                            />
                        </div>
                    </div>

                    {/* Map Dimensions */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-slate-300">Dimensions</h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="width" className="text-right">Width</Label>
                                <Input
                                    id="width"
                                    type="number"
                                    min="1"
                                    max="200"
                                    value={width}
                                    onChange={(e) => setWidth(e.target.value)}
                                    className="col-span-3 bg-slate-800 border-slate-700 text-white"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="height" className="text-right">Height</Label>
                                <Input
                                    id="height"
                                    type="number"
                                    min="1"
                                    max="200"
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value)}
                                    className="col-span-3 bg-slate-800 border-slate-700 text-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Map Type and Tileset */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-slate-300">Map Settings</h3>
                        
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="type" className="text-right">Type</Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger className="col-span-3 bg-slate-800 border-slate-700 text-white">
                                    <SelectValue placeholder="Select map type" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                    <SelectItem value="overworld">Overworld</SelectItem>
                                    <SelectItem value="indoor">Indoor</SelectItem>
                                    <SelectItem value="cave">Cave</SelectItem>
                                    <SelectItem value="water">Water</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {tilesets.length >= 1 && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="tileset" className="text-right">Tileset *</Label>
                                <Select 
                                    value={tileset?.Name || undefined} 
                                    onValueChange={(value) => {
                                        const selectedTileset = tilesets.find(t => t.Name === value);
                                        setTileset(selectedTileset);
                                    }} 
                                    disabled={loading}
                                >
                                    <SelectTrigger className="col-span-3 bg-slate-800 border-slate-700 text-white">
                                        <SelectValue placeholder={loading ? "Loading tilesets..." : "Select tileset"} />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                        {tilesets.map((tilesetObj) => (
                                            <SelectItem key={tilesetObj.Name} value={tilesetObj.Name}>
                                                {tilesetObj.Name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                       
                    </div>

                    {/* Map Properties */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-slate-300">Properties</h3>
                        
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="music" className="text-right">Background Music</Label>
                            <Select value={music || undefined} onValueChange={setMusic}>
                                <SelectTrigger className="col-span-3 bg-slate-800 border-slate-700 text-white">
                                    <SelectValue placeholder="Select background music (optional)" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                    {musicTracks.map((trackName) => (
                                        <SelectItem key={trackName} value={trackName}>
                                            {trackName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500 rounded-md text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4">
                        <Button 
                            onClick={handleSubmit} 
                            className="bg-tealBlue hover:bg-tealBlue/90 text-white"
                            disabled={!mapName.trim() || !tileset || tilesets.length === 0}
                        >
                            Create Map
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default CreateMapDialog 