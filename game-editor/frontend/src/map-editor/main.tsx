import { useNavigate } from "react-router-dom";

const MapEditor:React.FC = () => {
    const navigate = useNavigate();
    return(
        <>
        <button onClick={() => navigate("new-map")}>New Map</button>
        <br/>
        <button onClick={() => navigate(-1)}>Go back to main menu</button>
        </>
    )
}
export default MapEditor