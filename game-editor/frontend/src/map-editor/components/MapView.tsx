import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { Button } from "../../components/ui/button";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Pencil, Square, Undo, Redo, PaintBucket } from "lucide-react";
import { bucket } from '@lucide/lab';
interface Tile {
    id: string;
    name: string;
    image: string;
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
                    stroke: "#334155",
                    strokeWidth: 1,
                    fill: "transparent",
                    selectable: false,
                });
                canvas.add(rect);
            }
        }

        // Draw layers
        drawLayers();

        return () => {
            canvas.dispose();
        };
    }, [width, height, tileSize]);

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

    const handleMouseDown = (e: fabric.IEvent) => {
        if (!fabricRef.current || !selectedTile) return;

        const pointer = fabricRef.current.getPointer(e.e);
        const x = Math.floor(pointer.x / tileSize);
        const y = Math.floor(pointer.y / tileSize);

        setIsDrawing(true);
        setStartPoint({ x, y });

        if (activeTool === "brush") {
            placeTile(x, y);
        }
    };

    const handleMouseMove = (e: fabric.IEvent) => {
        if (!isDrawing || !fabricRef.current || !selectedTile || !startPoint) return;

        const pointer = fabricRef.current.getPointer(e.e);
        const x = Math.floor(pointer.x / tileSize);
        const y = Math.floor(pointer.y / tileSize);

        if (activeTool === "brush") {
            placeTile(x, y);
        } else if (activeTool === "rectangle") {
            // Clear and redraw layers
            drawLayers();
            // Draw rectangle preview
            const rect = new fabric.Rect({
                left: Math.min(startPoint.x, x) * tileSize,
                top: Math.min(startPoint.y, y) * tileSize,
                width: Math.abs(x - startPoint.x + 1) * tileSize,
                height: Math.abs(y - startPoint.y + 1) * tileSize,
                fill: "rgba(0, 255, 255, 0.3)",
                stroke: "#00ffff",
                strokeWidth: 1,
                selectable: false,
            });
            fabricRef.current.add(rect);
            fabricRef.current.renderAll();
        }
    };

    const handleMouseUp = () => {
        if (!isDrawing || !startPoint || !selectedTile) return;

        if (activeTool === "rectangle") {
            const endX = Math.floor((fabricRef.current?.getPointer({} as any).x || 0) / tileSize);
            const endY = Math.floor((fabricRef.current?.getPointer({} as any).y || 0) / tileSize);
            fillRectangle(startPoint.x, startPoint.y, endX, endY);
        }

        setIsDrawing(false);
        setStartPoint(null);
    };

    const placeTile = (x: number, y: number) => {
        if (!selectedTile || x < 0 || x >= width || y < 0 || y >= height) return;

        const newLayers = layers.map((layer) => {
            if (layer.locked) return layer;
            return {
                ...layer,
                tiles: [
                    ...layer.tiles.filter((t) => t.x !== x || t.y !== y),
                    {
                        x,
                        y,
                        tileId: selectedTile.image,
                        autoTileId: selectedAutoTile?.image,
                    },
                ],
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

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 mb-4">
                <Button
                    variant={activeTool === "brush" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setActiveTool("brush")}
                >
                    <Pencil className="h-4 w-4" />
                </Button>
                <Button
                    variant={activeTool === "rectangle" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setActiveTool("rectangle")}
                >
                    <Square className="h-4 w-4" />
                </Button>
                <Button
                    variant={activeTool === "bucket" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setActiveTool("bucket")}
                >
                    <PaintBucket className="h-4 w-4" />
                </Button>
                <div className="h-4 w-px bg-slate-700 mx-2" />
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
            </div>

            <ScrollArea className="flex-1 border border-slate-800 rounded-md">
                <div className="relative">
                    <canvas
                        ref={canvasRef}
                        onMouseDown={(e) => {
                            const pointer = fabricRef.current?.getPointer(e as unknown as Event);
                            if (!pointer) return;
                            const x = Math.floor(pointer.x / tileSize);
                            const y = Math.floor(pointer.y / tileSize);
                            if (activeTool === "bucket") {
                                bucketFill(x, y);
                            }
                        }}
                    />
                </div>
            </ScrollArea>
        </div>
    );
};

export default MapView; 