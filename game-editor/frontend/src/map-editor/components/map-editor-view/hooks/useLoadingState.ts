import { useState, useCallback } from "react";

export interface LoadingProgress {
  current: number;
  total: number;
  message: string;
}

export interface RenderProgress {
  current: number;
  total: number;
  message: string;
}

export const useLoadingState = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<LoadingProgress>({ 
    current: 0, 
    total: 0, 
    message: "Loading map..." 
  });
  const [renderProgress, setRenderProgress] = useState<RenderProgress>({ 
    current: 0, 
    total: 0, 
    message: "" 
  });
  const [isRendering, setIsRendering] = useState(false);

  const resetLoadingState = useCallback(() => {
    console.log("Setting loading states...");
    setIsLoading(true);
    setIsMapReady(false);
    setLoadingProgress({ current: 0, total: 0, message: "Loading map..." });
    setRenderProgress({ current: 0, total: 0, message: "" });
    setIsRendering(false);
  }, []);

  const setMapReady = useCallback(() => {
    console.log("Map is ready for rendering");
    setIsMapReady(true);
  }, []);

  const handleInitialRenderReady = useCallback(() => {
    console.log("Initial map render completed");
    setLoadingProgress({ current: 0, total: 0, message: "Map ready!" });
    // Small delay to show "Map ready!" message before hiding loading screen
    setTimeout(() => {
      console.log("Hiding loading screen");
      setIsLoading(false);
    }, 1000);
  }, []);

  const updateLoadingProgress = useCallback((progress: LoadingProgress) => {
    setLoadingProgress(progress);
  }, []);

  const updateRenderProgress = useCallback((progress: RenderProgress) => {
    setRenderProgress(progress);
    setIsRendering(true);
  }, []);

  const setRenderComplete = useCallback(() => {
    setRenderProgress({ current: 100, total: 100, message: "Map rendering completed" });
    setIsRendering(false);
  }, []);

  const setRenderError = useCallback(() => {
    setRenderProgress({ current: 0, total: 0, message: "Map rendering failed" });
    setIsRendering(false);
  }, []);

  return {
    isLoading,
    setIsLoading,
    isMapReady,
    setIsMapReady,
    loadingProgress,
    renderProgress,
    isRendering,
    resetLoadingState,
    setMapReady,
    handleInitialRenderReady,
    updateLoadingProgress,
    updateRenderProgress,
    setRenderComplete,
    setRenderError,
  };
}; 