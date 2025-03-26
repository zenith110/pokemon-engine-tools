import { useState, useEffect } from "react";
import { ParseMoves } from "../../wailsjs/go/moveeditor/MoveEditorApp";
import Select from "react-select";
import UpdateMoveData from "./existing-moves/UpdateMoveData";
import { Move } from "./move.model";

const MoveEditor = () => {
  const [moves, setMoves] = useState<Move[]>([]);
  const [selectedMove, setSelectedMove] = useState<Move>();
  const [power, setPower] = useState<number | undefined>(0);
  const [pp, setPP] = useState<number | undefined>(0);
  const [accuracy, setAccuracy] = useState<number | undefined>(0);
  const [moveType, setMoveType] = useState<string | undefined>("");
  const [name, setName] = useState<string | undefined>("");

  useEffect(() => {
    const fetchMoves = async () => {
      let data = await ParseMoves();
      setMoves(data.Move.map(move => ({
        ...move,
        ID: String(move.ID)
      })));
    };
    fetchMoves();
  }, []);
  return (
    <div className="text-black">
      <Select
        name="moves"
        onChange={(e) => {
          const move: Move | undefined = moves.find(
            (moveData) => moveData.ID === e?.value
          );
          setSelectedMove(move);
          setPower(move?.Power);
          setPP(move?.Pp);
          setAccuracy(move?.Accuracy);
          setMoveType(move?.Type);
          setName(move?.Name);
        }}
        isClearable={false}
        isDisabled={false}
        isLoading={false}
        isRtl={false}
        isSearchable={true}
        isMulti={false}
        classNames={{
          control: () => "rounded-2xl",
        }}
        options={moves?.map((move) => ({
          value: move.ID,
          label: `${move.Name}`,
        }))}
      />
      {selectedMove ? (
        <UpdateMoveData
          selectedMove={selectedMove}
          power={power}
          setPower={setPower}
          pp={pp}
          setPP={setPP}
          accuracy={accuracy}
          setAccuracy={setAccuracy}
          moveType={moveType}
          setMoveType={setMoveType}
          name={name}
          setName={setName}
        />
      ) : (
        <div />
      )}
      <br />
      <button className="file: bg-blueWhale rounded border-1 border-solid w-1/6 border-black text-white">
        New Move
      </button>
    </div>
  );
};
export default MoveEditor;
