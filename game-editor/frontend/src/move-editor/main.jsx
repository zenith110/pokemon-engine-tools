import { useState, useEffect} from "react";
import { ParseMoves } from "../../wailsjs/go/main/App";

const MoveEditor = () => {
    const [moves, setMoves] = useState([])
    const [selectedMove, setSelectedMove] = useState({})
    useEffect(() => {
        const fetchMoves = async() => {
            let data = await ParseMoves();
            setMoves(data.Move)
        }
        fetchMoves()
    },[])
    return(
        <div className="text-black">
             <select name="moves" defaultValue="Select move" onChange={(e) => {
                const move = moves.find((moveData) => moveData.Name === e.target.value)
                setSelectedMove(move)   
                }}>
                <option value={"placeholder"} disabled>Select a move</option>
                {moves.map((move) =>
                    <option value={move.Name} key={move.Name}>{move.Name}</option>
                )}
            </select>
        </div>
    )
}
export default MoveEditor