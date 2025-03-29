import { useEffect, useRef, useState } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Plus, Trash2 } from "lucide-react";
import { fabric } from "fabric";

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
    npcs: NPC[];
    setNPCs: (npcs: NPC[]) => void;
}

const NPCView = ({
    width,
    height,
    tileSize,
    npcs,
    setNPCs,
}: NPCViewProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
    const [selectedNPC, setSelectedNPC] = useState<NPC | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Initialize Fabric.js canvas
    useEffect(() => {
        if (canvasRef.current && !canvas) {
            const fabricCanvas = new fabric.Canvas(canvasRef.current, {
                width: width * tileSize,
                height: height * tileSize,
                backgroundColor: '#1e293b', // slate-800
                selection: false,
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

    // Update canvas when NPCs change
    useEffect(() => {
        if (!canvas) return;

        // Clear existing NPCs
        const existingNPCs = canvas.getObjects().filter(obj => obj.data?.type === 'npc');
        existingNPCs.forEach(obj => canvas.remove(obj));

        // Draw NPCs
        npcs.forEach((npc) => {
            const img = new Image();
            img.src = npc.sprite;
            img.onload = () => {
                const fabricImage = new fabric.Image(img, {
                    left: npc.x * tileSize,
                    top: npc.y * tileSize,
                    width: tileSize,
                    height: tileSize,
                    selectable: true,
                    data: {
                        type: 'npc',
                        id: npc.id,
                    },
                });

                // Set rotation based on direction
                switch (npc.direction) {
                    case "up":
                        fabricImage.rotate(-90);
                        break;
                    case "left":
                        fabricImage.rotate(180);
                        break;
                    case "right":
                        fabricImage.rotate(0);
                        break;
                    case "down":
                        fabricImage.rotate(90);
                        break;
                }

                // Add selection highlight if selected
                if (selectedNPC?.id === npc.id) {
                    const highlight = new fabric.Rect({
                        left: npc.x * tileSize,
                        top: npc.y * tileSize,
                        width: tileSize,
                        height: tileSize,
                        fill: 'rgba(255, 255, 0, 0.2)',
                        selectable: false,
                        data: {
                            type: 'highlight',
                            npcId: npc.id,
                        },
                    });
                    canvas.add(highlight);
                }

                canvas.add(fabricImage);
                canvas.renderAll();
            };
        });
    }, [npcs, selectedNPC]);

    // Handle mouse events
    useEffect(() => {
        if (!canvas) return;

        const handleMouseDown = (e: fabric.IEvent) => {
            const target = e.target;
            if (!target || !(target.data?.type === 'npc')) return;

            const npc = npcs.find(n => n.id === target.data.id);
            if (npc) {
                setSelectedNPC(npc);
                setIsDragging(true);
            }
        };

        const handleMouseMove = (e: fabric.IEvent) => {
            if (!isDragging || !selectedNPC) return;

            const pointer = canvas.getPointer(e.e);
            const x = Math.floor(pointer.x / tileSize);
            const y = Math.floor(pointer.y / tileSize);

            if (x < 0 || x >= width || y < 0 || y >= height) return;

            setNPCs(
                npcs.map((npc) =>
                    npc.id === selectedNPC.id
                        ? { ...npc, x, y }
                        : npc
                )
            );
        };

        const handleMouseUp = () => {
            setIsDragging(false);
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
    }, [canvas, isDragging, selectedNPC]);

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
                        <canvas ref={canvasRef} />
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
                                <div className="mt-2 space-y-2">
                                    <div className="grid grid-cols-2 gap-2">
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
                                    <div>
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
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
};

export default NPCView; 