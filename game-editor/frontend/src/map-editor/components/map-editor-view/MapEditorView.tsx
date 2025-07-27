import { useCallback, useEffect, useState, useRef } from "react";
import { Events } from "@wailsio/runtime";
import { SelectedTile } from "../TilePalette";
import MapEditorHeader from "./MapEditorHeader";
import MapEditorSidebar from "./MapEditorSidebar";
import MapEditorToolbar from "./MapEditorToolbar";
import MapEditorMain from "./MapEditorMain";
import LoadingOverlay from "./components/LoadingOverlay";
import SaveNotifications from "./components/SaveNotifications";
import { useMapData } from "./hooks/useMapData";
import { useLayers } from "./hooks/useLayers";
import { useLoadingState } from "./hooks/useLoadingState";
import { useSaveState } from "./hooks/useSaveState";
import { useTilePreloading } from "./hooks/useTilePreloading";

type ViewMode = "map" | "encounters" | "settings";

interface MapEditorViewProps {
  map: any; // models.Map from Go backend
  onMapChange: (map: any) => void; // models.Map from Go backend
  onBack: () => void;
}

const MapEditorView = ({ map, onMapChange, onBack }: MapEditorViewProps) => {
  // Custom hooks
  const { isSaving, showSavedMessage, hasUnsavedChanges, handleSave, markUnsavedChanges, clearUnsavedChanges } = useSaveState();
  const { mapData, setMapData, loadMapData, handleMapChange, handleEncountersChange, handleSettingsChange } = useMapData(map, markUnsavedChanges);
  const { layers, setLayers, history, historyIndex, logLayersChange, addToHistory, handleLayerChange, undo, redo, clearMap } = useLayers();
  const { 
    isLoading, 
    isMapReady, 
    loadingProgress, 
    renderProgress, 
    isRendering, 
    resetLoadingState, 
    setMapReady, 
    handleInitialRenderReady, 
    updateLoadingProgress, 
    updateRenderProgress, 
    setRenderComplete, 
    setRenderError 
  } = useLoadingState();

  // State to store the rendered image data
  const [renderedImageData, setRenderedImageData] = useState<string | null>(null);
  const { preloadTileImages } = useTilePreloading();
  


  // Local state
  const [activeView, setActiveView] = useState<ViewMode>("map");
  const [selectedTile, setSelectedTile] = useState<SelectedTile | null>(null);
  const [selectedAutoTile, setSelectedAutoTile] = useState<{ id: string; name: string; image: string } | null>(null);
  const [activeLayerId, setActiveLayerId] = useState<number>(1);
  const [paintMode, setPaintMode] = useState<'stamp' | 'fill' | 'remove'>('stamp');
  const [mapConnections, setMapConnections] = useState<Array<{
    direction: "up" | "down" | "left" | "right";
    mapId: number;
    mapName: string;
  }>>([]);

  // Debug effect to track layers state changes
  useEffect(() => {
    logLayersChange();
  }, [layers, logLayersChange]);

  // Add event listeners for render progress - only active during initial loading
  const eventListenersSetUp = useRef(false);
  
  useEffect(() => {
    // Only set up event listeners if we're in the initial loading phase
    if (!isLoading || eventListenersSetUp.current) {
      console.log("Event listeners not needed or already set up, skipping...");
      return;
    }
    
    console.log("Setting up event listeners in MapEditorView for initial loading...");
    eventListenersSetUp.current = true;
    
    const unsubscribeProgress = Events.On("map-render-progress", (ev) => {
      console.log("Received map render progress event:", ev);
      try {
        const progress = JSON.parse(ev.data);
        console.log("Parsed render progress:", progress);
        updateRenderProgress({
          current: progress.current,
          total: progress.total,
          message: progress.message
        });
      } catch (error) {
        console.error("Error parsing render progress data:", error);
      }
    });

    const unsubscribeComplete = Events.On("map-render-complete", (ev) => {
      console.log("Map rendering completed in MapEditorView:", ev);
      console.log("Image data length:", ev.data.imageData ? ev.data.imageData.length : 0);
      
      // Store the rendered image data
      if (ev.data.imageData) {
        console.log("Storing rendered image data");
        setRenderedImageData(ev.data.imageData);
      }
      
      console.log("Calling setRenderComplete()");
      setRenderComplete();
    });

    const unsubscribeError = Events.On("map-render-error", (ev) => {
      console.error("Map rendering error in MapEditorView:", ev);
      console.error("Error details:", ev.data.error, ev.data.message);
      setRenderError();
    });

    console.log("Event listeners set up successfully in MapEditorView");

    return () => {
      console.log("Cleaning up event listeners in MapEditorView");
      eventListenersSetUp.current = false;
      unsubscribeProgress();
      unsubscribeComplete();
      unsubscribeError();
    };
  }, [isLoading, updateRenderProgress, setRenderComplete, setRenderError]); // Only active during loading

  // Add a timeout to ensure handleInitialRenderReady is called
  useEffect(() => {
    if (isMapReady) {
      console.log("Map is ready, setting timeout for initial render");
      const renderTimeout = setTimeout(() => {
        console.warn("Initial render timeout reached, forcing completion");
        handleInitialRenderReady();
      }, 10000); // 10 seconds timeout for initial render
      
      return () => clearTimeout(renderTimeout);
    }
  }, [isMapReady, handleInitialRenderReady]);

  // Load map data from JSON file
  const mapLoadingRef = useRef<number | null>(null);
  
  useEffect(() => {
    // Prevent multiple loads for the same map
    if (mapLoadingRef.current === map.ID) {
      console.log("Map already loading, skipping...");
      return;
    }
    
    mapLoadingRef.current = map.ID;
    console.log("Starting to load map ID:", map.ID);
    
    const loadMapDataAsync = async () => {
      console.log("=== LOADING MAP DATA ===");
      console.log("Loading map data for map ID:", map.ID);
      console.log("Map name:", map.Name);
      
      // Always show loading screen when a new map is selected
      console.log("Setting loading states...");
      resetLoadingState();
      updateLoadingProgress({ current: 0, total: 0, message: `Loading ${map.Name}...` });
      
      // Add a minimum delay to ensure loading screen is visible
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Add a safety timeout to prevent infinite loading
      const safetyTimeout = setTimeout(() => {
        console.warn("Safety timeout reached, forcing loading to complete");
        // Force loading to complete
      }, 60000); // 60 seconds timeout
      
      try {
        const loadedData = await loadMapData();
        
        if (loadedData && loadedData.layers) {
          console.log("Loaded layers:", loadedData.layers);
          setLayers(loadedData.layers);
          
          // Set the active layer based on CurrentSelectedLayer property
          const currentLayerName = loadedData.currentLayerName;
          
          if (currentLayerName && currentLayerName !== "") {
            // Check if the specified layer exists by name
            const layerExists = loadedData.layers.some(layer => layer.name === currentLayerName);
            if (layerExists) {
              // Find the layer by name and set its ID as active
              const targetLayer = loadedData.layers.find(layer => layer.name === currentLayerName);
              setActiveLayerId(targetLayer?.id || 1);
            } else {
              // If the specified layer doesn't exist, default to the first layer
              setActiveLayerId(loadedData.layers[0]?.id || 1);
            }
          } else {
            // Default to the first layer if CurrentSelectedLayer is null/empty
            setActiveLayerId(loadedData.layers[0]?.id || 1);
          }
          
          // Update history with loaded layers (only if there are actual tiles)
          if (loadedData.layers.some(layer => layer.tiles.length > 0)) {
            addToHistory(loadedData.layers);
          }
          
          // Preload tile images (which now handles both preloading and rendering)
          await preloadTileImages(loadedData.layers, updateLoadingProgress, setMapReady, mapData.width, mapData.height, mapData.tileSize);
          
          // Start map rendering during loading screen
          console.log("Starting map rendering during loading screen");
          // Add a delay to ensure loading screen is visible
          await new Promise(resolve => setTimeout(resolve, 500));
          setMapReady();
        } else {
          // Set default layers if no layers found in JSON
          const defaultLayers = [
            {
              id: 1,
              name: "Base Layer",
              visible: true,
              locked: false,
              tiles: [],
            },
          ];
          setLayers(defaultLayers);
          // Don't add empty default layers to history for brand new maps
          
          // Preload tile images (which now handles both preloading and rendering)
          await preloadTileImages(defaultLayers, updateLoadingProgress, setMapReady, mapData.width, mapData.height, mapData.tileSize);
          
          // Start map rendering during loading screen
          console.log("Starting map rendering during loading screen");
          // Add a delay to ensure loading screen is visible
          await new Promise(resolve => setTimeout(resolve, 500));
          setMapReady();
        }
      } catch (error) {
        console.error("Error loading map data:", error);
        // Set default layers if loading failed
        const defaultLayers = [
          {
            id: 1,
            name: "Base Layer",
            visible: true,
            locked: false,
            tiles: [],
          },
        ];
        setLayers(defaultLayers);
        // Don't add empty default layers to history for brand new maps
        
        // Show error in loading progress
        updateLoadingProgress({ current: 0, total: 0, message: `Error loading map: ${error}` });
        
        // Preload tile images (which now handles both preloading and rendering)
        await preloadTileImages(defaultLayers, updateLoadingProgress, setMapReady, mapData.width, mapData.height, mapData.tileSize);
        
        // Start map rendering during loading screen
        console.log("Starting map rendering during loading screen");
        // Add a delay to ensure loading screen is visible
        await new Promise(resolve => setTimeout(resolve, 500));
        setMapReady();
      } finally {
        // Clear safety timeout
        clearTimeout(safetyTimeout);
        // Reset the loading ref
        mapLoadingRef.current = null;
      }
    };

    loadMapDataAsync();
  }, [map.ID, loadMapData, updateLoadingProgress, resetLoadingState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Reset save state on unmount
      clearUnsavedChanges();
    };
  }, [clearUnsavedChanges]);

  // Wrapper functions for save operations
  const handleSaveWrapper = useCallback(() => {
    handleSave(map, mapData, layers, activeLayerId);
  }, [handleSave, map, mapData, layers, activeLayerId]);

  const handleEncountersChangeWrapper = useCallback((type: string, encounters: any[]) => {
    handleEncountersChange(type, encounters, onMapChange);
  }, [handleEncountersChange, onMapChange]);

  const handleSettingsChangeWrapper = useCallback((settings: {
    name: string;
    width: number;
    height: number;
    tileSize: number;
    type: string;
    music: string;
  }) => {
    handleSettingsChange(settings, onMapChange);
  }, [handleSettingsChange, onMapChange]);

  const handleLayerChangeWrapper = useCallback((newLayers: typeof layers) => {
    handleLayerChange(newLayers);
    markUnsavedChanges();
  }, [handleLayerChange, markUnsavedChanges]);

  const clearMapWrapper = useCallback(() => {
    clearMap();
    markUnsavedChanges();
  }, [clearMap, markUnsavedChanges]);

  return (
    <div className="min-h-screen min-w-screen flex flex-col bg-slate-950 text-white relative">
      <MapEditorHeader
        mapName={mapData.name}
        onBack={onBack}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      {/* Always render the map editor interface, but overlay loading screen when needed */}
      <div className="flex-1 flex relative" style={{ minWidth: 0 }}>
        <MapEditorSidebar
          selectedTile={selectedTile}
          setSelectedTile={setSelectedTile}
          tilesetPath={mapData.tileset}
          tileSize={mapData.tileSize}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <MapEditorToolbar
            activeView={activeView}
            setActiveView={setActiveView}
            paintMode={paintMode}
            selectedTile={selectedTile}
            tileSize={mapData.tileSize}
            historyIndex={historyIndex}
            historyLength={history.length}
            undo={undo}
            redo={redo}
            setPaintMode={setPaintMode}
            clearMap={clearMapWrapper}
            currentMapId={parseInt(mapData.id)}
            currentMapName={mapData.name}
            onConnectionsChange={setMapConnections}
            existingConnections={mapConnections}
            layers={layers}
            setLayers={handleLayerChangeWrapper}
            activeLayerId={activeLayerId}
            setActiveLayerId={setActiveLayerId}
            onSave={handleSaveWrapper}
            hasUnsavedChanges={hasUnsavedChanges}
            isSaving={isSaving}

          />

          <MapEditorMain
            activeView={activeView}
            mapData={mapData}
            layers={layers}
            selectedTile={selectedTile}
            selectedAutoTile={selectedAutoTile}
            activeLayerId={activeLayerId}
            paintMode={paintMode}
            handleLayerChange={handleLayerChangeWrapper}
            handleEncountersChange={handleEncountersChangeWrapper}
            handleSettingsChange={handleSettingsChangeWrapper}
            onInitialRenderReady={handleInitialRenderReady}
            isMapAlreadyRendered={isMapReady}
            renderedImageData={renderedImageData}

          />
        </div>

        {/* Loading overlay */}
        <LoadingOverlay
          isLoading={isLoading}
          loadingProgress={loadingProgress}
          renderProgress={renderProgress}
          isRendering={isRendering}
        />
      </div>

      {/* Save notifications */}
      <SaveNotifications
        isSaving={isSaving}
        showSavedMessage={showSavedMessage}
        hasUnsavedChanges={hasUnsavedChanges}
      />
    </div>
  );
};

export default MapEditorView; 