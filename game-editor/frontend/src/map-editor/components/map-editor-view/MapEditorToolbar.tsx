import { Button } from "../../../components/ui/button";
import { Map, Zap, Settings, Eye, EyeOff, Lock, LockOpen, Plus, Trash2, ChevronLeft, ChevronRight, Link } from "lucide-react";
import MapToolbar from "../MapToolbar";
import { SelectedTile } from "../TilePalette";
import MapConnectionDialog from "../MapConnectionDialog";
import { useState, useRef } from "react";
import { RenderMap } from "../../../../wailsjs/go/mapeditor/MapEditorApp";
import { mapeditor } from "../../../../wailsjs/go/models";
import { EventsOn } from "../../../../wailsjs/runtime/runtime";

type ViewMode = "map" | "encounters" | "settings";

interface Layer {
  id: number;
  name: string;
  visible: boolean;
  locked?: boolean;
  tiles: Array<{
    x: number;
    y: number;
    tileId: string;
    autoTileId?: string;
  }>;
}

interface MapConnection {
  direction: "up" | "down" | "left" | "right";
  mapId: number;
  mapName: string;
}

interface MapEditorToolbarProps {
  activeView: ViewMode;
  setActiveView: (view: ViewMode) => void;
  paintMode: 'stamp' | 'fill' | 'remove';
  selectedTile: SelectedTile | null;
  tileSize: number;
  historyIndex: number;
  historyLength: number;
  undo: () => void;
  redo: () => void;
  setPaintMode: (mode: 'stamp' | 'fill' | 'remove') => void;
  clearMap: () => void;
  currentMapId: number;
  currentMapName: string;
  onConnectionsChange: (connections: MapConnection[]) => void;
  existingConnections?: MapConnection[];
  layers: Layer[];
  setLayers: (layers: Layer[]) => void;
  activeLayerId: number;
  setActiveLayerId: (id: number) => void;
  onSave: () => void;
  hasUnsavedChanges: boolean;
  isSaving: boolean;

}

