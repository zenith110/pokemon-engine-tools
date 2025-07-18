import { useRef, useState, useCallback, useEffect } from "react"
import { RenderMap, StampTile, ClearTileCache } from "../../../wailsjs/go/mapeditor/MapEditorApp"
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
}: MapViewProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [history, setHistory] = useState<Array<{ layers: any[] }>>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [isDrawing, setIsDrawing] = useState(false);
    const [lastPainted, setLastPainted] = useState<{ x: number; y: number } | null>(null);
    
    // Debounced render function
    const renderTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Optimized render function using Go backend
    const renderMap = useCallback(async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        try {
            // Prepare render request for Go backend
            const renderRequest = new mapeditor.RenderRequest({
                width: width,
                height: height,
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
                showGrid: true,
                showCheckerboard: true
            });

            // Call Go backend for rendering
            const response = await RenderMap(renderRequest);
            
            if (response.success && response.imageData) {
                // Create image from base64 data
                const img = new Image();
                img.onload = () => {
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        // Clear canvas and draw the rendered image
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, 0, 0);
                    }
                };
                img.src = `data:image/png;base64,${response.imageData}`;
            } else {
                console.error('Rendering failed:', response.error);
            }
        } catch (error) {
            console.error('Error rendering map:', error);
        }
    }, [layers, tileSize, width, height]);

    // Debounced render function
    const debouncedRender = useCallback(() => {
        if (renderTimeoutRef.current) {
            clearTimeout(renderTimeoutRef.current);
        }
        renderTimeoutRef.current = setTimeout(() => {
            renderMap();
        }, 8); // Reduced delay for better responsiveness
    }, [renderMap]);

    // Optimized tile placement using Go backend
    const placeStamp = useCallback((x: number, y: number) => {
        if (!selectedTile || x < 0 || x >= width || y < 0 || y >= height) return;

        // Prepare stamp request for Go backend
        const stampRequest = new mapeditor.StampRequest({
            selectedTile: new mapeditor.SelectedTile({
                id: selectedTile.id,
                name: selectedTile.name,
                image: selectedTile.image,
                width: selectedTile.width || 1,
                height: selectedTile.height || 1,
                subTiles: selectedTile.subTiles
            }),
            x: x,
            y: y,
            width: width,
            height: height,
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
            activeLayerId: activeLayerId
        });

        // Call Go backend for stamping
        StampTile(stampRequest).then(response => {
            if (response.success) {
                // Update layers with the response from Go backend
                const newLayers = response.layers.map(goLayer => ({
                    id: goLayer.id,
                    name: goLayer.name,
                    visible: goLayer.visible,
                    locked: goLayer.locked,
                    tiles: goLayer.tiles.map(goTile => ({
                        x: goTile.x,
                        y: goTile.y,
                        tileId: goTile.tileId
                    }))
                }));
                
                setLayers(newLayers);
                addToHistory(newLayers);
                debouncedRender();
            } else {
                console.error('Stamping failed:', response.error);
            }
        }).catch(error => {
            console.error('Error stamping tile:', error);
        });
    }, [selectedTile, width, height, layers, activeLayerId, setLayers, debouncedRender]);

    // Handle mouse events
    const getTileCoords = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: -1, y: -1 };

        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / tileSize);
        const y = Math.floor((e.clientY - rect.top) / tileSize);
        return { x, y };
    }, [tileSize]);

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
    }, [selectedTile, paintMode, getTileCoords, width, height, placeStamp]);

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
    }, [isDrawing, getTileCoords, width, height, lastPainted, paintMode, placeStamp]);

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

    const addToHistory = useCallback((newLayers: any[]) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({ layers: newLayers });
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }, [history, historyIndex]);

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
        debouncedRender();
    }, [layers, activeLayerId, setLayers, debouncedRender, addToHistory]);

    // Initialize canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = width * tileSize;
        canvas.height = height * tileSize;
        renderMap();
    }, [width, height, tileSize, renderMap]);

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