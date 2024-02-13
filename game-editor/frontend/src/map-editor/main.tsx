import { useNavigate } from "react-router-dom";
import React from "react";
const MapEditor:React.FC = () => {
    const navigate = useNavigate();
    return(
        <>
        <button onClick={() => navigate("new-map")} className="file: bg-blueWhale rounded border-1 border-solid w-1/6 border-black">New Map</button>
        </>
    )
}
export default MapEditor