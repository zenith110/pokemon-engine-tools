import { Dispatch, SetStateAction } from "react";
import { Move } from "../move.model";
declare const UpdateMoveData: ({ selectedMove, power, setPower, pp, setPP, accuracy, setAccuracy, moveType, setMoveType, name, setName, }: {
    selectedMove: Move;
    power: number | undefined;
    setPower: Dispatch<SetStateAction<number | undefined>>;
    pp: number | undefined;
    setPP: Dispatch<SetStateAction<number | undefined>>;
    accuracy: number | undefined;
    setAccuracy: Dispatch<SetStateAction<number | undefined>>;
    moveType: string | undefined;
    setMoveType: Dispatch<SetStateAction<string | undefined>>;
    name: string | undefined;
    setName: Dispatch<SetStateAction<string | undefined>>;
}) => import("react").JSX.Element;
export default UpdateMoveData;
