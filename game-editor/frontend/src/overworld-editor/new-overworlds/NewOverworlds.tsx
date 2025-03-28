import { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { models } from "../../../wailsjs/go/models";

import DownArrow from "../images/reshot-icon-down-arrow-P6BUA8L4DS.svg";
import UpArrow from "../images/reshot-icon-up-arrow-XMEL8JGW5T.svg";
import LeftArrow from "../images/reshot-icon-left-arrow-2RFCAW584E.svg";
import RightArrow from "../images/reshot-icon-right-arrow-5E3R279NU8.svg";
import { CheckOverworldId, CreateOverworldTomlEntry } from "../../../wailsjs/go/overworldeditor/OverworldEditorApp";
import FrameModal from "./FrameModal";
const NewOverworlds = () => {
    const [swimmingFrames, setSwimmingFrames] = useState<models.OverworldDirectionFrame[]>([]);
    const [walkingFrames, setWalkingFrames] = useState<models.OverworldDirectionFrame[]>([]);
    const [runningFrames, setRunningFrames] = useState<models.OverworldDirectionFrame[]>([]);
    const [isPlayer, setIsPlayer] = useState(false);
    const [surfingFrames, setSurfingFrames] = useState<models.OverworldDirectionFrame[]>([]);
    const [modalIsOpen, setIsOpen] = useState(false);
    const [frameSet, setFrameSet] = useState<string | null>(null);
    const [currentDirection, setCurrentDirection] = useState<string | null>(null)
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
    const renderFrameModal = (frameType: string) => {
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
                <input type="checkbox" id="playerChoice" name="playerChoice" value="Player" onChange={(e) => setIsPlayer(e.target.checked)}/>
                <label htmlFor="playerChoice">Is a playable character</label>
            {renderFrameModal(frameSet || "")}
            </div>
            <br/>
            <button onClick={async() => {
                let data: models.OverworldDataJson = {
                    "ID": uuidv4(),
                    "OverworldId": folderName.toString(),
                    "SwimmingFrames": swimmingFrames,
                    "RunningFrames": runningFrames,
                    "WalkingFrames": walkingFrames,
                    "SurfingFrames": surfingFrames,
                    "IsPlayer": isPlayer,
                    "Name": folderName.toString(),
                    "convertValues": () => {}
                }
               await CreateOverworldTomlEntry(data)
            }}>Save</button>
        </div>
    )
}
export default NewOverworlds