import { useNavigate } from "react-router-dom";
const MapEditor = () => {
    const navigate = useNavigate();
    return(
        <>
        <button onClick={() => navigate(-1)}>Go back to main menu</button>
        </>
    )
}
export default MapEditor