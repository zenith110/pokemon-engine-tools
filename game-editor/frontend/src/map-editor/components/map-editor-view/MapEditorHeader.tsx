import { Button } from "../../../components/ui/button";

interface MapEditorHeaderProps {
  mapName: string;
  onBack: () => void;
  hasUnsavedChanges: boolean;
}

const MapEditorHeader = ({ mapName, onBack, hasUnsavedChanges }: MapEditorHeaderProps) => {
  const handleBack = async () => {
    // Always go back - save functionality is now in the toolbar
    onBack();
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-slate-800">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="text-white hover:text-slate-300"
        >
          ← Back to Maps
        </Button>
        <h1 className="text-xl font-semibold">{mapName}</h1>
      </div>
      {hasUnsavedChanges && (
        <div className="text-orange-400 text-sm font-medium">
          Unsaved changes
        </div>
      )}
    </div>
  );
};

export default MapEditorHeader; 