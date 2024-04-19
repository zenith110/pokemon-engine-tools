import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
const NewOverworlds = () => {
    const [name, setName] = useState("");
    const [swimmingFrames, setSwimmingFrames] = useState([])
    const [walkingFrames, setWalkingFrames] = useState([])
    const [runningFrames, setRunningFrames] = useState([])
    const [isPlayer, setIsPlayer] = useState(false);
    const [surfingFrames, setSurfingFrames] = useState([])
    const [ID, setID] = useState("");    
    return(
        <div>
            <div>
                <label>Swimming frames</label>
                <br/>
                <button></button>
                <button></button>
                <button></button>
                <button></button>
            </div>
            <br/> 
            <div>
                <label>Running frames</label>
                <br/>
                <button></button>
                <button></button>
                <button></button>
                <button></button>
            </div>
            <br/>
            <div>
                <label>Walking frames</label>
                <br/>
                <button></button>
                <button></button>
                <button></button>
                <button></button>
            </div>
            <br/>
            <div>
                <label>Surfing frames</label>
                <br/>
                <button></button>
                <button></button>
                <button></button>
                <button></button>
            </div>
            <br/>
            <button onClick={() => {
                data = {
                    "ID": uuidv4()
                }
            }}>Save</button>
        </div>
    )
}
export default NewOverworlds