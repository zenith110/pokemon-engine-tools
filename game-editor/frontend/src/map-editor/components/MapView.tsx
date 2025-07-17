import { useEffect, useRef, useState } from "react";
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
}: MapViewProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [history, setHistory] = useState<Array<{ layers: any[] }>>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    
    // Tile cache for performance
    const tileCache = useRef<Map<string, HTMLImageElement>>(new Map());
    const [isDrawing, setIsDrawing] = useState(false);
    const [lastPainted, setLastPainted] = useState<{ x: number; y: number } | null>(null);

    // Load tile image into cache
    const loadTileImage = (imageSrc: string): Promise<HTMLImageElement> => {
        if (tileCache.current.has(imageSrc)) {
            return Promise.resolve(tileCache.current.get(imageSrc)!);
        }

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                tileCache.current.set(imageSrc, img);
                resolve(img);
            };
            img.onerror = reject;
            img.src = imageSrc;
        });
    };

    // Render the map
    const renderMap = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw grid
        ctx.strokeStyle = 'rgba(51,65,85,0.1)';
        ctx.lineWidth = 1;
        for (let x = 0; x <= width; x++) {
            ctx.beginPath();
            ctx.moveTo(x * tileSize, 0);
            ctx.lineTo(x * tileSize, height * tileSize);
            ctx.stroke();
        }
        for (let y = 0; y <= height; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * tileSize);
            ctx.lineTo(width * tileSize, y * tileSize);
            ctx.stroke();
        }

        // Draw visible layers in order (bottom to top)
        for (const layer of layers) {
            if (!layer.visible) continue;

            for (const tile of layer.tiles) {
                try {
                    // tileId is already the base64 image data, so we can use it directly
                    const tileImage = await loadTileImage(tile.tileId);
                    ctx.drawImage(
                        tileImage,
                        tile.x * tileSize,
                        tile.y * tileSize,
                        tileSize,
                        tileSize
                    );
                } catch (error) {
                    console.error('Failed to load tile image:', tile.tileId);
                }
            }
        }
    };

    // Handle mouse events
    const getTileCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: -1, y: -1 };

        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / tileSize);
        const y = Math.floor((e.clientY - rect.top) / tileSize);
        return { x, y };
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
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
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
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
    };

    const handleMouseUp = () => {
        setIsDrawing(false);
        setLastPainted(null);
    };

    const handleMouseLeave = () => {
        setIsDrawing(false);
        setLastPainted(null);
    };

    // Render map when layers change
    useEffect(() => {
        renderMap();
    }, [layers, tileSize]);

    // Initialize canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = width * tileSize;
        canvas.height = height * tileSize;
        renderMap();
    }, [width, height, tileSize]);

    const addToHistory = (newLayers: any[]) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({ layers: newLayers });
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    const undo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setLayers(history[historyIndex - 1].layers);
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            setLayers(history[historyIndex + 1].layers);
        }
    };

    const clearMap = () => {
        const emptyLayers = layers.map(layer => ({
            ...layer,
            tiles: []
        }));
        setLayers(emptyLayers);
        addToHistory(emptyLayers);
    };

    const placeStamp = (x: number, y: number) => {
        if (!selectedTile || x < 0 || x >= width || y < 0 || y >= height) return;

        const regionW = selectedTile.width || 1;
        const regionH = selectedTile.height || 1;

        const newLayers = layers.map((layer) => {
            if (layer.id !== activeLayerId) return layer;
            let newTiles = [...layer.tiles];
            // Remove existing tiles in the region
            for (let dx = 0; dx < regionW; dx++) {
                for (let dy = 0; dy < regionH; dy++) {
                    const tx = x + dx;
                    const ty = y + dy;
                    if (tx < 0 || tx >= width || ty < 0 || ty >= height) continue;
                    newTiles = newTiles.filter((t) => t.x !== tx || t.y !== ty);
                    // Determine the correct image for this sub-tile
                    let tileImage = selectedTile.image;
                    if (selectedTile.subTiles && (regionW > 1 || regionH > 1)) {
                        tileImage = selectedTile.subTiles[dx][dy];
                    } else if (regionW > 1 || regionH > 1) {
                        const PALETTE_TILE_SIZE = 16;
                        const tempCanvas = document.createElement('canvas');
                        tempCanvas.width = PALETTE_TILE_SIZE;
                        tempCanvas.height = PALETTE_TILE_SIZE;
                        const ctx = tempCanvas.getContext('2d');
                        if (ctx) {
                            const img = new Image();
                            img.src = selectedTile.image;
                            ctx.clearRect(0, 0, PALETTE_TILE_SIZE, PALETTE_TILE_SIZE);
                            ctx.drawImage(
                                img,
                                dx * PALETTE_TILE_SIZE, dy * PALETTE_TILE_SIZE, PALETTE_TILE_SIZE, PALETTE_TILE_SIZE,
                                0, 0, PALETTE_TILE_SIZE, PALETTE_TILE_SIZE
                            );
                            tileImage = tempCanvas.toDataURL('image/png');
                        }
                    }
                    newTiles.push({
                        x: tx,
                        y: ty,
                        tileId: tileImage,
                    });
                }
            }
            return {
                ...layer,
                tiles: newTiles,
            };
        });

        setLayers(newLayers);
        addToHistory(newLayers);
    };

    const fillEntireMap = () => {
        if (!selectedTile) return;

        const regionW = selectedTile.width || 1;
        const regionH = selectedTile.height || 1;

        const newLayers = layers.map((layer) => {
            if (layer.id !== activeLayerId) return layer;

            const newTiles: any[] = [];

            for (let x = 0; x < width; x++) {
                for (let y = 0; y < height; y++) {
                    const dx = x % regionW;
                    const dy = y % regionH;
                    
                    let tileImage = selectedTile.image;
                    if (selectedTile.subTiles && (regionW > 1 || regionH > 1)) {
                        tileImage = selectedTile.subTiles[dx][dy];
                    } else if (regionW > 1 || regionH > 1) {
                        const PALETTE_TILE_SIZE = 16;
                        const tempCanvas = document.createElement('canvas');
                        tempCanvas.width = PALETTE_TILE_SIZE;
                        tempCanvas.height = PALETTE_TILE_SIZE;
                        const ctx = tempCanvas.getContext('2d');
                        if (ctx) {
                            const img = new Image();
                            img.src = selectedTile.image;
                            ctx.clearRect(0, 0, PALETTE_TILE_SIZE, PALETTE_TILE_SIZE);
                            ctx.drawImage(
                                img,
                                dx * PALETTE_TILE_SIZE, dy * PALETTE_TILE_SIZE, PALETTE_TILE_SIZE, PALETTE_TILE_SIZE,
                                0, 0, PALETTE_TILE_SIZE, PALETTE_TILE_SIZE
                            );
                            tileImage = tempCanvas.toDataURL('image/png');
                        }
                    }

                    newTiles.push({
                        x,
                        y,
                        tileId: tileImage,
                    });
                }
            }

            return {
                ...layer,
                tiles: newTiles,
            };
        });

        setLayers(newLayers);
        addToHistory(newLayers);
    };

    const removeTile = (x: number, y: number) => {
        const newLayers = layers.map((layer) => {
            if (layer.id !== activeLayerId) return layer;
            
            return {
                ...layer,
                tiles: layer.tiles.filter((t) => t.x !== x || t.y !== y),
            };
        });
        setLayers(newLayers);
        addToHistory(newLayers);
    };

    return (
        <div className="flex h-full">
            <div className="flex-1 relative">
                <canvas
                    ref={canvasRef}
                    className="border border-slate-700 cursor-crosshair"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                />
            </div>
        </div>
    );
};

export default MapView; 