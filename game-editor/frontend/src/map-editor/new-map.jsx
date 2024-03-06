import { SetMapTileset, CreateMapConfig} from "../../wailsjs/go/main/App";
import { useState } from "react";
import React from "react";
import CanvasExport from "./canvas/Canvas-export";
const NewMap = () => {
    const [tileset, setTileset] = useState("")
    const [mapName, setMapName] = useState("")
    const [xAxisSize, setXAxisSize] = useState(0)
    const [yAxisSize, setYAxisSize] = useState(0)
    const setMapTilesetButton = async() => {
        let data = await SetMapTileset()
        setTileset(data)
    }
    const createMapData = async() => {
        let mapData = {
            "Name": mapName,
            "XAxisMax": xAxisSize,
            "YAxisMax": yAxisSize,
            "TilesetLocation": tileset
        }
        await CreateMapConfig(mapData)
    }
    return(
        <div className="text-black">
            <label>Name of map</label>
            <br/>
            <input onChange={(e) => setMapName(e.target.value)}></input>
            <br/>
            <label>X axis max size</label>
            <br/>
            <input onChange={(e) => setXAxisSize(Number(e.target.value))} type="number"></input>
            <br/>
            <label>Y axis max size</label>
            <br/>
            <input type="number" onChange={(e) => setYAxisSize(Number(e.target.value))}></input>
            <br/>
            <button onClick={() => setMapTilesetButton()}>Tileset</button>
            <br/>
            <button onClick={() => createMapData()}>Submit</button>
        </div>
    )
}
export default NewMap