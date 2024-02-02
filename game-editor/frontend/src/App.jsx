import { useNavigate } from "react-router-dom";

import { SetDataFolder } from "../wailsjs/go/main/App"
import battleIcon from "./trainer-editor/icons/battleicon.png"
import mapIcon from "./map-editor/icons/map.png"
function App() {
    const navigate = useNavigate();
    const OptionsMenu = async() => {
        await SetDataFolder()
    }
    return (
        <>
           <button onClick={() => navigate("trainer-editor")}><img src={battleIcon}></img></button>
           <button onClick={() => navigate("map-editor")}><img src={mapIcon}></img></button>
           <br/>
           <button onClick={() => OptionsMenu()}>Select Folder</button>
        </>
    )
}

export default App
