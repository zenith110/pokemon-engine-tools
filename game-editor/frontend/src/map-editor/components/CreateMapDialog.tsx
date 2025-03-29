import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"

interface CreateMapDialogProps {
    onCreateMap: (mapData: {
        width: number;
        height: number;
        type: string;
        tileset: string;
        autoTiles: string[];
    }) => void;
}

const CreateMapDialog = ({ onCreateMap }: CreateMapDialogProps) => {
    const [width, setWidth] = useState("20")
    const [height, setHeight] = useState("20")
    const [type, setType] = useState("overworld")
    const [tileset, setTileset] = useState("default")
    const [autoTiles, setAutoTiles] = useState<string[]>([])

    const handleSubmit = () => {
        onCreateMap({
            width: parseInt(width),
            height: parseInt(height),
            type,
            tileset,
            autoTiles,
        })
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>New Map</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-slate-900 text-white">
                <DialogHeader>
                    <DialogTitle>Create New Map</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="width" className="text-right">Width</Label>
                        <Input
                            id="width"
                            type="number"
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
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            className="col-span-3 bg-slate-800 border-slate-700 text-white"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4 relative z-20">
                        <Label htmlFor="type" className="text-right">Type</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger className="col-span-3 bg-slate-800 border-slate-700 text-white">
                                <SelectValue placeholder="Select map type" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                <SelectItem value="overworld">Overworld</SelectItem>
                                <SelectItem value="indoor">Indoor</SelectItem>
                                <SelectItem value="cave">Cave</SelectItem>
                                <SelectItem value="dungeon">Dungeon</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4 relative z-10">
                        <Label htmlFor="tileset" className="text-right">Tileset</Label>
                        <Select value={tileset} onValueChange={setTileset}>
                            <SelectTrigger className="col-span-3 bg-slate-800 border-slate-700 text-white">
                                <SelectValue placeholder="Select tileset" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                <SelectItem value="default">Default</SelectItem>
                                <SelectItem value="grass">Grass</SelectItem>
                                <SelectItem value="water">Water</SelectItem>
                                <SelectItem value="cave">Cave</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={handleSubmit} className="bg-tealBlue hover:bg-tealBlue/90 text-white">Create Map</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default CreateMapDialog 