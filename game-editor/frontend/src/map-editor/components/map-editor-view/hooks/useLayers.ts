import { useState, useCallback } from "react";

export interface MapLayer {
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
}

export const useLayers = () => {
  const [layers, setLayers] = useState<MapLayer[]>([]);
  const [history, setHistory] = useState<MapLayer[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Debug effect to track layers state changes
  const logLayersChange = useCallback(() => {
    console.log("Layers state changed to:", layers.length, "layers");
    console.log("Layer details in state:", layers.map(layer => ({
      id: layer.id,
      name: layer.name,
      visible: layer.visible,
      tileCount: layer.tiles.length
    })));
  }, [layers]);

  const addToHistory = useCallback((newLayers: MapLayer[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newLayers);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const handleLayerChange = useCallback((newLayers: MapLayer[]) => {
    console.log("handleLayerChange called with layers:", newLayers.length);
    console.log("Layer details in handleLayerChange:", newLayers.map(layer => ({
      id: layer.id,
      name: layer.name,
      visible: layer.visible,
      tileCount: layer.tiles.length
    })));
    setLayers(newLayers);
    addToHistory(newLayers);
  }, [addToHistory]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setLayers(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setLayers(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  const clearMap = useCallback(() => {
    // Create a single base layer with no tiles
    const baseLayer: MapLayer = {
      id: 1,
      name: "Base Layer",
      visible: true,
      locked: false,
      tiles: [],
    };
    
    // Update layers to only contain the base layer
    setLayers([baseLayer]);
    
    // Update history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([baseLayer]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  return {
    layers,
    setLayers,
    history,
    historyIndex,
    logLayersChange,
    addToHistory,
    handleLayerChange,
    undo,
    redo,
    clearMap,
  };
}; 