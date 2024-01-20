const TrainerClasses = ({ trainerClasses, dictData, setDictData }) => {
    return(
        <>
        <select name="trainerClasses" onChange={(e) => setDictData(dictData => ({...dictData, classType: e.target.value}))} defaultValue={"placeholder"}>
            <option value={"placeholder"} disabled>Select a trainer class</option>
            {trainerClasses.map((trainerClass) =>
                <option value={trainerClass.Name} key={trainerClass.Name}>{trainerClass.Name}</option>
            )}
            </select>
        </>
    )
}
export default TrainerClasses