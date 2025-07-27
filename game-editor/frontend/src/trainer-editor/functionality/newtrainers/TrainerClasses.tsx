import { models } from "../../../../bindings/github.com/zenith110/pokemon-engine-tools/models";

interface TrainerClassesProps {
    trainerClasses: models.Data[];
    dictData: { name: string; classType: string; pokemons: any[] };
    setDictData: (data: { name: string; classType: string; pokemons: any[] }) => void;
}

const TrainerClasses = ({ trainerClasses, dictData, setDictData }: TrainerClassesProps) => {
    return(
        <>
        <select name="trainerClasses" onChange={(e) => setDictData({...dictData, classType: e.target.value})} defaultValue={"placeholder"}>
            <option value={"placeholder"} disabled>Select a trainer class</option>
            {trainerClasses.map((trainerClass: models.Data) =>
                <option value={trainerClass.Name} key={trainerClass.Name}>{trainerClass.Name}</option>
            )}
        </select>
        </>
    )
}

export default TrainerClasses