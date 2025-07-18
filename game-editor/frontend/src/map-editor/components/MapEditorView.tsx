import { MapEditorView as RefactoredMapEditorView } from "./map-editor-view";
import { MapEditorViewProps } from "../types";

const MapEditorView = (props: MapEditorViewProps) => {
  return <RefactoredMapEditorView {...props} />;
};

export default MapEditorView; 