import { useState, useEffect} from "react";
import { ParseMoves } from "../../wailsjs/go/main/App";
import Select from "react-select"
import UpdateMoveData from "./existing-trainers/UpdateMoveData";
const MoveEditor = () => {
    const [moves, setMoves] = useState([])
    const [selectedMove, setSelectedMove] = useState({})
    const [power, setPower] = useState(0)
    const [pp, setPP] = useState(0)
    const [accuracy, setAccuracy ] = useState(0)
    const [moveType, setMoveType] = useState("")
    const [name, setName] = useState("")
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
                const move = moves.find((moveData) => moveData.ID === e?.value)
                setSelectedMove(move)
                setPower(move.Power)
                setPP(move.Pp)
                setAccuracy(move.Accuracy)
                setMoveType(move.Type)
                setName(move.Name)   
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
                options={moves?.map(move => ({ value: move.ID, label: `${move.Name}`}))} 
            />
            {Object.keys(selectedMove).length > 0? <UpdateMoveData selectedMove={selectedMove} power={power} setPower={setPower} pp={pp} setPP={setPP} accuracy={accuracy} setAccuracy={setAccuracy} moveType={moveType} setMoveType={setMoveType} name={name} setName={setName}/> : <div/>}
            <br/>
            <button className="file: bg-blueWhale rounded border-1 border-solid w-1/6 border-black text-white">New Move</button>
        </div>
    )
}
export default MoveEditor