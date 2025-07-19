import { useRef, useState, useCallback, useEffect } from "react"
import { StampTile, ClearTileCache } from "../../../wailsjs/go/mapeditor/MapEditorApp"
import { EventsOn } from "../../../wailsjs/runtime/runtime"
import { mapeditor } from "../../../wailsjs/go/models"
import { MapViewProps } from "../types";

// Spatial index for fast tile lookups
class TileSpatialIndex {
    private tiles: Map<string, any> = new Map();
    
    private getKey(x: number, y: number): string {
        return `${x},${y}`;
    }
    
    setTile(x: number, y: number, tile: any): void {
        this.tiles.set(this.getKey(x, y), tile);
    }
    
    getTile(x: number, y: number): any | undefined {
        return this.tiles.get(this.getKey(x, y));
    }
    
    removeTile(x: number, y: number): void {
        this.tiles.delete(this.getKey(x, y));
    }
    
    clear(): void {
        this.tiles.clear();
    }
    
    getAllTiles(): any[] {
        return Array.from(this.tiles.values());
    }
}

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
}: MapViewProps & { onInitialRenderReady?: () => void; isMapAlreadyRendered?: boolean }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [history, setHistory] = useState<Array<{ layers: any[] }>>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [isDrawing, setIsDrawing] = useState(false);
    const [lastPainted, setLastPainted] = useState<{ x: number; y: number } | null>(null);
    
    // Debounced render function
    const renderTimeoutRef = useRef<NodeJS.Timeout | null>(null);


    // Debounced render function for updates after changes
    const debouncedRender = useCallback(() => {
        if (renderTimeoutRef.current) {
            clearTimeout(renderTimeoutRef.current);
        }
        renderTimeoutRef.current = setTimeout(() => {
            // For updates after changes, we can use the existing renderAffectedArea function
            // or trigger a new backend render if needed
            console.log("Debounced render triggered - backend should handle this");
        }, 8); // Reduced delay for better responsiveness
    }, []);

    const addToHistory = useCallback((newLayers: any[]) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({ layers: newLayers });
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }, [history, historyIndex]);

    // Render only the affected area for better performance
    const renderAffectedArea = useCallback(async (x: number, y: number, regionW: number, regionH: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

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

        // Draw grid lines in the affected area
        ctx.strokeStyle = 'rgba(51,65,85,0.3)';
        ctx.lineWidth = 1;
        
        // Vertical lines
        for (let gridX = Math.floor(startX / tileSize); gridX <= Math.floor(endX / tileSize); gridX++) {
            const lineX = gridX * tileSize;
            ctx.beginPath();
            ctx.moveTo(lineX, startY);
            ctx.lineTo(lineX, endY);
            ctx.stroke();
        }
        
        // Horizontal lines
        for (let gridY = Math.floor(startY / tileSize); gridY <= Math.floor(endY / tileSize); gridY++) {
            const lineY = gridY * tileSize;
            ctx.beginPath();
            ctx.moveTo(startX, lineY);
            ctx.lineTo(endX, lineY);
            ctx.stroke();
        }

        // Draw only the tiles in the affected area
        for (const layer of layers) {
            if (!layer.visible) continue;

            for (const tile of layer.tiles) {
                const tileX = tile.x * tileSize;
                const tileY = tile.y * tileSize;
                
                // Check if this tile is in the affected area
                if (tileX >= startX && tileX < endX && tileY >= startY && tileY < endY) {
                    try {
                        // Load and draw the tile image
                        const img = new Image();
                        img.onload = () => {
                            ctx.drawImage(img, tileX, tileY, tileSize, tileSize);
                        };
                        
                        // Handle data URL format
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
        }
    }, [layers, tileSize, width, height]);

    // Optimized tile placement with frontend rendering for immediate feedback
    const placeStamp = useCallback((x: number, y: number) => {
        if (!selectedTile || x < 0 || x >= width || y < 0 || y >= height) return;

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

        // Update state immediately for responsive UI
        setLayers(newLayers);
        addToHistory(newLayers);
        
        // Use frontend rendering for immediate feedback
        renderAffectedArea(x, y, regionW, regionH);
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
        const newLayers = layers.map((layer) => {
            if (layer.id !== activeLayerId) return layer;
            
            return {
                ...layer,
                tiles: layer.tiles.filter((t) => t.x !== x || t.y !== y),
            };
        });
        setLayers(newLayers);
        addToHistory(newLayers);
        
        // Use frontend rendering for immediate feedback
        renderAffectedArea(x, y, 1, 1);
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