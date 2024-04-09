import { UpdateMove } from "../../../wailsjs/go/main/App";
const UpdateMoveData = ({ selectedMove, power, setPower, pp, setPP, accuracy, setAccuracy, moveType, setMoveType, name, setName}) => {
    return(
        <div>
            <br/>
            <br/>
            <label>Power: </label>
            <input type="number" value={power} onChange={(e) => setPower(e.target.value)}></input>
            <br/>
            <label>PP: </label>
            <input type="number" value={pp? pp : 0} onChange={(e) => setPP(e.target.value)}></input>
            <br/>
            <label>Accuracy: </label>
            <input type="number" value={accuracy? accuracy : 0} onChange={(e) => setAccuracy(e.target.value)}></input>
            <br/>
            <label>Type: </label>
            <input value={moveType? moveType : ""} onChange={(e) => setMoveType(e.target.value)}></input>
            <br/>
            <label>Name: </label>
            <input value={name? name : ""} onChange={(e) => setName(e.target.value)}></input>
            <br/>
            {/* <label>Description: </label>
            <input defaultValue={selectedMove.Descriptions? selectedMove.Descriptions[0].Description : ""} key={selectedMove.Descriptions[0].Description}></input> */}
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
                console.log(data)
                await UpdateMove(data)
            }}>Save</button>
        </div>
    )
}
export default UpdateMoveData