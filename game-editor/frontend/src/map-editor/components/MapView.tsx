import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { Button } from "../../components/ui/button";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Pencil, Square, Undo, Redo, PaintBucket, Copy, Grid3x3, Trash2 } from "lucide-react";
import { bucket } from '@lucide/lab';

interface Tile {
    id: string;
    name: string;
    image: string;
    width?: number;
    height?: number;
    subTiles?: string[][];
}

interface MapViewProps {
    width: number;
    height: number;
    tileSize: number;
    selectedTile: Tile | null;
    selectedAutoTile: Tile | null;
    layers: Array<{
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
    }>;
    setLayers: (layers: any[]) => void;
}

type Tool = "brush" | "rectangle" | "bucket";

const MapView = ({
    width,
    height,
    tileSize,
    selectedTile,
    selectedAutoTile,
    layers,
    setLayers,
}: MapViewProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricRef = useRef<fabric.Canvas | null>(null);
    const [activeTool, setActiveTool] = useState<Tool>("brush");
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
    const [history, setHistory] = useState<Array<{ layers: any[] }>>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [paintMode, setPaintMode] = useState<'stamp' | 'fill' | 'remove'>('stamp');

    useEffect(() => {
        if (!canvasRef.current) return;

        // Initialize Fabric canvas
        const canvas = new fabric.Canvas(canvasRef.current, {
            width: width * tileSize,
            height: height * tileSize,
            backgroundColor: "#1e293b",
        });
        fabricRef.current = canvas;

        // Draw grid
        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                const rect = new fabric.Rect({
                    left: i * tileSize,
                    top: j * tileSize,
                    width: tileSize,
                    height: tileSize,
                    stroke: "rgba(51,65,85,0.1)",
                    strokeWidth: 1,
                    fill: "transparent",
                    selectable: false,
                });
                canvas.add(rect);
            }
        }

        // Draw layers
        drawLayers();

        // --- Fabric.js painting events ---
        let isFabricDrawing = false;
        let lastPainted: { x: number; y: number } | null = null;
        const handleFabricMouseDown = (opt: fabric.IEvent) => {
            if (!selectedTile && paintMode !== 'remove') return;
            const pointer = fabricRef.current!.getPointer(opt.e);
            const x = Math.floor(pointer.x / tileSize);
            const y = Math.floor(pointer.y / tileSize);
            isFabricDrawing = true;
            lastPainted = { x, y };
            if (paintMode === 'stamp') {
                placeStamp(x, y);
            } else if (paintMode === 'fill') {
                fillEntireMap();
            } else if (paintMode === 'remove') {
                removeTile(x, y);
            }
        };
        const handleFabricMouseMove = (opt: fabric.IEvent) => {
            if (!isFabricDrawing) return;
            const pointer = fabricRef.current!.getPointer(opt.e);
            const x = Math.floor(pointer.x / tileSize);
            const y = Math.floor(pointer.y / tileSize);
            if (paintMode === 'stamp') {
                if (!lastPainted || lastPainted.x !== x || lastPainted.y !== y) {
                    placeStamp(x, y);
                    lastPainted = { x, y };
                }
            } else if (paintMode === 'remove') {
                if (!lastPainted || lastPainted.x !== x || lastPainted.y !== y) {
                    removeTile(x, y);
                    lastPainted = { x, y };
                }
            }
        };
        const handleFabricMouseUp = (opt: fabric.IEvent) => {
            isFabricDrawing = false;
            lastPainted = null;
        };
        canvas.on('mouse:down', handleFabricMouseDown);
        canvas.on('mouse:move', handleFabricMouseMove);
        canvas.on('mouse:up', handleFabricMouseUp);

        // Cleanup
        return () => {
            canvas.off('mouse:down', handleFabricMouseDown);
            canvas.off('mouse:move', handleFabricMouseMove);
            canvas.off('mouse:up', handleFabricMouseUp);
            canvas.dispose();
        };
    }, [width, height, tileSize, selectedTile, paintMode]);

    useEffect(() => {
        if (fabricRef.current) {
            drawLayers();
        }
    }, [layers]);

    const drawLayers = () => {
        if (!fabricRef.current) return;

        // Clear existing tiles
        const objects = fabricRef.current.getObjects();
        objects.forEach((obj) => {
            if (obj.type === "image") {
                fabricRef.current?.remove(obj);
            }
        });

        // Draw visible layers
        layers.forEach((layer) => {
            if (!layer.visible) return;

            layer.tiles.forEach((tile) => {
                const tileImage = new Image();
                tileImage.src = tile.autoTileId || tile.tileId;
                tileImage.onload = () => {
                    const fabricImage = new fabric.Image(tileImage, {
                        left: tile.x * tileSize,
                        top: tile.y * tileSize,
                        width: tileSize,
                        height: tileSize,
                        selectable: false,
                    });
                    fabricRef.current?.add(fabricImage);
                    fabricRef.current?.renderAll();
                };
            });
        });
    };

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

    const placeTile = (x: number, y: number) => {
        if (!selectedTile || x < 0 || x >= width || y < 0 || y >= height) return;

        const regionW = selectedTile.width || 1;
        const regionH = selectedTile.height || 1;

        // For multi-tile selection, paint the whole region
        const newLayers = layers.map((layer) => {
            if (layer.locked) return layer;
            let newTiles = [...layer.tiles];
            for (let dx = 0; dx < regionW; dx++) {
                for (let dy = 0; dy < regionH; dy++) {
                    const tx = x + dx;
                    const ty = y + dy;
                    if (tx < 0 || tx >= width || ty < 0 || ty >= height) continue;
                    // Remove any existing tile at this position
                    newTiles = newTiles.filter((t) => t.x !== tx || t.y !== ty);
                    // Create a cropped tile image for this cell
                    let tileImage = selectedTile.image;
                    if (regionW > 1 || regionH > 1) {
                        // Crop the correct sub-image from the selectedTile.image
                        // Create a temporary canvas to crop
                        const tempCanvas = document.createElement('canvas');
                        tempCanvas.width = 16;
                        tempCanvas.height = 16;
                        const ctx = tempCanvas.getContext('2d');
                        if (ctx) {
                            const img = new window.Image();
                            img.src = selectedTile.image;
                            // Synchronous draw since image is already loaded as dataURL
                            ctx.clearRect(0, 0, 16, 16);
                            ctx.drawImage(
                                img,
                                dx * 16, dy * 16, 16, 16,
                                0, 0, 16, 16
                            );
                            tileImage = tempCanvas.toDataURL('image/png');
                        }
                    }
                    newTiles.push({
                        x: tx,
                        y: ty,
                        tileId: tileImage,
                        autoTileId: selectedAutoTile?.image,
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

    const fillRectangle = (startX: number, startY: number, endX: number, endY: number) => {
        if (!selectedTile) return;

        const newLayers = layers.map((layer) => {
            if (layer.locked) return layer;
            const newTiles = [...layer.tiles];
            const minX = Math.min(startX, endX);
            const maxX = Math.max(startX, endX);
            const minY = Math.min(startY, endY);
            const maxY = Math.max(startY, endY);

            for (let x = minX; x <= maxX; x++) {
                for (let y = minY; y <= maxY; y++) {
                    const existingTileIndex = newTiles.findIndex((t) => t.x === x && t.y === y);
                    if (existingTileIndex !== -1) {
                        newTiles.splice(existingTileIndex, 1);
                    }
                    newTiles.push({
                        x,
                        y,
                        tileId: selectedTile.image,
                        autoTileId: selectedAutoTile?.image,
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

    const bucketFill = (x: number, y: number) => {
        if (!selectedTile || x < 0 || x >= width || y < 0 || y >= height) return;

        const targetTile = layers[0].tiles.find((t) => t.x === x && t.y === y);
        if (!targetTile) return;

        const targetTileId = targetTile.tileId;
        const newLayers = layers.map((layer) => {
            if (layer.locked) return layer;
            const newTiles = [...layer.tiles];
            const queue: Array<{ x: number; y: number }> = [{ x, y }];
            const visited = new Set<string>();

            while (queue.length > 0) {
                const current = queue.shift()!;
                const key = `${current.x},${current.y}`;
                if (visited.has(key)) continue;
                visited.add(key);

                const existingTile = newTiles.find((t) => t.x === current.x && t.y === current.y);
                if (existingTile?.tileId !== targetTileId) continue;

                newTiles.push({
                    x: current.x,
                    y: current.y,
                    tileId: selectedTile.image,
                    autoTileId: selectedAutoTile?.image,
                });

                // Add adjacent tiles to queue
                const directions = [
                    { dx: 0, dy: 1 },
                    { dx: 0, dy: -1 },
                    { dx: 1, dy: 0 },
                    { dx: -1, dy: 0 },
                ];

                directions.forEach(({ dx, dy }) => {
                    const newX = current.x + dx;
                    const newY = current.y + dy;
                    if (
                        newX >= 0 &&
                        newX < width &&
                        newY >= 0 &&
                        newY < height &&
                        !visited.has(`${newX},${newY}`)
                    ) {
                        queue.push({ x: newX, y: newY });
                    }
                });
            }

            return {
                ...layer,
                tiles: newTiles,
            };
        });

        setLayers(newLayers);
        addToHistory(newLayers);
    };

    const placeStamp = (x: number, y: number) => {
        if (!selectedTile || x < 0 || x >= width || y < 0 || y >= height) return;
        const regionW = selectedTile.width || 1;
        const regionH = selectedTile.height || 1;
        const newLayers = layers.map((layer) => {
            if (layer.locked) return layer;
            let newTiles = [...layer.tiles];
            // Remove any existing tiles in the region
            for (let dx = 0; dx < regionW; dx++) {
                for (let dy = 0; dy < regionH; dy++) {
                    const tx = x + dx;
                    const ty = y + dy;
                    newTiles = newTiles.filter((t) => t.x !== tx || t.y !== ty);
                }
            }
            newTiles.push({
                x,
                y,
                tileId: selectedTile.image,
                autoTileId: selectedAutoTile?.image,
            });
            return {
                ...layer,
                tiles: newTiles,
            };
        });
        setLayers(newLayers);
        addToHistory(newLayers);
    };

    const fillWithSelection = (x1: number, y1: number, x2: number, y2: number) => {
        if (!selectedTile) return;
        const regionW = selectedTile.width || 1;
        const regionH = selectedTile.height || 1;
        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const minY = Math.min(y1, y2);
        const maxY = Math.max(y1, y2);
        const newLayers = layers.map((layer) => {
            if (layer.locked) return layer;
            let newTiles = [...layer.tiles];
            for (let x = minX; x <= maxX; x++) {
                for (let y = minY; y <= maxY; y++) {
                    // Remove any existing tile at this position
                    newTiles = newTiles.filter((t) => t.x !== x || t.y !== y);
                    // Figure out which part of the selection to use
                    let tileImage = selectedTile.image;
                    if (regionW > 1 || regionH > 1) {
                        const dx = (x - minX) % regionW;
                        const dy = (y - minY) % regionH;
                        // Crop the correct sub-image from the selectedTile.image
                        const tempCanvas = document.createElement('canvas');
                        tempCanvas.width = tileSize;
                        tempCanvas.height = tileSize;
                        const ctx = tempCanvas.getContext('2d');
                        if (ctx) {
                            const img = new window.Image();
                            img.src = selectedTile.image;
                            ctx.clearRect(0, 0, tileSize, tileSize);
                            ctx.drawImage(
                                img,
                                dx * tileSize, dy * tileSize, tileSize, tileSize,
                                0, 0, tileSize, tileSize
                            );
                            tileImage = tempCanvas.toDataURL('image/png');
                        }
                    }
                    newTiles.push({
                        x,
                        y,
                        tileId: tileImage,
                        autoTileId: selectedAutoTile?.image,
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

    // Fill the entire map with the selected tile/region
    const fillEntireMap = () => {
        if (!selectedTile) return;
        const regionW = selectedTile.width || 1;
        const regionH = selectedTile.height || 1;
        const newLayers = layers.map((layer) => {
            if (layer.locked) return layer;
            let newTiles: any[] = [];
            for (let x = 0; x < width; x++) {
                for (let y = 0; y < height; y++) {
                    // Use cached subTiles if available
                    let tileImage = selectedTile.image;
                    if (selectedTile.subTiles && regionW > 1 || regionH > 1) {
                        const dx = x % regionW;
                        const dy = y % regionH;
                        tileImage = selectedTile.subTiles[dx][dy];
                    }
                    newTiles.push({
                        x,
                        y,
                        tileId: tileImage,
                        autoTileId: selectedAutoTile?.image,
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

    // Remove a tile at (x, y)
    const removeTile = (x: number, y: number) => {
        const newLayers = layers.map((layer) => {
            if (layer.locked) return layer;
            return {
                ...layer,
                tiles: layer.tiles.filter((t) => t.x !== x || t.y !== y),
            };
        });
        setLayers(newLayers);
        addToHistory(newLayers);
    };

    // Clear the entire map
    const clearMap = () => {
        const newLayers = layers.map((layer) => ({
            ...layer,
            tiles: [],
        }));
        setLayers(newLayers);
        addToHistory(newLayers);
    };

    return (
        <div className="flex flex-col h-full">
            {paintMode === 'stamp' && (
                <div className="mb-2 text-xs text-blue-400 font-semibold">Stamp Mode Active: Click to paint</div>
            )}
            {paintMode === 'fill' && (
                <div className="mb-2 text-xs text-teal-400 font-semibold">Fill Mode Active: Click to fill the map</div>
            )}
            {paintMode === 'remove' && (
                <div className="mb-2 text-xs text-red-400 font-semibold">Remove Mode Active: Click tiles to delete</div>
            )}
            {/* Selected Tile Preview */}
            {selectedTile && (
                <div className="mb-2 flex items-center gap-2">
                    <span className="text-xs text-slate-400">Selected Tile:</span>
                    <img
                        src={selectedTile.image}
                        alt={selectedTile.name}
                        style={{ width: tileSize * (selectedTile.width || 1), height: tileSize * (selectedTile.height || 1), imageRendering: 'pixelated', border: '1px solid #334155', background: '#1e293b', borderRadius: 4 }}
                    />
                    <span className="text-xs text-slate-400">{selectedTile.name}</span>
                </div>
            )}
            <div className="flex items-center gap-2 mb-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={undo}
                    disabled={historyIndex <= 0}
                >
                    <Undo className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={redo}
                    disabled={historyIndex >= history.length - 1}
                >
                    <Redo className="h-4 w-4" />
                </Button>
                <Button
                    variant={paintMode === 'stamp' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => setPaintMode('stamp')}
                    title="Stamp Mode"
                >
                    <Pencil className="h-4 w-4" />
                </Button>
                <Button
                    variant={paintMode === 'fill' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => setPaintMode('fill')}
                    title="Fill Mode"
                >
                    <PaintBucket className="h-4 w-4" />
                </Button>
                <Button
                    variant={paintMode === 'remove' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => setPaintMode('remove')}
                    title="Remove Tile"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearMap}
                    title="Clear Map"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            <ScrollArea className="flex-1 border border-slate-800 rounded-md">
                <div className="relative">
                    <canvas ref={canvasRef} />
                </div>
            </ScrollArea>
        </div>
    );
};

export default MapView; 