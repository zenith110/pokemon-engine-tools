import { useState } from "react"
const TrainerCard = ({ trainer, classTypes }) => {
    const [trainerClass, setTrainerClass] = useState(trainer.ClassType)
return(
    <>
    <label>Name: </label>
    <p>{trainer.Name}</p>
    <br/>
    <label>Id: </label>
    <p>{trainer.ID}</p>
    <br/>
    <label>Trainer class:</label>
    <br/>
    <select name="trainers" onChange={(e) => setTrainerClass(e)} defaultValue={trainerClass}>
        {classTypes.map((classType) =>
            <option value={classType.Name} key={classType.Name}>{classType.Name}</option>
        )}
    </select>
    <br/>
    </>
)
}
export default TrainerCard