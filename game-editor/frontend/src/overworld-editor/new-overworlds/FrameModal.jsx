import Modal from 'react-modal';
import { useState } from "react";

import { CreateOverworldFrame } from "../../wailsjs/go/main/App";
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

const FrameModal = ({ typeOfFrame, nameOfOW, setFrames, direction, modalIsOpen, closeModal}) => {
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
            <label htmlForfor="frames">Number of frames:</label>
            <br/>
            <input type="number" id="frames" name="frames" min="1" max="9999" />
            <br/>
            <button onClick={async() => {
              let data = await CreateOverworldFrame();
            }}>Upload Frame</button>
            {currentFrameNumber < frameMax ? <button>Continue</button> : <div></div>}
            <button onClick={() => closeModal()}>Close</button>
        </div>
        </Modal>
    </div>
 )
} 
export default FrameModal;