import { useState } from "react"
import { CreateMap } from "../../wailsjs/go/main/App";
const MapViewer = () => {
    const [mapImage, setMapImage] = useState("")
    return(
        <div>
           <br/>
           <button onClick={async() => {
             let map = await CreateMap()
             setMapImage(map)
           }}>Create Map Render</button>
           <img src={mapImage? `data:image/png;base64,${mapImage}` : ''} alt="" />
        </div>

    )
}
export default MapViewer