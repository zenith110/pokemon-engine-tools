import { useState } from "react"
const TrainerSprites = ({ trainerSprites, dictData, setDictData }) => {
    const SetImage = (e) => {
        setTrainerImage(e.target.value)
        console.log(e.target.options[e.target.selectedIndex].text)
        setDictData(dictData => ({...dictData, sprite: e.target.options[e.target.selectedIndex].text}))
    }
    const [trainerImage, setTrainerImage] = useState("")
    return(
        <>
         <select name="trainerSprites" onChange={(e) => SetImage(e)} defaultValue={"placeholder"}>
            <option value={"placeholder"} disabled>Select a trainer sprite</option>
            {trainerSprites.map((trainerSprite) =>
                <option value={trainerSprite.Path} key={trainerSprite.Name}>{trainerSprite.Name}</option>
            )}
            </select>
            <br/>
            
            <img src={trainerImage}/>
            <br/>
        </>
    )
}
export default TrainerSprites