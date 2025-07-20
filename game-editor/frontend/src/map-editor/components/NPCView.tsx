import { useEffect, useRef, useState } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Plus, Trash2 } from "lucide-react";
import { MapLayer } from "../types";

interface NPC {
    id: string;
    name: string;
    x: number;
    y: number;
    sprite: string;
    direction: "up" | "down" | "left" | "right";
    script?: string;
}

interface NPCViewProps {
    width: number;
    height: number;
    tileSize: number;
    layers: MapLayer[];
    npcs: NPC[];
    setNPCs: (npcs: NPC[]) => void;
}

const NPCView = ({
    width,
    height,
    tileSize,
    layers,
    npcs,
    setNPCs,
}: NPCViewProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selectedNPC, setSelectedNPC] = useState<NPC | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [lastPainted, setLastPainted] = useState<{ x: number; y: number } | null>(null);
    
    // Tile cache for performance
    const tileCache = useRef<Map<string, HTMLImageElement>>(new Map());

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

    // Render the map with NPCs
    const renderMap = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw checkerboard pattern for transparency
        const checkerSize = 8; // Size of each checker square
        for (let x = 0; x < canvas.width; x += checkerSize) {
            for (let y = 0; y < canvas.height; y += checkerSize) {
                const isEven = ((x / checkerSize) + (y / checkerSize)) % 2 === 0;
                ctx.fillStyle = isEven ? '#ffffff' : '#cccccc';
                ctx.fillRect(x, y, checkerSize, checkerSize);
            }
        }

        // Draw grid with a subtle pattern to show transparency
        ctx.strokeStyle = 'rgba(51,65,85,0.3)';
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

        // Draw NPCs
        npcs.forEach((npc) => {
            // Draw NPC sprite
            const img = new Image();
            img.onload = () => {
                ctx.save();
                ctx.translate(npc.x * tileSize + tileSize / 2, npc.y * tileSize + tileSize / 2);
                
                // Set rotation based on direction
                switch (npc.direction) {
                    case "up":
                        ctx.rotate(-Math.PI / 2);
                        break;
                    case "left":
                        ctx.rotate(Math.PI);
                        break;
                    case "right":
                        ctx.rotate(0);
                        break;
                    case "down":
                        ctx.rotate(Math.PI / 2);
                        break;
                }
                
                ctx.drawImage(img, -tileSize / 2, -tileSize / 2, tileSize, tileSize);
                ctx.restore();

                // Draw selection highlight if selected
                if (selectedNPC?.id === npc.id) {
                    ctx.strokeStyle = '#fbbf24';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(npc.x * tileSize, npc.y * tileSize, tileSize, tileSize);
                }
            };
            img.src = npc.sprite;
        });
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
        const { x, y } = getTileCoords(e);
        if (x < 0 || x >= width || y < 0 || y >= height) return;

        // Check if clicking on an NPC
        const clickedNPC = npcs.find(npc => npc.x === x && npc.y === y);
        if (clickedNPC) {
            setSelectedNPC(clickedNPC);
            setIsDragging(true);
            setLastPainted({ x, y });
        } else {
            setSelectedNPC(null);
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDragging || !selectedNPC) return;

        const { x, y } = getTileCoords(e);
        if (x < 0 || x >= width || y < 0 || y >= height) return;

        if (!lastPainted || lastPainted.x !== x || lastPainted.y !== y) {
            setLastPainted({ x, y });
            setNPCs(
                npcs.map((npc) =>
                    npc.id === selectedNPC.id
                        ? { ...npc, x, y }
                        : npc
                )
            );
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setLastPainted(null);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
        setLastPainted(null);
    };

    // Render map when layers or NPCs change
    useEffect(() => {
        renderMap();
    }, [layers, npcs, selectedNPC, tileSize]);

    // Initialize canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = width * tileSize;
        canvas.height = height * tileSize;
        renderMap();
    }, [width, height, tileSize]);

    const addNPC = () => {
        const newNPC: NPC = {
            id: Math.random().toString(36).substr(2, 9),
            name: `NPC ${npcs.length + 1}`,
            x: 0,
            y: 0,
            sprite: "/placeholder-sprite.png",
            direction: "down",
        };
        setNPCs([...npcs, newNPC]);
        setSelectedNPC(newNPC);
    };

    const deleteNPC = (npcId: string) => {
        setNPCs(npcs.filter((npc) => npc.id !== npcId));
        if (selectedNPC?.id === npcId) {
            setSelectedNPC(null);
        }
    };

    const updateNPCDirection = (npcId: string, direction: NPC["direction"]) => {
        setNPCs(
            npcs.map((npc) =>
                npc.id === npcId ? { ...npc, direction } : npc
            )
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">NPCs</h3>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={addNPC}
                    className="h-8 w-8 p-0"
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                    <Card className="p-4 bg-slate-900">
                        <canvas
                            ref={canvasRef}
                            className="border border-slate-700 cursor-crosshair"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseLeave}
                        />
                    </Card>
                </div>

                <ScrollArea className="h-[calc(100vh-12rem)]">
                    <div className="space-y-2">
                        {npcs.map((npc) => (
                            <div
                                key={npc.id}
                                className={`p-2 rounded-md ${
                                    selectedNPC?.id === npc.id
                                        ? "bg-slate-700"
                                        : "bg-slate-800"
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-300">
                                        {npc.name}
                                    </span>
                                    <button
                                        onClick={() => deleteNPC(npc.id)}
                                        className="text-slate-400 hover:text-red-400"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <div>
                                        <label className="text-xs text-slate-400">
                                            X
                                        </label>
                                        <input
                                            type="number"
                                            value={npc.x}
                                            onChange={(e) =>
                                                setNPCs(
                                                    npcs.map((n) =>
                                                        n.id === npc.id
                                                            ? {
                                                                  ...n,
                                                                  x: parseInt(
                                                                      e.target
                                                                          .value
                                                                  ),
                                                              }
                                                            : n
                                                    )
                                                )
                                            }
                                            className="w-full px-2 py-1 text-sm bg-slate-700 border border-slate-600 rounded-md"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="text-xs text-slate-400">
                                            Y
                                        </label>
                                        <input
                                            type="number"
                                            value={npc.y}
                                            onChange={(e) =>
                                                setNPCs(
                                                    npcs.map((n) =>
                                                        n.id === npc.id
                                                            ? {
                                                                  ...n,
                                                                  y: parseInt(
                                                                      e.target
                                                                          .value
                                                                  ),
                                                              }
                                                            : n
                                                    )
                                                )
                                            }
                                            className="w-full px-2 py-1 text-sm bg-slate-700 border border-slate-600 rounded-md"
                                        />
                                    </div>
                                </div>
                                
                                <div className="mt-2">
                                    <label className="text-xs text-slate-400">
                                        Direction
                                    </label>
                                    <select
                                        value={npc.direction}
                                        onChange={(e) =>
                                            updateNPCDirection(
                                                npc.id,
                                                e.target.value as NPC["direction"]
                                            )
                                        }
                                        className="w-full px-2 py-1 text-sm bg-slate-700 border border-slate-600 rounded-md"
                                    >
                                        <option value="up">Up</option>
                                        <option value="down">Down</option>
                                        <option value="left">Left</option>
                                        <option value="right">Right</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
};

export default NPCView; 