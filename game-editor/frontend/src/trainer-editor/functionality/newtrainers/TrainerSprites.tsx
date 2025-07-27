import { useState } from "react"
import { models } from "../../../../bindings/github.com/zenith110/pokemon-engine-tools/models";

interface TrainerSpritesProps {
    trainerSprites: models.TrainerSprite[];
    dictData: { name: string; classType: string; pokemons: any[]; sprite?: string };
    setDictData: (data: { name: string; classType: string; pokemons: any[]; sprite?: string }) => void;
}

const TrainerSprites = ({ trainerSprites, dictData, setDictData }: TrainerSpritesProps) => {
    const SetImage = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setTrainerImage(e.target.value)
        setDictData({...dictData, sprite: e.target.options[e.target.selectedIndex].text})
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