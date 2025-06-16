import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { Button } from "../../components/ui/button";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Pencil, Undo, Redo, PaintBucket, Trash2 } from "lucide-react";

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
    activeLayerId: number;
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
}: MapViewProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricRef = useRef<fabric.Canvas | null>(null);
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
            selection: false,
            interactive: false,
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
                    evented: false,
                });
                canvas.add(rect);
            }
        }

        // --- Fabric.js painting events ---
        let isFabricDrawing = false;
        let lastPainted: { x: number; y: number } | null = null;
        const handleFabricMouseDown = (opt: fabric.IEvent) => {
            console.log('Mouse down event:', { selectedTile, paintMode });
            if (!selectedTile && paintMode !== 'remove') {
                console.log('No tile selected');
                return;
            }
            const pointer = fabricRef.current!.getPointer(opt.e);
            const x = Math.floor(pointer.x / tileSize);
            const y = Math.floor(pointer.y / tileSize);
            console.log('Mouse position:', { x, y, pointer });
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

        const handleFabricMouseUp = () => {
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

        // Remove all existing image objects
        const objects = fabricRef.current.getObjects();
        objects.forEach((obj) => {
            if (obj.type === "image") {
                fabricRef.current?.remove(obj);
            }
        });

        const imageLoadPromises: Promise<void>[] = [];

        // Draw visible layers in order (bottom to top)
        layers.forEach((layer) => {
            if (!layer.visible) return;

            layer.tiles.forEach((tile) => {
                const loadPromise = new Promise<void>((resolve) => {
                    const tileImage = new Image();
                    tileImage.src = tile.autoTileId || tile.tileId;
                    tileImage.onload = () => {
                        const fabricImage = new fabric.Image(tileImage, {
                            left: tile.x * tileSize,
                            top: tile.y * tileSize,
                            width: tileSize,
                            height: tileSize,
                            selectable: false,
                            evented: false,
                            data: { 
                                needsUpdate: false,
                                layerId: layer.id,
                                tileX: tile.x,
                                tileY: tile.y,
                                layerVisible: layer.visible
                            }
                        });
                        fabricRef.current?.add(fabricImage);
                        resolve();
                    };
                    tileImage.onerror = () => {
                        console.error('Failed to load image:', tile.autoTileId || tile.tileId);
                        resolve();
                    };
                });
                imageLoadPromises.push(loadPromise);
            });
        });

        Promise.all(imageLoadPromises).then(() => {
            fabricRef.current?.renderAll();
        });
    };

    // Add a new effect to handle layer visibility changes
    useEffect(() => {
        if (fabricRef.current) {
            const objects = fabricRef.current.getObjects();
            objects.forEach((obj) => {
                if (obj.type === "image") {
                    const objData = obj.get('data');
                    if (objData) {
                        const layer = layers.find(l => l.id === objData.layerId);
                        if (layer) {
                            obj.set('visible', layer.visible);
                        }
                    }
                }
            });
            fabricRef.current.renderAll();
        }
    }, [layers.map(layer => ({ id: layer.id, visible: layer.visible }))]);

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


    const placeStamp = (x: number, y: number) => {
        console.log('Placing stamp:', { x, y, selectedTile, activeLayerId });
        if (!selectedTile || x < 0 || x >= width || y < 0 || y >= height) {
            console.log('Invalid placement:', { x, y, width, height, selectedTile });
            return;
        }

        const regionW = selectedTile.width || 1;
        const regionH = selectedTile.height || 1;
        console.log('Region size:', { regionW, regionH });

        // Create a new array of layers
        const newLayers = layers.map((layer) => {
            // Only modify the active layer
            if (layer.id !== activeLayerId) return layer;
            
            // Create a new array for the tiles
            let newTiles = [...layer.tiles];
            
            // Remove any existing tiles in the region
            for (let dx = 0; dx < regionW; dx++) {
                for (let dy = 0; dy < regionH; dy++) {
                    const tx = x + dx;
                    const ty = y + dy;
                    if (tx < 0 || tx >= width || ty < 0 || ty >= height) continue;
                    
                    // Remove existing tiles at this position
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
                            const img = new window.Image();
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

                    // Add the new tile
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

        console.log('New layers:', newLayers);
        setLayers(newLayers);
        addToHistory(newLayers);
    };

    const fillEntireMap = () => {
        if (!selectedTile) return;

        const regionW = selectedTile.width || 1;
        const regionH = selectedTile.height || 1;

        const newLayers = layers.map((layer) => {
            // Only modify the active layer
            if (layer.id !== activeLayerId) return layer;

            let newTiles: any[] = [];
            for (let x = 0; x < width; x++) {
                for (let y = 0; y < height; y++) {
                    const dx = x % regionW;
                    const dy = y % regionH;
                    
                    // Use cached subTiles if available
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
                            const img = new window.Image();
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

    const removeTile = (x: number, y: number) => {
        const newLayers = layers.map((layer) => {
            // Only modify the active layer
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
                    className="border border-slate-700"
                    width={width * tileSize}
                    height={height * tileSize}
                />
            </div>
        </div>
    );
};

export default MapView; 