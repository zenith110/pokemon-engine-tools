import Modal from 'react-modal';
import { useState } from "react";

import { CreateOverworldFrame, CreteOverworldGif  } from "../../../wailsjs/go/main/App";
const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
    },
  };

const FrameModal = ({ typeOfFrame, nameOfFolder, setFrames, direction, modalIsOpen, closeModal, frames}) => {
 const [currentFrameNumber, currentSetFrameNumber] = useState(0);
 const [frameMax, setFrameMax] = useState(0)
 return(
    <div>
        <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            style={customStyles}
        >
        <div className="text-black">
            <label>Number of frames:</label>
            <br/>
            <input type="number" id="frames" name="frames" min="1" max="9999" onChange={(e) => setFrameMax(e.target.value)}/>
            <br/>
            <label>Current frame:</label>
            <br/>
            <input type="number" id="currentFrame" name="currentFrame" min={currentFrameNumber} max={frameMax} onChange={(e) => currentSetFrameNumber(e.target.value)} value={currentFrameNumber}/>
            <br/>
            <img src={frames[currentFrameNumber]? `data:image/png;base64,${frames[currentFrameNumber]?.sprite}` : ''} alt={() => `${nameOfFolder} image`} />
            <button onClick={async() => {
              console.log(currentFrameNumber)
              let data = await CreateOverworldFrame(typeOfFrame, parseInt(currentFrameNumber, 10), nameOfFolder, direction);
              setFrames([
                ...frames,
                data
              ])
            }}>Upload Frame</button>
            <br/>
            {currentFrameNumber < frameMax ? <button>Continue</button> : <div></div>}
            <br/>
            { currentFrameNumber == frameMax ? <button onClick={async() => {
              let data = await CreteOverworldGif(typeOfFrame, parseInt(currentFrameNumber, 10), nameOfFolder, direction);
            }}>Close</button> : <div></div>}
        </div>
        </Modal>
    </div>
 )
} 
export default FrameModal;