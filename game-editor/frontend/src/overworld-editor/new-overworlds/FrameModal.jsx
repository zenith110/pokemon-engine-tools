import Modal from 'react-modal';
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
 return(
    <div>
        <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            style={customStyles}
            contentLabel="Example Modal"
        >
        <div className="text-black">
            <button onClick={() => closeModal()}>Close</button>
        </div>
        </Modal>
    </div>
 )
} 
export default FrameModal;