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
                <button>Swimming Left Frame</button>
                <button>Swimming Right Frame</button>
                <button>Swimming Up Frame</button>
                <button>Swimming Down Frame</button>
            </div>
            <br/> 
            <div>
                <button>Running Left Frame</button>
                <button>Running Right Frame</button>
                <button>Running Up Frame</button>
                <button>Running Down Frame</button>
            </div>
            <br/>
            <div>
                <button>Walking Left Frame</button>
                <button>Walking Right Frame</button>
                <button>Walking Up Frame</button>
                <button>Walking Down Frame</button>
            </div>
            <br/>
            <div>
                <button>Surfing Left Frame</button>
                <button>Surfing Right Frame</button>
                <button>Surfing Up Frame</button>
                <button>Surfing Down Frame</button>
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