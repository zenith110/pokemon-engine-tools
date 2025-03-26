import { models } from "../../../wailsjs/go/models";
interface FrameModalProps {
    typeOfFrame: string;
    nameOfFolder: number;
    setFrames: (frames: models.OverworldDirectionFrame[]) => void;
    direction: string | null;
    modalIsOpen: boolean;
    closeModal: () => void;
    frames: models.OverworldDirectionFrame[];
}
declare const FrameModal: ({ typeOfFrame, nameOfFolder, setFrames, direction, modalIsOpen, closeModal, frames }: FrameModalProps) => import("react").JSX.Element;
export default FrameModal;
