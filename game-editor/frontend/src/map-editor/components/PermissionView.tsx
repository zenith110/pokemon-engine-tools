import { useEffect, useRef, useState } from "react";
import { Card } from "../../components/ui/card";
import { fabric } from "fabric";

interface PermissionViewProps {
    width: number;
    height: number;
    tileSize: number;
    permissions: Array<{
        x: number;
        y: number;
        type: "walkable" | "blocked" | "water" | "grass";
    }>;
    setPermissions: (permissions: any[]) => void;
}

const PermissionView = ({
    width,
    height,
    tileSize,
    permissions,
    setPermissions,
}: PermissionViewProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [selectedType, setSelectedType] = useState<"walkable" | "blocked" | "water" | "grass">("walkable");

    const permissionColors = {
        walkable: "rgba(0, 255, 0, 0.2)",
        blocked: "rgba(255, 0, 0, 0.2)",
        water: "rgba(0, 0, 255, 0.2)",
        grass: "rgba(0, 255, 0, 0.4)",
    };

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

    // Update canvas when permissions change
    useEffect(() => {
        if (!canvas) return;

        // Clear existing permission rectangles
        const existingPermissions = canvas.getObjects().filter(obj => obj.data?.type === 'permission');
        existingPermissions.forEach(obj => canvas.remove(obj));

        // Draw permissions
        permissions.forEach((permission) => {
            const rect = new fabric.Rect({
                left: permission.x * tileSize,
                top: permission.y * tileSize,
                width: tileSize,
                height: tileSize,
                fill: permissionColors[permission.type],
                selectable: false,
                data: {
                    type: 'permission',
                    x: permission.x,
                    y: permission.y,
                    permissionType: permission.type,
                },
            });
            canvas.add(rect);
        });

        canvas.renderAll();
    }, [permissions]);

    // Handle mouse events
    useEffect(() => {
        if (!canvas) return;

        const handleMouseDown = (e: fabric.IEvent) => {
            setIsDrawing(true);
            drawPermission(e);
        };

        const handleMouseMove = (e: fabric.IEvent) => {
            if (!isDrawing) return;
            drawPermission(e);
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
    }, [canvas, isDrawing, selectedType]);

    const drawPermission = (e: fabric.IEvent) => {
        if (!canvas) return;

        const pointer = canvas.getPointer(e.e);
        const x = Math.floor(pointer.x / tileSize);
        const y = Math.floor(pointer.y / tileSize);

        if (x < 0 || x >= width || y < 0 || y >= height) return;

        const permissionIndex = permissions.findIndex(
            (p) => p.x === x && p.y === y
        );

        if (permissionIndex === -1) {
            permissions.push({
                x,
                y,
                type: selectedType,
            });
        } else {
            permissions[permissionIndex] = {
                x,
                y,
                type: selectedType,
            };
        }

        setPermissions([...permissions]);
    };

    return (
        <div className="space-y-4">
            <div className="flex space-x-2">
                {Object.keys(permissionColors).map((type) => (
                    <button
                        key={type}
                        onClick={() => setSelectedType(type as any)}
                        className={`px-3 py-1 rounded-md text-sm ${
                            selectedType === type
                                ? "bg-slate-700 text-white"
                                : "bg-slate-800 text-slate-400 hover:text-slate-300"
                        }`}
                    >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                ))}
            </div>
            <Card className="p-4 bg-slate-900">
                <canvas ref={canvasRef} />
            </Card>
        </div>
    );
};

export default PermissionView; 