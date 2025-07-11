import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Textarea } from "../../components/ui/textarea"
import { GetAllTilesets, GrabMusicTracks } from "../../../wailsjs/go/parsing/ParsingApp"
import { Song } from "../../models/song"

interface CreateMapDialogProps {
    onCreateMap: (mapData: {
        width: number;
        height: number;
        type: string;
        tileset: string;
        mapName: string;
        description?: string;
        music?: string;
        weather?: string;
        timeOfDay?: string;
        encounterRate?: number;
        properties?: Record<string, any>;
    }) => void;
}

const CreateMapDialog = ({ onCreateMap }: CreateMapDialogProps) => {
    const [width, setWidth] = useState("20")
    const [height, setHeight] = useState("20")
    const [type, setType] = useState("overworld")
    const [tileset, setTileset] = useState("")
    const [mapName, setMapName] = useState("")
    const [description, setDescription] = useState("")
    const [music, setMusic] = useState("")
    const [weather, setWeather] = useState("clear")
    const [timeOfDay, setTimeOfDay] = useState("day")
    const [encounterRate, setEncounterRate] = useState("10")
    const [tilesets, setTilesets] = useState<string[]>([])
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
                console.log(tilesetList)
                setTilesets(tilesetList)
                // Extract song names from Song objects
                const songNames = musicList.map((song: Song) => song.Name)
                setMusicTracks(songNames)
                // Set first tileset as default if available
                if (tilesetList.length > 0 && !tileset) {
                    setTileset(tilesetList[0])
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

    const handleSubmit = () => {
        // Validation
        if (!mapName.trim()) {
            setError("Map name is required")
            return
        }
        if (!tileset || tileset === "no-tilesets") {
            setError("Please select a tileset")
            return
        }
        if (parseInt(width) <= 0 || parseInt(height) <= 0) {
            setError("Map dimensions must be greater than 0")
            return
        }
        if (tilesets.length === 0) {
            setError("No tilesets available. Please create a tileset first.")
            return
        }

        setError("")
        
        const mapData = {
            width: parseInt(width),
            height: parseInt(height),
            type,
            tileset,
            mapName: mapName.trim(),
            description: description.trim() || undefined,
            music: music === "none" ? undefined : (music.trim() || undefined),
            weather,
            timeOfDay,
            encounterRate: parseInt(encounterRate),
            properties: {
                weather,
                timeOfDay,
                encounterRate: parseInt(encounterRate),
                music: music === "none" ? undefined : (music.trim() || undefined),
                description: description.trim() || undefined,
            }
        }
        
        onCreateMap(mapData)
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>New Map</Button>
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
                                    max="100"
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
                                    max="100"
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
                        {tilesets.length > 1 ?  <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="tileset" className="text-right">Tileset *</Label>
                            <Select 
                                value={tileset || undefined} 
                                onValueChange={setTileset} 
                                disabled={loading}
                            >
                                <SelectTrigger className="col-span-3 bg-slate-800 border-slate-700 text-white">
                                    <SelectValue placeholder={loading ? "Loading tilesets..." : "Select tileset"} />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                    {tilesets.length > 0 ? (
                                        tilesets.map((tilesetName) => (
                                            <SelectItem key={tilesetName} value={tilesetName}>
                                                {tilesetName}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="no-tilesets" disabled>
                                            No tilesets available
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div> : <></>}
                       
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
                                    <SelectItem value="none">No music</SelectItem>
                                    {musicTracks.map((trackName) => (
                                        <SelectItem key={trackName} value={trackName}>
                                            {trackName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="weather" className="text-right">Weather</Label>
                            <Select value={weather} onValueChange={setWeather}>
                                <SelectTrigger className="col-span-3 bg-slate-800 border-slate-700 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                    <SelectItem value="clear">Clear</SelectItem>
                                    <SelectItem value="rain">Rain</SelectItem>
                                    <SelectItem value="snow">Snow</SelectItem>
                                    <SelectItem value="fog">Fog</SelectItem>
                                    <SelectItem value="storm">Storm</SelectItem>
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
                            disabled={!mapName.trim() || !tileset || tileset === "no-tilesets" || tilesets.length === 0}
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