const MapEditorToolbar = ({
  activeView,
  setActiveView,
  paintMode,
  selectedTile,
  tileSize,
  historyIndex,
  historyLength,
  undo,
  redo,
  setPaintMode,
  clearMap,
  currentMapId,
  currentMapName,
  onConnectionsChange,
  existingConnections,
  layers,
  setLayers,
  activeLayerId,
  setActiveLayerId,
  onSave,
  hasUnsavedChanges,
  isSaving,

}: MapEditorToolbarProps) => {
  const [editingLayerId, setEditingLayerId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const layersPerPage = 3; // Show 3 layers at a time
  const totalPages = Math.ceil(layers.length / layersPerPage);
  const startIndex = currentPage * layersPerPage;
  const endIndex = startIndex + layersPerPage;
  const visibleLayers = layers.slice(startIndex, endIndex);



  const exportMapImage = async () => {
    try {
      // Calculate map dimensions from the layers
      let maxX = 0;
      let maxY = 0;
      
      layers.forEach(layer => {
        if (layer.visible) {
          layer.tiles.forEach(tile => {
            maxX = Math.max(maxX, tile.x + 1);
            maxY = Math.max(maxY, tile.y + 1);
          });
        }
      });
      
      // Use minimum dimensions of 20x20 or actual tile bounds
      const mapWidth = Math.max(20, maxX);
      const mapHeight = Math.max(20, maxY);
      
      console.log(`Exporting map with dimensions: ${mapWidth}x${mapHeight}, tiles: ${layers.reduce((sum, layer) => sum + layer.tiles.length, 0)}`);
      
      // Debug: Log some tile data to see what's being sent
      layers.forEach((layer, layerIndex) => {
        if (layer.visible && layer.tiles.length > 0) {
          console.log(`Layer ${layerIndex} (${layer.name}): ${layer.tiles.length} tiles`);
          layer.tiles.slice(0, 3).forEach((tile, tileIndex) => {
            console.log(`  Tile ${tileIndex} at (${tile.x}, ${tile.y}): tileId length = ${tile.tileId.length}, starts with data:image/ = ${tile.tileId.startsWith('data:image/')}`);
          });
        }
      });
      
      // Create render request for export
      const renderRequest = new mapeditor.RenderRequest({
        width: mapWidth,
        height: mapHeight,
        tileSize: tileSize,
        layers: layers.map(layer => new mapeditor.Layer({
          id: layer.id,
          name: layer.name,
          visible: layer.visible,
          locked: layer.locked,
          tiles: layer.tiles.map(tile => new mapeditor.Tile({
            x: tile.x,
            y: tile.y,
            tileId: tile.tileId
          }))
        })),
        showCheckerboard: false // Don't show checkerboard for export
      });

      // Start rendering and wait for completion
      const result = await RenderMap(renderRequest);
      
      if (result.success) {
        // Wait for the rendering to complete by listening for the completion event
        const imageData = await new Promise<string>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Export timeout - rendering took too long'));
          }, 30000); // 30 second timeout
          
          const unsubscribe = EventsOn("map-render-complete", (data: any) => {
            clearTimeout(timeout);
            unsubscribe();
            if (data.success && data.imageData) {
              resolve(data.imageData);
            } else {
              reject(new Error('Rendering failed'));
            }
          });
          
          const unsubscribeError = EventsOn("map-render-error", (data: any) => {
            clearTimeout(timeout);
            unsubscribe();
            unsubscribeError();
            reject(new Error(data.message || 'Rendering failed'));
          });
        });
        
        // Create a download link for the image
        const link = document.createElement('a');
        link.href = `data:image/png;base64,${imageData}`;
        link.download = `${currentMapName || 'map'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('Map exported successfully');
      } else {
        console.error('Failed to start map export:', result.message);
      }
    } catch (error) {
      console.error('Error exporting map image:', error);
    }
  };

  const toggleLayerVisibility = (layerId: number) => {
    setLayers(layers.map(layer => 
      layer.id === layerId 
        ? { ...layer, visible: !layer.visible }
        : layer
    ));
  };

  const toggleLayerLock = (layerId: number) => {
    setLayers(layers.map(layer => 
      layer.id === layerId 
        ? { ...layer, locked: !layer.locked }
        : layer
    ));
  };

  const addNewLayer = () => {
    const newLayer: Layer = {
      id: Math.max(...layers.map(l => l.id)) + 1,
      name: `Layer ${layers.length + 1}`,
      visible: true,
      locked: false,
      tiles: []
    };
    setLayers([...layers, newLayer]);
    setActiveLayerId(newLayer.id);
  };

  const deleteLayer = (layerId: number) => {
    if (layers.length > 1) {
      setLayers(layers.filter(layer => layer.id !== layerId));
      if (activeLayerId === layerId) {
        const remainingLayers = layers.filter(layer => layer.id !== layerId);
        setActiveLayerId(remainingLayers[0].id);
      }
    }
  };

  // Rename logic
  const handleNameDoubleClick = (layer: Layer) => {
    setEditingLayerId(layer.id);
    setEditName(layer.name);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditName(e.target.value);
  };

  const finishEdit = (layer: Layer) => {
    if (editName.trim() && editName !== layer.name) {
      setLayers(layers.map(l => l.id === layer.id ? { ...l, name: editName.trim() } : l));
    }
    setEditingLayerId(null);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, layer: Layer) => {
    if (e.key === "Enter") {
      finishEdit(layer);
    } else if (e.key === "Escape") {
      setEditingLayerId(null);
    }
  };
  const renderViewTabs = () => (
    <div className="flex space-x-2">
      <Button
        variant={activeView === "map" ? "default" : "ghost"}
        onClick={() => setActiveView("map")}
      >
        <Map className="h-4 w-4 mr-2" />
        Map
      </Button>
      <Button
        variant={activeView === "encounters" ? "default" : "ghost"}
        onClick={() => setActiveView("encounters")}
      >
        <Zap className="h-4 w-4 mr-2" />
        Encounters
      </Button>
      <Button
        variant={activeView === "settings" ? "default" : "ghost"}
        onClick={() => setActiveView("settings")}
      >
        <Settings className="h-4 w-4 mr-2" />
        Settings
      </Button>
    </div>
  );

  const renderLayers = () => (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium text-slate-300 mr-2">Layers:</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={addNewLayer}
          className="h-6 w-6 p-0"
          title="Add New Layer"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="flex items-center gap-1">
        {visibleLayers.map((layer) => (
          <div
            key={layer.id}
            className={`flex items-center gap-1 p-1 rounded border transition-colors cursor-pointer ${
              layer.id === activeLayerId 
                ? 'bg-yellow-900/50 border-yellow-500/50' 
                : 'bg-slate-700 border-slate-600 hover:bg-slate-600'
            }`}
            onClick={() => setActiveLayerId(layer.id)}
          >
            <button
              onClick={e => { e.stopPropagation(); toggleLayerVisibility(layer.id); }}
              className="text-slate-300 hover:text-white"
              title={layer.visible ? "Hide Layer" : "Show Layer"}
            >
              {layer.visible ? (
                <Eye className="h-3 w-3" />
              ) : (
                <EyeOff className="h-3 w-3" />
              )}
            </button>
            <button
              onClick={e => { e.stopPropagation(); toggleLayerLock(layer.id); }}
              className="text-slate-300 hover:text-white"
              title={layer.locked ? "Unlock Layer" : "Lock Layer"}
            >
              {layer.locked ? (
                <Lock className="h-3 w-3" />
              ) : (
                <LockOpen className="h-3 w-3" />
              )}
            </button>
            {editingLayerId === layer.id ? (
              <input
                ref={inputRef}
                value={editName}
                onChange={handleNameChange}
                onBlur={() => finishEdit(layer)}
                onKeyDown={e => handleNameKeyDown(e, layer)}
                className="text-xs px-1 py-0.5 rounded bg-slate-600 text-yellow-400 border border-yellow-400 outline-none w-16"
              />
            ) : (
              <span
                className={`text-xs font-medium select-none ${
                  layer.id === activeLayerId 
                    ? 'text-yellow-300' 
                    : 'text-slate-200'
                }`}
                onDoubleClick={e => { e.stopPropagation(); handleNameDoubleClick(layer); }}
              >
                {layer.name}
              </span>
            )}
            <button
              onClick={e => { e.stopPropagation(); deleteLayer(layer.id); }}
              className="text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Delete Layer"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="h-6 w-6 p-0"
            title="Previous Page"
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <span className="text-xs text-slate-400 px-1">
            {currentPage + 1} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage === totalPages - 1}
            className="h-6 w-6 p-0"
            title="Next Page"
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-4 border-b border-slate-800">
      <div className="flex items-center justify-between mb-4">
        {renderViewTabs()}
      </div>
      {activeView === "map" && (
        <>
          <div className="mb-4">
            {renderLayers()}
          </div>
          <MapToolbar
            paintMode={paintMode}
            selectedTile={selectedTile}
            tileSize={tileSize}
            historyIndex={historyIndex}
            historyLength={historyLength}
            undo={undo}
            redo={redo}
            setPaintMode={setPaintMode}
            clearMap={clearMap}
            onSave={onSave}
            onConnectMap={() => setConnectDialogOpen(true)}
            hasUnsavedChanges={hasUnsavedChanges}
            isSaving={isSaving}

            onExportImage={exportMapImage}
          />
          {/* <MapConnectionDialog
            currentMapId={currentMapId}
            currentMapName={currentMapName}
            onConnectionsChange={onConnectionsChange}
            existingConnections={existingConnections}
            open={connectDialogOpen}
            onOpenChange={setConnectDialogOpen}
          /> */}
        </>
      )}
    </div>
  );
};

export default MapEditorToolbar; 