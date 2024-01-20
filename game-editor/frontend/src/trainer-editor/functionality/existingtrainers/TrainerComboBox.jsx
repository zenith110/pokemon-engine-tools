import { useState } from "react"
import TrainerCard from "./TrainerCard"
const TrainerComboBox = ({ trainers, classTypes }) => {
    const [trainer, setTrainer] = useState({})
    const FilterTrainerData = (e) => {
        const trainer = trainers.find((trainer) => trainer.Name === e.target.value)
        setTrainer(trainer)
        console.log(trainer)
    }
    return(
        <>
        <select name="trainers" onChange={(e) => FilterTrainerData(e)} defaultValue={"placeholder"}>
            <option value={"placeholder"} disabled>Select a trainer</option>
            {trainers.map((trainer) =>
                <option value={trainer.Name} key={trainer.Name}>{trainer.Name}</option>
            )}
            </select>
            <br/>
            {Object.keys((trainer)).length >= 1 ? <TrainerCard trainer={trainer} classTypes={classTypes}/> : <></>}
        </>
    )
}
export default TrainerComboBox