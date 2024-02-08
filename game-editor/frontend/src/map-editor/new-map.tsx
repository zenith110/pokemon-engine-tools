import { SetMapTileset } from "../../wailsjs/go/main/App";
import { useState } from "react";

const NewMap:React.FC = () => {
    const [tileset, setTileset] = useState<string>("")
    const [mapName, setMapName] = useState<string>("")
    const [xAxisSize, setXAxisSize] = useState<number>(0)
    const [yAxisSize, setYAxisSize] = useState<number>(0)
    const setMapTilesetButton = async() => {
        await SetMapTileset()
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
        <br/>
        <button>Submit</button>
        </>
    )
}
export default NewMap