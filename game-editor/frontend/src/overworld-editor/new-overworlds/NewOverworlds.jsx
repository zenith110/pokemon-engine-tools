import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import DownArrow from "../images/reshot-icon-down-arrow-P6BUA8L4DS.svg";
import UpArrow from "../images/reshot-icon-up-arrow-XMEL8JGW5T.svg";
import LeftArrow from "../images/reshot-icon-left-arrow-2RFCAW584E.svg";
import RightArrow from "../images/reshot-icon-right-arrow-5E3R279NU8.svg";

import FrameModal from "./FrameModal";

const NewOverworlds = () => {
    const [name, setName] = useState("");
    const [swimmingFrames, setSwimmingFrames] = useState([]);
    const [walkingFrames, setWalkingFrames] = useState([]);
    const [runningFrames, setRunningFrames] = useState([]);
    const [isPlayer, setIsPlayer] = useState(false);
    const [surfingFrames, setSurfingFrames] = useState([]);
    const [modalIsOpen, setIsOpen] = useState(false);
    const [frameSet, setFrameSet] = useState();
    const [currentDirection, setCurrentDirection] = useState()
    const openModal = () => {
        setIsOpen(true);
    }

    const closeModal = () => {
        setIsOpen(false);
    }
    const renderFrameModal = (frameType) => {
        switch(frameType) {
            case 'swimming':
                return <FrameModal typeOfFrame={"swimming"} nameOfOW={name} setFrames={setSwimmingFrames} direction={currentDirection} modalIsOpen={modalIsOpen} closeModal={closeModal}/>;
            case 'running':
                return <FrameModal typeOfFrame={"running"} nameOfOW={name} setFrames={setRunningFrames} direction={currentDirection} modalIsOpen={modalIsOpen} closeModal={closeModal}/>;
            case 'walking':
                return <FrameModal typeOfFrame={"walking"} nameOfOW={name} setFrames={setWalkingFrames} direction={currentDirection} modalIsOpen={modalIsOpen} closeModal={closeModal}/>;
            case 'surfing':
                return <FrameModal typeOfFrame={"surfing"} nameOfOW={name} setFrames={setSurfingFrames} direction={currentDirection} modalIsOpen={modalIsOpen} closeModal={closeModal}/>;  
            default:
                return '';
        }
    }
    return(
        <div>
            <div>
                <label>Name of OW</label>
                <br/>
                <input onChange={(e) => setName(e.target.value)}></input>
                <br/>
                <label>Swimming frames</label>
                <br/>
                <button onClick={() => {
                    openModal();
                    setCurrentDirection("up");
                    setFrameSet("swimming");
                }}><img src={UpArrow} width={32} height={32}/></button>
                <button onClick={() => {
                    openModal();
                    setCurrentDirection("down");
                    setFrameSet("swimming");
                }}><img src={DownArrow} width={32} height={32}/></button>
                <button onClick={() => {
                    openModal();
                    setCurrentDirection("left");
                    setFrameSet("swimming");
                }}><img src={LeftArrow} width={32} height={32}/></button>
                <button onClick={() => {
                   openModal();
                   setCurrentDirection("right");
                   setFrameSet("swimming");
                }}><img src={RightArrow} width={32} height={32}/></button>
            </div>
            <br/> 
            <div>
                <label>Running frames</label>
                <br/>
                <button onClick={() => {
                   openModal();
                   setCurrentDirection("up");
                   setFrameSet("running");
                }}><img src={UpArrow} width={32} height={32}/></button>
                <button onClick={() => {
                    openModal();
                    setCurrentDirection("down");
                    setFrameSet("running");
                }}><img src={DownArrow} width={32} height={32}/></button>
                <button onClick={() => {
                    openModal();
                    setCurrentDirection("left");
                    setFrameSet("running");
                }}><img src={LeftArrow} width={32} height={32}/></button>
                <button onClick={() => {
                    openModal();
                    setCurrentDirection("right");
                    setFrameSet("running");
                }}><img src={RightArrow} width={32} height={32}/></button>
            </div>
            <br/>
            <div>
                <label>Walking frames</label>
                <br/>
                <button onClick={() => {
                    openModal();
                    setCurrentDirection("up");
                    setFrameSet("walking");
                }}><img src={UpArrow} width={32} height={32}/></button>
                <button onClick={() => {
                    openModal();
                    setCurrentDirection("down");
                    setFrameSet("walking");
                }}><img src={DownArrow} width={32} height={32}/></button>
                <button onClick={() => {
                    openModal();
                    setCurrentDirection("left");
                    setFrameSet("walking");
                }}><img src={LeftArrow} width={32} height={32}/></button>
                <button onClick={() => {
                    openModal();
                    setCurrentDirection("right");
                    setFrameSet("walking");
                }}><img src={RightArrow} width={32} height={32}/></button>
            </div>
            <br/>
            <div>
                <label>Surfing frames</label>
                <br/>
                <button onClick={() => {
                    openModal();
                    setCurrentDirection("up");
                    setFrameSet("surfing");
                }}><img src={UpArrow} width={32} height={32}/></button>
                <button onClick={() => {
                    openModal();
                    setCurrentDirection("down");
                    setFrameSet("surfing");
                }}><img src={DownArrow} width={32} height={32}/></button>
                <button onClick={() => {
                    openModal();
                    setCurrentDirection("left");
                    setFrameSet("surfing");
                }}><img src={LeftArrow} width={32} height={32}/></button>
                <button onClick={() => {
                    openModal();
                    setCurrentDirection("right");
                    setFrameSet("surfing");
                }}><img src={RightArrow} width={32} height={32}/></button>
                <br/>
                <input type="checkbox" id="playerChoice" name="playerChoice" value="Player"/>
                <label htmlFor="playerChoice">Is a playable character</label>
            {renderFrameModal(frameSet)}
            </div>
            <br/>
            <button onClick={() => {
                data = {
                    "ID": uuidv4(),
                    "Name": name,
                    "SwimmingFrames": swimmingFrames,
                    "RunningFrames": runningFrames,
                    "WalkingFrames": walkingFrames,
                    "SurfingFrames": surfingFrames,
                    "IsPlayable": isPlayer
                }
            }}>Save</button>
        </div>
    )
}
export default NewOverworlds