import { useEffect, useRef, useState } from "react";
import { Card } from "../../components/ui/card";
import { fabric } from "fabric";

interface MapViewProps {
    width: number;
    height: number;
    tileSize: number;
    selectedTile?: { id: string; image: string };
    selectedAutoTile?: { id: string; image: string };
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
    const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [activeLayer, setActiveLayer] = useState(0);

    // Initialize Fabric.js canvas
    useEffect(() => {
        if (canvasRef.current && !canvas) {
            const fabricCanvas = new fabric.Canvas(canvasRef.current, {
                width: width * tileSize,
                height: height * tileSize,
                backgroundColor: '#1e293b', // slate-800
                selection: false,
                preserveObjectStacking: true,
            });

            // Add grid
            for (let x = 0; x <= width; x++) {
                fabricCanvas.add(new fabric.Line([x * tileSize, 0, x * tileSize, height * tileSize], {
                    stroke: 'rgba(255, 255, 255, 0.1)',
                    selectable: false,
                }));
            }
            for (let y = 0; y <= height; y++) {
                fabricCanvas.add(new fabric.Line([0, y * tileSize, width * tileSize, y * tileSize], {
                    stroke: 'rgba(255, 255, 255, 0.1)',
                    selectable: false,
                }));
            }

            setCanvas(fabricCanvas);
        }

        return () => {
            if (canvas) {
                canvas.dispose();
                setCanvas(null);
            }
        };
    }, [width, height, tileSize]);

    // Update canvas when layers change
    useEffect(() => {
        if (!canvas) return;

        // Clear existing tiles
        const existingTiles = canvas.getObjects().filter(obj => obj.data?.type === 'tile');
        existingTiles.forEach(obj => canvas.remove(obj));

        // Draw tiles from visible layers
        layers.forEach((layer) => {
            if (!layer.visible) return;

            layer.tiles.forEach((tile) => {
                const img = new Image();
                img.src = tile.autoTileId ? selectedAutoTile?.image || "" : selectedTile?.image || "";
                img.onload = () => {
                    const fabricImage = new fabric.Image(img, {
                        left: tile.x * tileSize,
                        top: tile.y * tileSize,
                        width: tileSize,
                        height: tileSize,
                        selectable: false,
                        data: {
                            type: 'tile',
                            layerId: layer.id,
                            x: tile.x,
                            y: tile.y,
                            tileId: tile.tileId,
                            autoTileId: tile.autoTileId,
                        },
                    });
                    canvas.add(fabricImage);
                    canvas.renderAll();
                };
            });
        });
    }, [layers, selectedTile, selectedAutoTile]);

    // Handle mouse events
    useEffect(() => {
        if (!canvas) return;

        const handleMouseDown = (e: fabric.IEvent) => {
            if (!selectedTile && !selectedAutoTile) return;
            setIsDrawing(true);
            drawTile(e);
        };

        const handleMouseMove = (e: fabric.IEvent) => {
            if (!isDrawing) return;
            drawTile(e);
        };

        const handleMouseUp = () => {
            setIsDrawing(false);
        };

        canvas.on('mouse:down', handleMouseDown);
        canvas.on('mouse:move', handleMouseMove);
        canvas.on('mouse:up', handleMouseUp);
        canvas.on('mouse:leave', handleMouseUp);

        return () => {
            canvas.off('mouse:down', handleMouseDown);
            canvas.off('mouse:move', handleMouseMove);
            canvas.off('mouse:up', handleMouseUp);
            canvas.off('mouse:leave', handleMouseUp);
        };
    }, [canvas, isDrawing, selectedTile, selectedAutoTile]);

    const drawTile = (e: fabric.IEvent) => {
        if (!canvas) return;

        const pointer = canvas.getPointer(e.e);
        const x = Math.floor(pointer.x / tileSize);
        const y = Math.floor(pointer.y / tileSize);

        if (x < 0 || x >= width || y < 0 || y >= height) return;

        const currentLayer = layers[activeLayer];
        if (currentLayer.locked) return;

        const tileIndex = currentLayer.tiles.findIndex(
            (t) => t.x === x && t.y === y
        );

        if (tileIndex === -1) {
            currentLayer.tiles.push({
                x,
                y,
                tileId: selectedTile?.id || "",
                autoTileId: selectedAutoTile?.id,
            });
        } else {
            currentLayer.tiles[tileIndex] = {
                x,
                y,
                tileId: selectedTile?.id || "",
                autoTileId: selectedAutoTile?.id,
            };
        }

        setLayers([...layers]);
    };

    return (
        <Card className="p-4 bg-slate-900">
            <canvas ref={canvasRef} />
        </Card>
    );
};

export default MapView; 