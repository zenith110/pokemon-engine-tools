const UpdateMove = ({ selectedMove }) => {
    return(
        <div>
            <br/>
            <br/>
            <label>Power: </label>
            <input type="number" defaultValue={selectedMove? selectedMove.Power : 0}></input>
            <br/>
            <label>PP: </label>
            <input type="number" defaultValue={selectedMove? selectedMove.Pp : 0}></input>
            <br/>
            <label>Accuracy: </label>
            <input type="number" defaultValue={selectedMove? selectedMove.Accuracy : 0}></input>
            <br/>
            <label>Type: </label>
            <input defaultValue={selectedMove? selectedMove.Type : ""}></input>
            <br/>
            <label>Name: </label>
            <input defaultValue={selectedMove? selectedMove.Name : ""}></input>
            <br/>
            <label>Description: </label>
            <input defaultValue={selectedMove.Descriptions? selectedMove.Descriptions[0].Description : ""}></input>
            <br/>
            <br/>
            <button className="file: bg-blueWhale rounded border-1 border-solid w-1/6 border-black text-white">Save</button>
        </div>
    )
}
export default UpdateMove