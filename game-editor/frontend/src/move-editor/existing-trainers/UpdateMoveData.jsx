import { useState } from "react"
import { UpdateMove } from "../../../wailsjs/go/main/App";
const UpdateMoveData = ({ selectedMove }) => {
    const [power, setPower] = useState(selectedMove? selectedMove.Power : 0)
    const [pp, setPP] = useState(selectedMove?  selectedMove.Pp : 0)
    const [accuracy, setAccuracy ] = useState(selectedMove? selectedMove.Accuracy : 0)
    const [moveType, setMoveType] = useState(selectedMove? selectedMove.Type : "Normal")
    const [name, setName] = useState(selectedMove? selectedMove.Name : "Tackle")
    return(
        <div>
            <br/>
            <br/>
            <label>Power: </label>
            <input type="number" defaultValue={selectedMove? selectedMove.Power : 0} onChange={(e) => setPower(e.target.value)}></input>
            <br/>
            <label>PP: </label>
            <input type="number" defaultValue={selectedMove? selectedMove.Pp : 0} onChange={(e) => setPP(e.target.value)}></input>
            <br/>
            <label>Accuracy: </label>
            <input type="number" defaultValue={selectedMove? selectedMove.Accuracy : 0} onChange={(e) => setAccuracy(e.target.value)}></input>
            <br/>
            <label>Type: </label>
            <input defaultValue={selectedMove? selectedMove.Type : ""} onChange={(e) => setMoveType(e.target.value)}></input>
            <br/>
            <label>Name: </label>
            <input defaultValue={selectedMove? selectedMove.Name : ""} onChange={(e) => setName(e.target.value)}></input>
            <br/>
            <label>Description: </label>
            <input defaultValue={selectedMove.Descriptions? selectedMove.Descriptions[0].Description : ""}></input>
            <br/>
            <br/>
            <button className="file: bg-blueWhale rounded border-1 border-solid w-1/6 border-black text-white" onClick={async() => {
                let data = {
                    "power": parseInt(power), 
                    "pp": parseInt(pp), 
                    "accuracy": parseInt(accuracy),
                    "type": moveType, 
                    "name": name,
                    "id": selectedMove?.ID.toString()
                }
                await UpdateMove(data)
            }}>Save</button>
        </div>
    )
}
export default UpdateMoveData