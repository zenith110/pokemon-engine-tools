import { useCallback } from "react";
import { PreloadTilesWithProgress, PreloadTilesOnly } from "../../../../../wailsjs/go/mapeditor/MapEditorApp";
import { EventsOn } from "../../../../../wailsjs/runtime/runtime";
import { mapeditor } from "../../../../../wailsjs/go/models";
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
      // Start backend preloading
      const tileIdsArray = Array.from(uniqueTileIds);
      console.log("Starting backend preloading with tile IDs:", tileIdsArray.length);
      
      // Create render request for the second argument
      const renderRequest = new mapeditor.RenderRequest({
        width: mapWidth,
        height: mapHeight,
        tileSize: tileSize,
        layers: layersToPreload.map(layer => new mapeditor.Layer({
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

        showCheckerboard: !hasTiles // Only show checkerboard for empty maps
      });
      
      const result = await PreloadTilesWithProgress(tileIdsArray, renderRequest);
      
      if (result.success) {
        console.log("Backend preloading started successfully");
        
        // Set up event listeners for progress updates
        const unsubscribeProgress = EventsOn("tile-preload-progress", (data: string) => {
          if (isCompleted) return;
          console.log("Received tile preload progress event:", data);
          try {
            const progress = JSON.parse(data);
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
        
        const unsubscribeComplete = EventsOn("tile-preload-complete", (data: any) => {
          if (isCompleted) return;
          console.log("Received tile preload completion event:", data);
          setLoadingProgress({ 
            current: data.total, 
            total: data.total, 
            message: "Tile preloading completed, starting map rendering..." 
          });
          
          // Clean up event listeners
          unsubscribeProgress();
          unsubscribeComplete();
          
          // The backend now handles both preloading and rendering, so we don't need to trigger rendering separately
          // Just wait for the map-render-complete event
        });

        // Listen for map rendering completion (now part of the same backend call)
        const unsubscribeRenderComplete = EventsOn("map-render-complete", (data: any) => {
          if (isCompleted) return;
          console.log("Map rendering completed:", data);
          console.log("Image data length:", data.imageData ? data.imageData.length : 0);
          setLoadingProgress({ 
            current: totalTiles, 
            total: totalTiles, 
            message: "Map rendering completed" 
          });
          
          // Clean up everything
          cleanup();
          unsubscribeRenderComplete();
          unsubscribeRenderError();
          
          // Set map ready since both preloading and rendering are complete
          console.log("Calling handleMapReady()");
          handleMapReady();
        });

        const unsubscribeRenderError = EventsOn("map-render-error", (data: any) => {
          if (isCompleted) return;
          console.error("Map rendering error:", data);
          console.error("Error details:", data.error, data.message);
          setLoadingProgress({ current: 0, total: 0, message: "Map rendering failed" });
          
          // Clean up everything
          cleanup();
          unsubscribeRenderComplete();
          unsubscribeRenderError();
          
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
        console.error("Failed to start backend preloading:", result.message);
        // Fall back to frontend preloading
        await preloadTilesFrontend(uniqueTileIds, setLoadingProgress, handleMapReady);
      }
    } catch (error) {
      console.error("Error with backend preloading:", error);
      // Fall back to frontend preloading
      await preloadTilesFrontend(uniqueTileIds, setLoadingProgress, handleMapReady);
    }
  }, []); // Empty dependency array is fine since PreloadTilesWithProgress and EventsOn are imported functions

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