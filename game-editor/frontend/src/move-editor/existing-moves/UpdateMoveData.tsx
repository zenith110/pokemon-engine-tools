import { UpdateMove } from "../../../bindings/github.com/zenith110/pokemon-engine-tools/tools/move-editor/MoveEditorApp";
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
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
      <div className="grid grid-cols-2 gap-6">
        {/* Move Name Section */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">Move Name</label>
          <input
            value={name ? name : ""}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-tealBlue focus:ring-1 focus:ring-tealBlue focus:outline-none transition-colors"
            placeholder="Enter move name..."
          />
        </div>

        {/* Move Type Section */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">Move Type</label>
          <input
            value={moveType ? moveType : ""}
            onChange={(e) => setMoveType(e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-tealBlue focus:ring-1 focus:ring-tealBlue focus:outline-none transition-colors"
            placeholder="Enter move type..."
          />
        </div>

        {/* Stats Section */}
        <div className="col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4">Move Stats</h3>
          <div className="grid grid-cols-3 gap-4">
            {/* Power Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Power</label>
              <input
                type="number"
                value={power}
                onChange={(e) => setPower(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-tealBlue focus:ring-1 focus:ring-tealBlue focus:outline-none transition-colors text-center"
                placeholder="0"
              />
            </div>

            {/* PP Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">PP</label>
              <input
                type="number"
                value={pp ? pp : 0}
                onChange={(e) => setPP(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-tealBlue focus:ring-1 focus:ring-tealBlue focus:outline-none transition-colors text-center"
                placeholder="0"
              />
            </div>

            {/* Accuracy Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Accuracy</label>
              <input
                type="number"
                value={accuracy ? accuracy : 0}
                onChange={(e) => setAccuracy(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-tealBlue focus:ring-1 focus:ring-tealBlue focus:outline-none transition-colors text-center"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <button
          className="px-6 py-2 bg-tealBlue text-white rounded-xl hover:bg-wildBlueYonder transition-colors duration-200 flex items-center space-x-2"
          onClick={async () => {
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
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  );
};

export default UpdateMoveData;
