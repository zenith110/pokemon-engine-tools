import { Button } from "../../components/ui/button";
import { Pencil, Undo, Redo, PaintBucket, Eraser, RotateCcw, Save, Link, Grid, Download } from "lucide-react";

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
  onSave: () => void;
  onConnectMap: () => void;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  showGrid: boolean;
  onToggleGrid: () => void;
  onExportImage: () => void;
}

const activeBtnClass =
  'border border-yellow-400 bg-yellow-900/50 text-yellow-300 shadow-[0_0_8px_2px_rgba(250,204,21,0.5)]';

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
  onSave,
  onConnectMap,
  hasUnsavedChanges,
  isSaving,
  showGrid,
  onToggleGrid,
  onExportImage,
}: MapToolbarProps) => (
  <>
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
        variant="ghost"
        size="icon"
        onClick={() => setPaintMode('stamp')}
        title="Stamp Mode"
        className={paintMode === 'stamp' ? activeBtnClass : ''}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setPaintMode('fill')}
        title="Fill Mode"
        className={paintMode === 'fill' ? activeBtnClass : ''}
      >
        <PaintBucket className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setPaintMode('remove')}
        title="Remove Tile"
        className={paintMode === 'remove' ? activeBtnClass : ''}
      >
        <Eraser className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={clearMap} title="Clear Map">
        <RotateCcw className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-slate-600 mx-2"></div>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onToggleGrid}
        title={showGrid ? "Hide Grid" : "Show Grid"}
        className={showGrid ? activeBtnClass : ''}
      >
        <Grid className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onExportImage}
        title="Export Map as Image"
      >
        <Download className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-slate-600 mx-2"></div>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onSave} 
        disabled={isSaving || !hasUnsavedChanges}
        title={isSaving ? "Saving..." : hasUnsavedChanges ? "Save Map" : "No changes to save"}
        className={hasUnsavedChanges ? "text-blue-400 hover:text-blue-300" : "text-slate-500"}
      >
        <Save className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onConnectMap}
        title="Connect Maps"
      >
        <Link className="h-4 w-4" />
      </Button>
    </div>
  </>
);

export default MapToolbar;