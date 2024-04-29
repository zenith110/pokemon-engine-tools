import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import DownArrow from "../images/reshot-icon-down-arrow-P6BUA8L4DS.svg";
import UpArrow from "../images/reshot-icon-up-arrow-XMEL8JGW5T.svg";
import LeftArrow from "../images/reshot-icon-left-arrow-2RFCAW584E.svg";
import RightArrow from "../images/reshot-icon-right-arrow-5E3R279NU8.svg";
const NewOverworlds = () => {
    const [name, setName] = useState("");
    const [swimmingFrames, setSwimmingFrames] = useState([])
    const [walkingFrames, setWalkingFrames] = useState([])
    const [runningFrames, setRunningFrames] = useState([])
    const [isPlayer, setIsPlayer] = useState(false);
    const [surfingFrames, setSurfingFrames] = useState([])
    const [ID, setID] = useState("");
    const [typeOfFrame, setTypeOfFrame] = useState();
    return(
        <div>
            <div>
                <label>Name of OW</label>
                <br/>
                <input onChange={(e) => setName(e.target.value)}></input>
                <br/>
                <label>Swimming frames</label>
                <br/>
                <button><img src={UpArrow} width={32} height={32}/></button>
                <button><img src={DownArrow} width={32} height={32}/></button>
                <button><img src={LeftArrow} width={32} height={32}/></button>
                <button><img src={RightArrow} width={32} height={32}/></button>
            </div>
            <br/> 
            <div>
                <label>Running frames</label>
                <br/>
                <button><img src={UpArrow} width={32} height={32}/></button>
                <button><img src={DownArrow} width={32} height={32}/></button>
                <button><img src={LeftArrow} width={32} height={32}/></button>
                <button><img src={RightArrow} width={32} height={32}/></button>
            </div>
            <br/>
            <div>
                <label>Walking frames</label>
                <br/>
                <button><img src={UpArrow} width={32} height={32}/></button>
                <button><img src={DownArrow} width={32} height={32}/></button>
                <button><img src={LeftArrow} width={32} height={32}/></button>
                <button><img src={RightArrow} width={32} height={32}/></button>
            </div>
            <br/>
            <div>
                <label>Surfing frames</label>
                <br/>
                <button><img src={UpArrow} width={32} height={32}/></button>
                <button><img src={DownArrow} width={32} height={32}/></button>
                <button><img src={LeftArrow} width={32} height={32}/></button>
                <button><img src={RightArrow} width={32} height={32}/></button>
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