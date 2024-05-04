import { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';

import DownArrow from "../images/reshot-icon-down-arrow-P6BUA8L4DS.svg";
import UpArrow from "../images/reshot-icon-up-arrow-XMEL8JGW5T.svg";
import LeftArrow from "../images/reshot-icon-left-arrow-2RFCAW584E.svg";
import RightArrow from "../images/reshot-icon-right-arrow-5E3R279NU8.svg";
import { CheckOverworldId } from "../../../wailsjs/go/main/App";
import FrameModal from "./FrameModal";

const NewOverworlds = () => {
    const [swimmingFrames, setSwimmingFrames] = useState([]);
    const [walkingFrames, setWalkingFrames] = useState([]);
    const [runningFrames, setRunningFrames] = useState([]);
    const [isPlayer, setIsPlayer] = useState(false);
    const [surfingFrames, setSurfingFrames] = useState([]);
    const [modalIsOpen, setIsOpen] = useState(false);
    const [frameSet, setFrameSet] = useState();
    const [currentDirection, setCurrentDirection] = useState()
    const [folderName, setFolderName] = useState(0)
    useEffect(() => {
        const GetOverworldId = async() => {
            let data = await CheckOverworldId();
            setFolderName(data);
        }
        GetOverworldId()
    },[])
    const openModal = () => {
        setIsOpen(true);
    }

    const closeModal = () => {
        setIsOpen(false);
    }
    const renderFrameModal = (frameType) => {
        switch(frameType) {
            case 'swimming':
                return <FrameModal typeOfFrame={"swimming"} nameOfFolder={folderName} setFrames={setSwimmingFrames} direction={currentDirection} modalIsOpen={modalIsOpen} closeModal={closeModal} frames={swimmingFrames}/>;
            case 'running':
                return <FrameModal typeOfFrame={"running"} nameOfFolder={folderName} setFrames={setRunningFrames} direction={currentDirection} modalIsOpen={modalIsOpen} closeModal={closeModal} frames={runningFrames}/>;
            case 'walking':
                return <FrameModal typeOfFrame={"walking"} nameOfFolder={folderName} setFrames={setWalkingFrames} direction={currentDirection} modalIsOpen={modalIsOpen} closeModal={closeModal} frames={walkingFrames}/>;
            case 'surfing':
                return <FrameModal typeOfFrame={"surfing"} nameOfFolder={folderName} setFrames={setSurfingFrames} direction={currentDirection} modalIsOpen={modalIsOpen} closeModal={closeModal} frames={surfingFrames}/>;  
            default:
                return '';
        }
    }
    return(
        <div>
            <div>
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
                let data = {
                    "OverworldId": folderName,
                    "SwimmingFrames": swimmingFrames,
                    "RunningFrames": runningFrames,
                    "WalkingFrames": walkingFrames,
                    "SurfingFrames": surfingFrames,
                    "IsPlayable": isPlayer
                }
                console.log(data)
            }}>Save</button>
        </div>
    )
}
export default NewOverworlds