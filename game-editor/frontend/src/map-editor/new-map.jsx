import { SetMapTileset } from "../../wailsjs/go/main/App";
import { useState } from "react";
import React from "react";

const NewMap = () => {
    const [tileset, setTileset] = useState("")
    const [mapName, setMapName] = useState("")
    const [xAxisSize, setXAxisSize] = useState(0)
    const [yAxisSize, setYAxisSize] = useState(0)
    const setMapTilesetButton = async() => {
        let data = await SetMapTileset()
        setTileset(data)
    }
    return(
        <>
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
        <spoiler>
            <div className="text-black flex items-center justify-center">
                <img src={tileset? `data:image/png;base64,${tileset}` : ''} alt="Tileset" />
            </div>
        </spoiler>
        <br/>
        <button>Submit</button>
        </>
    )
}
export default NewMap