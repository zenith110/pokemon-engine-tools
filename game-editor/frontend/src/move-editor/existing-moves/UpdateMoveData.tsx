import { UpdateMove } from "../../../wailsjs/go/moveeditor/MoveEditorApp";
import { Dispatch, SetStateAction } from "react";
import { Move } from "../move.model";

const UpdateMoveData = ({
  selectedMove,
  power,
  setPower,
  pp,
  setPP,
  accuracy,
  setAccuracy,
  moveType,
  setMoveType,
  name,
  setName,
}: {
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
}) => {
  return (
    <div>
      <br />
      <br />
      <label>Power: </label>
      <input
        type="number"
        value={power}
        onChange={(e) => setPower(parseInt(e.target.value))}
      ></input>
      <br />
      <label>PP: </label>
      <input
        type="number"
        value={pp ? pp : 0}
        onChange={(e) => setPP(parseInt(e.target.value))}
      ></input>
      <br />
      <label>Accuracy: </label>
      <input
        type="number"
        value={accuracy ? accuracy : 0}
        onChange={(e) => setAccuracy(parseInt(e.target.value))}
      ></input>
      <br />
      <label>Type: </label>
      <input
        value={moveType ? moveType : ""}
        onChange={(e) => setMoveType(e.target.value)}
      ></input>
      <br />
      <label>Name: </label>
      <input
        value={name ? name : ""}
        onChange={(e) => setName(e.target.value)}
      ></input>
      <br />
      <br />
      <button
        className="file: bg-blueWhale rounded border-1 border-solid w-1/6 border-black text-white"
        onClick={async () => {
          // Weird cast, need to revisit better way of doing this.
          let data = {
            power: Number(power),
            pp: Number(pp),
            accuracy: Number(accuracy),
            type: String(moveType),
            name: String(name),
            id: selectedMove?.ID.toString(),
            description: "test",
          };
          await UpdateMove(data);
        }}
      >
        Save
      </button>
    </div>
  );
};
export default UpdateMoveData;
