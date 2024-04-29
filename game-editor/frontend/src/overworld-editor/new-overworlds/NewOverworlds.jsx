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
                    <FrameModal typeOfFrame={"Swimming"} nameOfOW={name} setFrames={setSwimmingFrames} Direction={"Up"}/>
                }}><img src={UpArrow} width={32} height={32}/></button>
                <button onClick={() => {
                    <FrameModal typeOfFrame={"Swimming"} nameOfOW={name} setFrames={setSwimmingFrames} Direction={"Down"}/>
                }}><img src={DownArrow} width={32} height={32}/></button>
                <button onClick={() => {
                    <FrameModal typeOfFrame={"Swimming"} nameOfOW={name} setFrames={setSwimmingFrames} Direction={"Left"}/>
                }}><img src={LeftArrow} width={32} height={32}/></button>
                <button onClick={() => {
                    <FrameModal typeOfFrame={"Swimming"} nameOfOW={name} setFrames={setSwimmingFrames} Direction={"Right"}/>
                }}><img src={RightArrow} width={32} height={32}/></button>
            </div>
            <br/> 
            <div>
                <label>Running frames</label>
                <br/>
                <button onClick={() => {
                    <FrameModal typeOfFrame={"Running"} nameOfOW={name} setFrames={setRunningFrames} Direction={"Up"}/>
                }}><img src={UpArrow} width={32} height={32}/></button>
                <button onClick={() => {
                    <FrameModal typeOfFrame={"Running"} nameOfOW={name} setFrames={setRunningFrames} Direction={"Down"}/>
                }}><img src={DownArrow} width={32} height={32}/></button>
                <button onClick={() => {
                    <FrameModal typeOfFrame={"Running"} nameOfOW={name} setFrames={setRunningFrames} Direction={"Left"}/>
                }}><img src={LeftArrow} width={32} height={32}/></button>
                <button onClick={() => {
                    <FrameModal typeOfFrame={"Running"} nameOfOW={name} setFrames={setRunningFrames} Direction={"Right"}/>
                }}><img src={RightArrow} width={32} height={32}/></button>
            </div>
            <br/>
            <div>
                <label>Walking frames</label>
                <br/>
                <button onClick={() => {
                    <FrameModal typeOfFrame={"Walking"} nameOfOW={name} setFrames={setWalkingFrames} Direction={"Up"}/>
                }}><img src={UpArrow} width={32} height={32}/></button>
                <button onClick={() => {
                    <FrameModal typeOfFrame={"Walking"} nameOfOW={name} setFrames={setWalkingFrames} Direction={"Down"}/>
                }}><img src={DownArrow} width={32} height={32}/></button>
                <button onClick={() => {
                    <FrameModal typeOfFrame={"Walking"} nameOfOW={name} setFrames={setWalkingFrames} Direction={"Left"}/>
                }}><img src={LeftArrow} width={32} height={32}/></button>
                <button onClick={() => {
                    <FrameModal typeOfFrame={"Walking"} nameOfOW={name} setFrames={setWalkingFrames} Direction={"Right"}/>
                }}><img src={RightArrow} width={32} height={32}/></button>
            </div>
            <br/>
            <div>
                <label>Surfing frames</label>
                <br/>
                <button onClick={() => {
                    <FrameModal typeOfFrame={"Surfing"} nameOfOW={name} setFrames={setSurfingFrames} Direction={"Up"}/>
                }}><img src={UpArrow} width={32} height={32}/></button>
                <button onClick={() => {
                    <FrameModal typeOfFrame={"Surfing"} nameOfOW={name} setFrames={setSurfingFrames} Direction={"Down"}/>
                }}><img src={DownArrow} width={32} height={32}/></button>
                <button onClick={() => {
                    <FrameModal typeOfFrame={"Surfing"} nameOfOW={name} setFrames={setSurfingFrames} Direction={"Left"}/>
                }}><img src={LeftArrow} width={32} height={32}/></button>
                <button onClick={() => {
                    <FrameModal typeOfFrame={"Surfing"} nameOfOW={name} setFrames={setSurfingFrames} Direction={"Right"}/>
                }}><img src={RightArrow} width={32} height={32}/></button>
                <br/>
                <input type="checkbox" id="playerChoice" name="playerChoice" value="Player"/>
                <label for="playerChoice">Is a playable character</label>
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