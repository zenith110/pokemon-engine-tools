import Modal from 'react-modal';
import { useState } from "react";
import { models } from "../../../wailsjs/go/models";
import { CreateOverworldFrame, CreteOverworldGif  } from "../../../wailsjs/go/overworldeditor/OverworldEditorApp";

interface FrameModalProps {
    typeOfFrame: string;
    nameOfFolder: number;
    setFrames: (frames: models.OverworldDirectionFrame[]) => void;
    direction: string | null;
    modalIsOpen: boolean;
    closeModal: () => void;
    frames: models.OverworldDirectionFrame[];
}

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

const FrameModal = ({ typeOfFrame, nameOfFolder, setFrames, direction, modalIsOpen, closeModal, frames}: FrameModalProps) => {
 const [currentFrameNumber, currentSetFrameNumber] = useState(0);
 const [frameMax, setFrameMax] = useState(0)
 const [gif, setGif] = useState("")
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
            <input type="number" id="frames" name="frames" min="1" max="9999" onChange={(e) => setFrameMax(Number(e.target.value))}/>
            <br/>
            <label>Current frame:</label>
            <br/>
            <input type="number" id="currentFrame" name="currentFrame" min={currentFrameNumber} max={frameMax} onChange={(e) => currentSetFrameNumber(Number(e.target.value))} value={currentFrameNumber}/>
            <br/>
            <img src={frames[currentFrameNumber]? `data:image/png;base64,${frames[currentFrameNumber]?.Sprite}` : ''} alt={`${nameOfFolder} image`} />
            <button onClick={async() => {
              if (!direction) return;
              let data = await CreateOverworldFrame(typeOfFrame, currentFrameNumber, nameOfFolder, direction);
              setFrames([
                ...frames,
                models.OverworldDirectionFrame.createFrom(data)
              ])
            }}>Upload Frame</button>
            <br/>
            <br/>
            { currentFrameNumber == frameMax ? <button onClick={async() => {
              if (!direction) return;
              let gifData = await CreteOverworldGif(typeOfFrame, currentFrameNumber, nameOfFolder, direction);
              setGif(gifData)
            }}>Create Gif</button> : <div/>}
            <br/>
            <img src={gif ? `data:image/gif;base64,${gif}` : ""}></img>
            <button onClick={() => closeModal()}>Close</button>
        </div>
        </Modal>
    </div>
 )
} 
export default FrameModal;