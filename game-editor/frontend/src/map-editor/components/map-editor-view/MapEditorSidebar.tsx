import TilePalette, { SelectedTile } from "../TilePalette";
import LayerPanel from "../LayerPanel";

interface MapEditorSidebarProps {
  selectedTile: SelectedTile | null;
  setSelectedTile: (tile: SelectedTile | null) => void;
  tilesetPath: string;
  tileSize: number;
}

const MapEditorSidebar = ({
  selectedTile,
  setSelectedTile,
  tilesetPath,
  tileSize,
}: MapEditorSidebarProps) => {
  return (
    <div className="h-full flex flex-col justify-stretch">
      <TilePalette
        selectedTile={selectedTile}
        setSelectedTile={setSelectedTile}
        tilesetPath={tilesetPath}
        tileSize={tileSize}
      />
    </div>
  );
};

export default MapEditorSidebar; 