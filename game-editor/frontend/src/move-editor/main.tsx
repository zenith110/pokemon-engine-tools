import { useState, useEffect } from "react";
import { ParseMoves } from "../../wailsjs/go/moveeditor/MoveEditorApp";
import Select from "react-select";
import UpdateMoveData from "./existing-moves/UpdateMoveData";
import { Move } from "./move.model";
import { useNavigate } from "react-router-dom";

const MoveEditor = () => {
  const [moves, setMoves] = useState<Move[]>([]);
  const [selectedMove, setSelectedMove] = useState<Move>();
  const [power, setPower] = useState<number | undefined>(0);
  const [pp, setPP] = useState<number | undefined>(0);
  const [accuracy, setAccuracy] = useState<number | undefined>(0);
  const [moveType, setMoveType] = useState<string | undefined>("");
  const [name, setName] = useState<string | undefined>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMoves = async () => {
      setIsLoading(true);
      try {
        let data = await ParseMoves();
        const mappedMoves = data.Move.map(move => ({
          ...move,
          ID: String(move.ID)
        }));
        setMoves(mappedMoves);

        // Load last selected move from localStorage
        const lastSelectedId = localStorage.getItem('lastSelectedMoveId');
        if (lastSelectedId) {
          const lastSelected = mappedMoves.find(move => move.ID === lastSelectedId);
          if (lastSelected) {
            setSelectedMove(lastSelected);
            setPower(lastSelected.Power);
            setPP(lastSelected.Pp);
            setAccuracy(lastSelected.Accuracy);
            setMoveType(lastSelected.Type);
            setName(lastSelected.Name);
          }
        }
      } catch (error) {
        console.error('Error fetching move data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMoves();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center min-h-screen bg-slate-800 p-6 relative">
        <div className="absolute inset-0 bg-slate-800/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 border-4 border-tealBlue border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white text-lg font-medium">Loading Move Data...</p>
            <p className="text-gray-400 text-sm">Please wait while we fetch the latest data from your move.toml</p>
          </div>
        </div>
        {/* Keep the layout structure to prevent layout shift */}
        <div className="w-full max-w-3xl bg-slate-700 rounded-2xl shadow-lg p-6">
          <div className="flex flex-col items-center space-y-6">
            <h1 className="text-2xl font-bold text-white mb-4">Move Editor</h1>
            
            <div className="w-full max-w-md">
              <div className="h-10 bg-slate-600 rounded-xl"></div>
            </div>

            <div className="w-full mt-6">
              <div className="bg-slate-600 rounded-xl p-6 h-96"></div>
            </div>

            <div className="mt-6 px-6 py-2 bg-slate-600 text-white rounded-xl w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-slate-800 p-6">
      <div className="w-full max-w-3xl bg-slate-700 rounded-2xl shadow-lg p-6">
        <div className="flex flex-col items-center space-y-6">
          <h1 className="text-2xl font-bold text-white mb-4">Move Editor</h1>
          
          <div className="w-full max-w-md">
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
              placeholder="Select a move..."
              className="text-sm"
              classNames={{
                control: () => "rounded-xl bg-slate-800 border-none hover:border-none",
                option: (state) => `bg-slate-800 ${state.isFocused ? 'bg-slate-700' : ''} hover:bg-slate-700`,
                menu: () => "bg-slate-800 border border-slate-700",
                menuList: () => "bg-slate-800",
                singleValue: () => "text-slate-900",
                input: () => "text-slate-900 !text-slate-900",
                placeholder: () => "text-gray-400"
              }}
              styles={{
                input: (base) => ({
                  ...base,
                  color: 'rgb(15, 23, 42)' // text-slate-900
                }),
                singleValue: (base) => ({
                  ...base,
                  color: 'rgb(15, 23, 42)' // text-slate-900
                }),
                option: (base, state) => ({
                  ...base,
                  color: 'rgb(226, 232, 240)', // text-slate-200 for options
                  backgroundColor: state.isFocused ? '#334155' : '#1e293b',
                  ':active': {
                    backgroundColor: '#334155'
                  }
                })
              }}
              options={moves?.map((move) => ({
                value: move.ID,
                label: `${move.Name}`,
              }))}
            />
          </div>

          {selectedMove ? (
            <div className="w-full mt-6">
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
            </div>
          ) : (
            <div className="text-gray-400 text-center mt-8">
              <p>No move selected</p>
              <p className="text-sm">Select a move from the dropdown or create a new one</p>
            </div>
          )}

          <button 
            className="mt-6 px-6 py-2 bg-tealBlue text-white rounded-xl hover:bg-wildBlueYonder transition-colors duration-200 flex items-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span>New Move</span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default MoveEditor;
