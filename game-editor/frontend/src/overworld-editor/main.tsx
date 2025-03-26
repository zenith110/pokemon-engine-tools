import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { OverworldDataJson } from "../models/overworld";
import { ParseOverworldData } from "../../wailsjs/go/overworldeditor/OverworldEditorApp";
const OverworldEditor = () => {
    const [overworlds, setOverworlds] = useState<OverworldDataJson[] | null>([]);
    const navigate = useNavigate();
    // useEffect(() => {
    //     const GrabAllOverworlds = async() => {
    //         let data = await ParseOverworldData()
    //         setOverworlds(data)
    //     }
    // }, [])
    return(
        <div>
           <button onClick={() => navigate("new-overworld")}>New Overworld</button>
        </div>
    )
}
export default OverworldEditor