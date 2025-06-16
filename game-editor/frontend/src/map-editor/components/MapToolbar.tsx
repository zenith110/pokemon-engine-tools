import { Button } from "../../components/ui/button";
import { Pencil, Undo, Redo, PaintBucket, Trash2 } from "lucide-react";

interface MapToolbarProps {
  paintMode: 'stamp' | 'fill' | 'remove';
  selectedTile: { image: string; name: string; width?: number; height?: number } | null;
  tileSize: number;
  historyIndex: number;
  historyLength: number;
  undo: () => void;
  redo: () => void;
  setPaintMode: (mode: 'stamp' | 'fill' | 'remove') => void;
  clearMap: () => void;
}

const MapToolbar = ({
  paintMode,
  selectedTile,
  tileSize,
  historyIndex,
  historyLength,
  undo,
  redo,
  setPaintMode,
  clearMap,
}: MapToolbarProps) => (
  <>
    {paintMode === 'stamp' && (
      <div className="mb-2 text-xs text-blue-400 font-semibold">Stamp Mode Active: Click to paint</div>
    )}
    {paintMode === 'fill' && (
      <div className="mb-2 text-xs text-teal-400 font-semibold">Fill Mode Active: Click to fill the map</div>
    )}
    {paintMode === 'remove' && (
      <div className="mb-2 text-xs text-red-400 font-semibold">Remove Mode Active: Click tiles to delete</div>
    )}
    {selectedTile && (
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xs text-slate-400">Selected Tile:</span>
        <img
          src={selectedTile.image}
          alt={selectedTile.name}
          style={{
            width: tileSize * (selectedTile.width || 1),
            height: tileSize * (selectedTile.height || 1),
            imageRendering: 'pixelated',
            border: '1px solid #334155',
            background: '#1e293b',
            borderRadius: 4,
          }}
        />
        <span className="text-xs text-slate-400">{selectedTile.name}</span>
      </div>
    )}
    <div className="flex items-center gap-2 mb-4">
      <Button variant="ghost" size="icon" onClick={undo} disabled={historyIndex <= 0}>
        <Undo className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={redo} disabled={historyIndex >= historyLength - 1}>
        <Redo className="h-4 w-4" />
      </Button>
      <Button
        variant={paintMode === 'stamp' ? 'default' : 'ghost'}
        size="icon"
        onClick={() => setPaintMode('stamp')}
        title="Stamp Mode"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant={paintMode === 'fill' ? 'default' : 'ghost'}
        size="icon"
        onClick={() => setPaintMode('fill')}
        title="Fill Mode"
      >
        <PaintBucket className="h-4 w-4" />
      </Button>
      <Button
        variant={paintMode === 'remove' ? 'default' : 'ghost'}
        size="icon"
        onClick={() => setPaintMode('remove')}
        title="Remove Tile"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={clearMap} title="Clear Map">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  </>
);

export default MapToolbar;