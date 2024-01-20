import { useState, useEffect } from "react"

import { ParseTrainers, ParseTrainerClass} from "../../../../wailsjs/go/main/App"
import TrainerComboBox from "./TrainerComboBox"
const LoadTrainers = () => {
    const [trainers, setTrainers] = useState([])
    const [classTypes, setClassTypes] = useState([])
    useEffect(() => {
        const fetchTrainers = async() =>{
            let data = await ParseTrainers()
            setTrainers(data.Trainers)
        }
        const fetchClassTypes = async() => {
            let data = await ParseTrainerClass()
            setClassTypes(data.Data)
        }
        fetchTrainers()
        fetchClassTypes()
    }, [])
    return(
        <>
        {trainers.length >= 1 ? <TrainerComboBox trainers={trainers} classTypes={classTypes}/> : <></>}
        <br/>
        </>
    )
}
export default LoadTrainers