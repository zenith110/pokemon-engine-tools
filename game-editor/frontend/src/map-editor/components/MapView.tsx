import { useRef, useState, useCallback, useEffect } from "react"
import { StampTile, ClearTileCache } from "../../../wailsjs/go/mapeditor/MapEditorApp"
import { EventsOn } from "../../../wailsjs/runtime/runtime"
import { MapViewProps } from "../types";


const MapView = ({
    width,
    height,
    tileSize,
    selectedTile,
    selectedAutoTile,
    layers,
    setLayers,
    activeLayerId,
    paintMode,
    onInitialRenderReady,
    isMapAlreadyRendered = false,
    renderedImageData,
}: MapViewProps & { onInitialRenderReady?: () => void; isMapAlreadyRendered?: boolean; renderedImageData?: string | null }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [history, setHistory] = useState<Array<{ layers: any[] }>>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [isDrawing, setIsDrawing] = useState(false);
    const [lastPainted, setLastPainted] = useState<{ x: number; y: number } | null>(null);
    
    // Tile cache for immediate rendering
    const tileCache = useRef<Map<string, HTMLImageElement>>(new Map());
    
    // Debounced render function
    const renderTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    // Track if we're in a stamping operation to avoid unnecessary re-renders
    const isStampingRef = useRef(false);

    // Preload tile into cache
    const preloadTile = useCallback((tileId: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            if (tileCache.current.has(tileId)) {
                resolve(tileCache.current.get(tileId)!);
                return;
            }
            
            const img = new Image();
            img.onload = () => {
                tileCache.current.set(tileId, img);
                resolve(img);
            };
            img.onerror = (error) => {
                console.error('Tile failed to load:', error);
                reject(error);
            };
            
            // Handle data URL format
            if (tileId.startsWith('data:image/')) {
                img.src = tileId;
            } else {
                img.src = `data:image/png;base64,${tileId}`;
            }
        });
    }, []);

    // Debounced render function for updates after changes
    const debouncedRender = useCallback(() => {
        if (renderTimeoutRef.current) {
            clearTimeout(renderTimeoutRef.current);
        }
        renderTimeoutRef.current = setTimeout(() => {
            // Use frontend rendering for all updates after initial load
            console.log("Debounced render triggered - using frontend rendering");
            
            // Re-render the entire map using frontend rendering
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Clear the entire canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw checkerboard pattern
            const checkerSize = 8;
            for (let cx = 0; cx < canvas.width; cx += checkerSize) {
                for (let cy = 0; cy < canvas.height; cy += checkerSize) {
                    const isEven = ((cx / checkerSize) + (cy / checkerSize)) % 2 === 0;
                    ctx.fillStyle = isEven ? '#ffffff' : '#cccccc';
                    ctx.fillRect(cx, cy, Math.min(checkerSize, canvas.width - cx), Math.min(checkerSize, canvas.height - cy));
                }
            }



            // Draw all tiles
            for (const layer of layers) {
                if (!layer.visible) continue;

                for (const tile of layer.tiles) {
                    const tileX = tile.x * tileSize;
                    const tileY = tile.y * tileSize;
                    
                    try {
                        const img = new Image();
                        img.onload = () => {
                            ctx.drawImage(img, tileX, tileY, tileSize, tileSize);
                        };
                        
                        if (tile.tileId.startsWith('data:image/')) {
                            img.src = tile.tileId;
                        } else {
                            img.src = `data:image/png;base64,${tile.tileId}`;
                        }
                    } catch (error) {
                        console.error('Failed to load tile image:', error);
                    }
                }
            }
        }, 8); // Reduced delay for better responsiveness
    }, [layers, tileSize, width, height]);

    const addToHistory = useCallback((newLayers: any[]) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({ layers: newLayers });
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }, [history, historyIndex]);

    // Render only the affected area for better performance
    const renderAffectedArea = useCallback((x: number, y: number, regionW: number, regionH: number, layersToRender?: any[]) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Use provided layers or fall back to current layers
        const layersToUse = layersToRender || layers;

        // Clear only the affected area
        const startX = x * tileSize;
        const startY = y * tileSize;
        const endX = Math.min((x + regionW) * tileSize, canvas.width);
        const endY = Math.min((y + regionH) * tileSize, canvas.height);
        
        // Clear the affected area
        ctx.clearRect(startX, startY, endX - startX, endY - startY);

        // Draw checkerboard pattern in the affected area if needed
        const checkerSize = 8;
        for (let cx = startX; cx < endX; cx += checkerSize) {
            for (let cy = startY; cy < endY; cy += checkerSize) {
                const isEven = ((cx / checkerSize) + (cy / checkerSize)) % 2 === 0;
                ctx.fillStyle = isEven ? '#ffffff' : '#cccccc';
                ctx.fillRect(cx, cy, Math.min(checkerSize, endX - cx), Math.min(checkerSize, endY - cy));
            }
        }

        // Draw only the tiles in the affected area
        for (const layer of layersToUse) {
            if (!layer.visible) continue;

            for (const tile of layer.tiles) {
                const tileX = tile.x * tileSize;
                const tileY = tile.y * tileSize;
                
                // Check if this tile is in the affected area
                if (tileX >= startX && tileX < endX && tileY >= startY && tileY < endY) {
                    try {
                        // Check if tile is in cache first
                        const cachedImg = tileCache.current.get(tile.tileId);
                        if (cachedImg) {
                            // Draw immediately if cached
                            ctx.drawImage(cachedImg, tileX, tileY, tileSize, tileSize);
                        } else {
                            // Load and cache the tile, then draw it
                            const img = new Image();
                            img.onload = () => {
                                // Cache the image for future use
                                tileCache.current.set(tile.tileId, img);
                                // Draw the tile
                                ctx.drawImage(img, tileX, tileY, tileSize, tileSize);
                            };
                            img.onerror = (error) => {
                                console.error('Failed to load tile image:', error);
                            };
                            
                            // Handle data URL format
                            if (tile.tileId.startsWith('data:image/')) {
                                img.src = tile.tileId;
                            } else {
                                img.src = `data:image/png;base64,${tile.tileId}`;
                            }
                        }
                    } catch (error) {
                        console.error('Failed to load tile image:', error);
                    }
                }
            }
        }
    }, [tileSize, width, height]);

    // Optimized tile placement with frontend rendering for immediate feedback
    const placeStamp = useCallback((x: number, y: number) => {
        if (!selectedTile || x < 0 || x >= width || y < 0 || y >= height) return;

        // Set stamping flag to prevent full re-render
        isStampingRef.current = true;

        // Update layers locally first for immediate feedback
        const regionW = selectedTile.width || 1;
        const regionH = selectedTile.height || 1;

        const newLayers = layers.map((layer) => {
            if (layer.id !== activeLayerId) return layer;

            // Create a copy of the layer's tiles
            const existingTiles = [...layer.tiles];
            
            // Remove existing tiles in the region
            const filteredTiles = existingTiles.filter(tile => {
                const dx = tile.x - x;
                const dy = tile.y - y;
                return dx < 0 || dx >= regionW || dy < 0 || dy >= regionH;
            });

            // Add new tiles
            const newTiles = [...filteredTiles];
            for (let dx = 0; dx < regionW; dx++) {
                for (let dy = 0; dy < regionH; dy++) {
                    const tx = x + dx;
                    const ty = y + dy;

                    if (tx < 0 || tx >= width || ty < 0 || ty >= height) continue;

                    // Determine tile image
                    let tileImage = selectedTile.image;
                    if (selectedTile.subTiles && (regionW > 1 || regionH > 1)) {
                        tileImage = selectedTile.subTiles[dx][dy];
                    }

                    newTiles.push({
                        x: tx,
                        y: ty,
                        tileId: tileImage
                    });
                }
            }

            return {
                ...layer,
                tiles: newTiles,
            };
        });

        // Use frontend rendering for immediate feedback with the new layers FIRST
        renderAffectedArea(x, y, regionW, regionH, newLayers);
        
        // Then update state (this will trigger the layer change effect, but we have the flag set)
        setLayers(newLayers);
        addToHistory(newLayers);
    }, [selectedTile, width, height, layers, activeLayerId, setLayers, addToHistory, renderAffectedArea]);

    // Handle mouse events
    const getTileCoords = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: -1, y: -1 };

        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / tileSize);
        const y = Math.floor((e.clientY - rect.top) / tileSize);
        return { x, y };
    }, [tileSize]);

    const removeTile = useCallback((x: number, y: number) => {
        // Set stamping flag to prevent full re-render
        isStampingRef.current = true;
        
        const newLayers = layers.map((layer) => {
            if (layer.id !== activeLayerId) return layer;
            
            return {
                ...layer,
                tiles: layer.tiles.filter((t) => t.x !== x || t.y !== y),
            };
        });
        
        // Use frontend rendering for immediate feedback with the new layers FIRST
        renderAffectedArea(x, y, 1, 1, newLayers);
        
        // Then update state (this will trigger the layer change effect, but we have the flag set)
        setLayers(newLayers);
        addToHistory(newLayers);
    }, [layers, activeLayerId, setLayers, addToHistory, renderAffectedArea]);

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!selectedTile && paintMode !== 'remove') return;

        const { x, y } = getTileCoords(e);
        if (x < 0 || x >= width || y < 0 || y >= height) return;

        setIsDrawing(true);
        setLastPainted({ x, y });

        if (paintMode === 'stamp') {
            placeStamp(x, y);
        } else if (paintMode === 'fill') {
            fillEntireMap();
        } else if (paintMode === 'remove') {
            removeTile(x, y);
        }
    }, [selectedTile, paintMode, getTileCoords, width, height, placeStamp, removeTile]);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;

        const { x, y } = getTileCoords(e);
        if (x < 0 || x >= width || y < 0 || y >= height) return;

        if (!lastPainted || lastPainted.x !== x || lastPainted.y !== y) {
            setLastPainted({ x, y });

            if (paintMode === 'stamp') {
                placeStamp(x, y);
            } else if (paintMode === 'remove') {
                removeTile(x, y);
            }
        }
    }, [isDrawing, getTileCoords, width, height, lastPainted, paintMode, placeStamp, removeTile]);

    const handleMouseUp = useCallback(() => {
        setIsDrawing(false);
        setLastPainted(null);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsDrawing(false);
        setLastPainted(null);
    }, []);

    const fillEntireMap = useCallback(() => {
        if (!selectedTile) return;

        // For fill operations, we'll use the existing logic but call Go backend for rendering
        const regionW = selectedTile.width || 1;
        const regionH = selectedTile.height || 1;

        const newLayers = layers.map((layer) => {
            if (layer.id !== activeLayerId) return layer;

            const newTiles: any[] = [];

            // Create all tiles for the map
            for (let x = 0; x < width; x++) {
                for (let y = 0; y < height; y++) {
                    const dx = x % regionW;
                    const dy = y % regionH;
                    
                    let tileImage = selectedTile.image;
                    if (selectedTile.subTiles && (regionW > 1 || regionH > 1)) {
                        tileImage = selectedTile.subTiles[dx][dy];
                    }

                    const newTile = { x, y, tileId: tileImage };
                    newTiles.push(newTile);
                }
            }

            return {
                ...layer,
                tiles: newTiles,
            };
        });

        setLayers(newLayers);
        addToHistory(newLayers);
        debouncedRender();
    }, [selectedTile, width, height, layers, activeLayerId, setLayers, debouncedRender]);

    // Initialize canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = width * tileSize;
        canvas.height = height * tileSize;
        
        if (isMapAlreadyRendered && onInitialRenderReady) {
            console.log("MapView: Map already rendered by backend, ready to display");
            onInitialRenderReady();
        }
    }, [width, height, tileSize, isMapAlreadyRendered, onInitialRenderReady]);

    // Handle rendered image data from backend
    useEffect(() => {
        if (renderedImageData && canvasRef.current) {
            console.log("MapView: Received rendered image data, updating canvas");
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const img = new Image();
                img.onload = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                    console.log("MapView: Canvas updated with rendered image data");
                };
                img.onerror = (error) => {
                    console.error("MapView: Failed to load rendered image:", error);
                };
                img.src = `data:image/png;base64,${renderedImageData}`;
            }
        }
    }, [renderedImageData]);

    // Listen for backend rendering events
    useEffect(() => {
        if (!isMapAlreadyRendered) return; // Only listen if backend is handling rendering

        const canvas = canvasRef.current;
        if (!canvas) return;

        // Listen for render progress events
        const unsubscribeProgress = EventsOn("map-render-progress", (data: string) => {
            console.log("MapView: Received render progress:", data);
            try {
                const progress = JSON.parse(data);
                console.log(`MapView: Render progress: ${progress.current}/${progress.total} - ${progress.message}`);
                
                // If we have image data, update the canvas
                if (progress.imageData) {
                    const img = new Image();
                    img.onload = () => {
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                            ctx.drawImage(img, 0, 0);
                        }
                    };
                    img.src = `data:image/png;base64,${progress.imageData}`;
                }
            } catch (error) {
                console.error("MapView: Error parsing render progress data:", error);
            }
        });

        // Listen for render completion
        const unsubscribeComplete = EventsOn("map-render-complete", (data: any) => {
            console.log("MapView: Map rendering completed:", data);
            console.log("MapView: Received data keys:", Object.keys(data));
            console.log("MapView: imageData present:", !!data.imageData);
            console.log("MapView: imageData length:", data.imageData ? data.imageData.length : 0);
            
            // Clean up event listeners
            unsubscribeProgress();
            unsubscribeComplete();
            
            // Update canvas with final rendered image
            if (data.imageData) {
                console.log("MapView: Updating canvas with imageData");
                const img = new Image();
                img.onload = () => {
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, 0, 0);
                        console.log("MapView: Canvas updated successfully");
                        
                        // Call the callback after the image is loaded and displayed
                        if (onInitialRenderReady) {
                            onInitialRenderReady();
                        }
                    }
                };
                img.onerror = (error) => {
                    console.error("MapView: Failed to load image:", error);
                };
                img.src = `data:image/png;base64,${data.imageData}`;
            } else {
                console.warn("MapView: No imageData received in map-render-complete event");
                // If no image data, still call the callback
                if (onInitialRenderReady) {
                    onInitialRenderReady();
                }
            }
        });

        // Listen for render errors
        const unsubscribeError = EventsOn("map-render-error", (data: any) => {
            console.error("MapView: Map rendering error:", data);
            
            // Clean up event listeners
            unsubscribeProgress();
            unsubscribeComplete();
            unsubscribeError();
            
            // Call the callback even on error to prevent infinite loading
            if (onInitialRenderReady) {
                onInitialRenderReady();
            }
        });

        return () => {
            unsubscribeProgress();
            unsubscribeComplete();
            unsubscribeError();
        };
    }, [isMapAlreadyRendered, onInitialRenderReady]);

    // Preload selected tile when it changes
    useEffect(() => {
        if (selectedTile) {
            // Preload the main tile image
            if (selectedTile.image) {
                preloadTile(selectedTile.image);
            }
            // Preload sub-tiles if they exist
            if (selectedTile.subTiles) {
                for (let dx = 0; dx < selectedTile.width; dx++) {
                    for (let dy = 0; dy < selectedTile.height; dy++) {
                        if (selectedTile.subTiles[dx] && selectedTile.subTiles[dx][dy]) {
                            preloadTile(selectedTile.subTiles[dx][dy]);
                        }
                    }
                }
            }
        }
    }, [selectedTile, preloadTile]);

    // Re-render when layers change (for both frontend and backend rendering)
    useEffect(() => {
        console.log("MapView: Layers changed, triggering re-render");
        
        // Skip re-render if we're in the middle of a stamping operation
        // The stamping operations handle their own rendering via renderAffectedArea
        if (isStampingRef.current) {
            console.log("MapView: Skipping re-render during stamping operation");
            // Reset the flag after a longer delay to ensure stamping operations complete
            setTimeout(() => {
                isStampingRef.current = false;
            }, 200);
            return;
        }
        
        if (isMapAlreadyRendered) {
            // For backend rendering, trigger a frontend re-render to show immediate changes
            debouncedRender();
        } else {
            // For frontend rendering, use the normal debounced render
            debouncedRender();
        }
    }, [layers, debouncedRender, isMapAlreadyRendered]);



    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (renderTimeoutRef.current) {
                clearTimeout(renderTimeoutRef.current);
            }
        };
    }, []);

    // Clear tile cache when component unmounts
    useEffect(() => {
        return () => {
            ClearTileCache().catch(console.error);
        };
    }, []);

    const undo = useCallback(() => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setLayers(history[historyIndex - 1].layers);
        }
    }, [historyIndex, history, setLayers]);

    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            setLayers(history[historyIndex + 1].layers);
        }
    }, [historyIndex, history, setLayers]);

    return (
        <div className="relative">
            <canvas
                ref={canvasRef}
                className="border border-slate-700 cursor-crosshair"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
            />
        </div>
    )
}

export default MapView 