import { useState } from "react"
const TrainerSprites = ({ trainerSprites, dictData, setDictData }) => {
    const SetImage = (e) => {
        setTrainerImage(e.target.value)
        console.log(e.target.options[e.target.selectedIndex].value)
        setDictData(dictData => ({...dictData, sprite: e.target.options[e.target.selectedIndex].text}))
    }
    const [trainerImage, setTrainerImage] = useState("")
    return(
        <div>
        <div className="text-black flex flex-row py-6 items-center justify-center">
         <select name="trainerSprites" onChange={(e) => SetImage(e)} defaultValue={"placeholder"}>
            <option value={"placeholder"} disabled>Select a trainer sprite</option>
            {trainerSprites.map((trainerSprite) =>
                <option value={trainerSprite.Path} key={trainerSprite.Name}>{trainerSprite.Name}</option>
            )}
            </select>
            </div>
            <br/>
            <div className="flex items-center justify-center">
                <img src={trainerImage? `data:image/png;base64,${trainerImage}` : ''}/>
            </div>
            <br/>
            </div>
    )
}
export default TrainerSprites