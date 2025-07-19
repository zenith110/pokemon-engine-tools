import MapView from "../MapView";
import { EncounterView } from "../encounter-view";
import SettingsView from "../settings-view/SettingsView";
import { SelectedTile } from "../TilePalette";
import { TOMLEncounter } from "../../types";

type ViewMode = "map" | "encounters" | "settings";

interface MapEditorMainProps {
  activeView: ViewMode;
  mapData: {
    name?: string;
    width: number;
    height: number;
    tileSize: number;
    type?: string;
    music?: string;
    grassEncounters: TOMLEncounter[];
    waterEncounters: TOMLEncounter[];
    caveEncounters: TOMLEncounter[];
    fishingEncounters: TOMLEncounter[];
  };
  layers: Array<{
    id: number;
    name: string;
    visible: boolean;
    locked: boolean;
    tiles: Array<{
      x: number;
      y: number;
      tileId: string;
      autoTileId?: string;
    }>;
  }>;
  selectedTile: SelectedTile | null;
  selectedAutoTile: { id: string; name: string; image: string } | null;
  activeLayerId: number;
  paintMode: 'stamp' | 'fill' | 'remove';
  handleLayerChange: (newLayers: any) => void;
  handleEncountersChange: (type: string, encounters: TOMLEncounter[]) => void;
  handleSettingsChange: (settings: {
    name: string;
    width: number;
    height: number;
    tileSize: number;
    type: string;
    music: string;
  }) => void;
  onInitialRenderReady?: () => void;
  isMapAlreadyRendered?: boolean;
}

const MapEditorMain = ({
  activeView,
  mapData,
  layers,
  selectedTile,
  selectedAutoTile,
  activeLayerId,
  paintMode,
  handleLayerChange,
  handleEncountersChange,
  handleSettingsChange,
  onInitialRenderReady,
  isMapAlreadyRendered,
}: MapEditorMainProps) => {
  const renderMainView = () => {
    switch (activeView) {
      case "map":
        return (
          <MapView
            width={mapData.width}
            height={mapData.height}
            tileSize={mapData.tileSize}
            selectedTile={selectedTile}
            selectedAutoTile={selectedAutoTile}
            layers={layers}
            setLayers={handleLayerChange}
            activeLayerId={activeLayerId}
            paintMode={paintMode}
            onInitialRenderReady={onInitialRenderReady}
            isMapAlreadyRendered={isMapAlreadyRendered}
          />
        );
      case "encounters":
        return (
          <EncounterView
            grassEncounters={mapData.grassEncounters}
            waterEncounters={mapData.waterEncounters}
            caveEncounters={mapData.caveEncounters}
            fishingEncounters={mapData.fishingEncounters}
            setEncounters={handleEncountersChange}
          />
        );
      case "settings":
        return (
          <SettingsView
            mapData={mapData}
            onSettingsChange={handleSettingsChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {renderMainView()}
    </div>
  );
};

export default MapEditorMain; 