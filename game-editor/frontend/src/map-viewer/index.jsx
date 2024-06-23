import { useState } from "react"
import { SetMapTileset, CreateMap } from "../../wailsjs/go/main/App";
const MapViewer = () => {
    const [mapName, setMapName] = useState("")
    const [tileset, setTileset] = useState("")
    return(
        <div>
           <label>Map name</label>
           <input type="text" onChange={(e) => setMapName(e.target.value)}></input>
           <br/>
           <button onChange={async() => {
                let tilesetData = await SetMapTileset()
                setTileset(tilesetData)
           }}>Select tileset</button>
           <br/>
           <button onClick={async() => {
             let data = {
                "name": mapName,
                "tilesetLocation": tileset
             }
             await CreateMap(data)
           }}>Create Map</button>
        </div>
    )
}
export default MapViewer