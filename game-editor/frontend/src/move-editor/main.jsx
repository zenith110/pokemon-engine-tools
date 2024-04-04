import { useState, useEffect} from "react";
import { ParseMoves } from "../../wailsjs/go/main/App";
import Select from "react-select"
import UpdateMove from "./UpdateMove";
const MoveEditor = () => {
    const [moves, setMoves] = useState([])
    const [selectedMove, setSelectedMove] = useState({})
    useEffect(() => {
        const fetchMoves = async() => {
            let data = await ParseMoves();
            setMoves(data.Move);
        }
        fetchMoves()
    },[])
    return(
        <div className="text-black">
             <Select name="moves" onChange={(e) => {
                const move = moves.find((moveData) => moveData.Name === e?.value)
                setSelectedMove(move)   
                }}
                isClearable={false}
                isDisabled={false}
                isLoading={false}
                isRtl={false}
                isSearchable={true}
                isMulti={false}
                classNames={{
                    control: () => "rounded-2xl"
                }}
                options={moves?.map(move => ({ value: move.Name, label: `${move.Name}`}))} 
            />
            {selectedMove? <UpdateMove selectedMove={selectedMove}/> : <div/>}
            <br/>
            <button className="file: bg-blueWhale rounded border-1 border-solid w-1/6 border-black text-white">New Move</button>
        </div>
    )
}
export default MoveEditor