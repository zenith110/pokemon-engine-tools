import { useCallback } from "react";
import { RenderMap } from "../../../../../bindings/github.com/zenith110/pokemon-engine-tools/tools/map-editor/MapEditorApp";
import { Events } from "@wailsio/runtime";
import { MapLayer } from "./useLayers";
import { LoadingProgress } from "./useLoadingState";

export const useTilePreloading = () => {
  const preloadTileImages = useCallback(async (
    layersToPreload: MapLayer[],
    setLoadingProgress: (progress: LoadingProgress) => void,
    handleMapReady: () => void,
    mapWidth: number,
    mapHeight: number,
    tileSize: number,
    useBackendRendering: boolean = true
  ) => {
    console.log("Starting tile preloading...");
    const uniqueTileIds = new Set<string>();
    
    // Collect all unique tile IDs from all layers
    layersToPreload.forEach(layer => {
      layer.tiles.forEach(tile => {
        if (tile.tileId) {
          uniqueTileIds.add(tile.tileId);
        }
      });
    });
    
    const totalTiles = uniqueTileIds.size;
    console.log(`Preloading ${totalTiles} unique tiles...`);
    
    // Check if there are any tiles in the layers
    const hasTiles = layersToPreload.some(layer => layer.tiles.length > 0);
    console.log(`Map has tiles: ${hasTiles}, total unique tiles: ${totalTiles}`);
    
    // Always use backend rendering for initial map load
    const shouldUseBackendRendering = useBackendRendering;
    console.log(`Using backend rendering: ${shouldUseBackendRendering}`);
    
    if (!shouldUseBackendRendering) {
      // For subsequent operations, use frontend rendering
      console.log("Subsequent operation, using frontend rendering");
      handleMapReady();
      return;
    }
    
    // For initial map load, always use backend rendering (both with and without tiles)
    setLoadingProgress({ current: 0, total: totalTiles, message: "Starting tile preloading..." });
    
    // Track if we've already completed to prevent duplicate calls
    let isCompleted = false;
    
    const cleanup = () => {
      isCompleted = true;
    };
    
    try {
      // Start backend rendering (which now handles both preloading and rendering)
      console.log("Starting backend rendering with layers:", layersToPreload.length);
      
      // Create render request for the backend
      const renderRequest = {
        width: mapWidth,
        height: mapHeight,
        tileSize: tileSize,
        layers: layersToPreload.map(layer => ({
          id: layer.id,
          name: layer.name,
          visible: layer.visible,
          locked: layer.locked,
          tiles: layer.tiles.map(tile => ({
            x: tile.x,
            y: tile.y,
            tileId: tile.tileId
          }))
        })),
        showCheckerboard: !hasTiles // Only show checkerboard for empty maps
      };
      
      const result = await RenderMap(renderRequest);
      
      if (result.success) {
        console.log("Backend rendering started successfully");
        
        // Set up event listeners for progress updates
        const unsubscribeProgress = Events.On("map-render-progress", (ev) => {
          if (isCompleted) return;
          console.log("Received map render progress event:", ev);
          try {
            const progress = JSON.parse(ev.data);
            console.log("Parsed progress:", progress);
            setLoadingProgress({
              current: progress.current,
              total: progress.total,
              message: progress.message
            });
          } catch (error) {
            console.error("Error parsing progress data:", error);
          }
        });
        
        const unsubscribeComplete = Events.On("map-render-complete", (ev) => {
          if (isCompleted) return;
          console.log("Map rendering completed:", ev);
          console.log("Image data length:", ev.data.imageData ? ev.data.imageData.length : 0);
          setLoadingProgress({ 
            current: totalTiles, 
            total: totalTiles, 
            message: "Map rendering completed" 
          });
          
          // Clean up event listeners
          unsubscribeProgress();
          unsubscribeComplete();
          
          // Set map ready since both preloading and rendering are complete
          console.log("Calling handleMapReady()");
          handleMapReady();
        });

        const unsubscribeError = Events.On("map-render-error", (ev) => {
          if (isCompleted) return;
          console.error("Map rendering error:", ev);
          console.error("Error details:", ev.data.error, ev.data.message);
          setLoadingProgress({ current: 0, total: 0, message: "Map rendering failed" });
          
          // Clean up event listeners
          unsubscribeProgress();
          unsubscribeComplete();
          unsubscribeError();
          
          // Set map ready on error to prevent infinite loading
          console.log("Calling handleMapReady() due to error");
          handleMapReady();
        });
        
        // Clean up interval after 30 seconds as safety
        setTimeout(() => {
          if (isCompleted) return;
          console.log("Safety timeout reached, clearing interval");
          cleanup();
          // If we haven't received completion event, force completion
          console.log("Forcing completion due to timeout");
          setLoadingProgress({ 
            current: totalTiles, 
            total: totalTiles, 
            message: "Tile preloading completed (timeout)" 
          });
          handleMapReady();
        }, 30000);
        
      } else {
        console.error("Failed to start backend rendering:", result.message);
        // Fall back to frontend preloading
        await preloadTilesFrontend(uniqueTileIds, setLoadingProgress, handleMapReady);
      }
    } catch (error) {
      console.error("Error with backend rendering:", error);
      // Fall back to frontend preloading
      await preloadTilesFrontend(uniqueTileIds, setLoadingProgress, handleMapReady);
    }
  }, [RenderMap]);

  // Fallback frontend preloading function
  const preloadTilesFrontend = useCallback(async (
    uniqueTileIds: Set<string>,
    setLoadingProgress: (progress: LoadingProgress) => void,
    handleMapReady: () => void
  ) => {
    const totalTiles = uniqueTileIds.size;
    let loadedCount = 0;
    
    // Preload each unique tile image with progress tracking
    const preloadPromises = Array.from(uniqueTileIds).map(async (tileId) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          loadedCount++;
          setLoadingProgress({ 
            current: loadedCount, 
            total: totalTiles, 
            message: `Preloading tiles... (${loadedCount}/${totalTiles})` 
          });
          console.log(`Preloaded tile: ${tileId.substring(0, 50)}...`);
          resolve();
        };
        img.onerror = () => {
          loadedCount++;
          setLoadingProgress({ 
            current: loadedCount, 
            total: totalTiles, 
            message: `Preloading tiles... (${loadedCount}/${totalTiles})` 
          });
          console.warn(`Failed to preload tile: ${tileId.substring(0, 50)}...`);
          resolve(); // Continue even if some tiles fail to load
        };
        
        // Handle data URL format
        if (tileId.startsWith('data:image/')) {
          img.src = tileId;
        } else {
          img.src = `data:image/png;base64,${tileId}`;
        }
      });
    });
    
    try {
      await Promise.all(preloadPromises);
      setLoadingProgress({ current: totalTiles, total: totalTiles, message: "Tile preloading completed, rendering map..." });
      console.log("Tile preloading completed successfully");
      
      // Don't set map ready yet - wait for rendering to complete
      // The backend should trigger map-render-complete event
    } catch (error) {
      console.error("Error during tile preloading:", error);
      setLoadingProgress({ current: 0, total: 0, message: "Error preloading tiles" });
      // Set map ready on error to prevent infinite loading
      handleMapReady();
    }
  }, []);

  return {
    preloadTileImages,
    preloadTilesFrontend,
  };
}; 