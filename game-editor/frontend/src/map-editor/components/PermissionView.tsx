import { useEffect, useRef, useState } from "react";
import { Card } from "../../components/ui/card";

interface PermissionViewProps {
    width: number;
    height: number;
    tileSize: number;
    layers: any[]; // Pass map layers for background rendering
    permissions: Array<{
        x: number;
        y: number;
        type: "walkable" | "blocked" | "water" | "grass";
    }>;
    setPermissions: (permissions: any[]) => void;
}

const permissionTypes = [
    { type: "walkable", label: "Walkable", color: "rgba(37, 99, 235, 0.35)" }, // blue-600
    { type: "blocked", label: "Blocked", color: "rgba(239, 68, 68, 0.35)" },   // red-500
    { type: "water", label: "Surf", color: "rgba(139, 92, 246, 0.35)" },       // purple-500
    { type: "grass", label: "Grass", color: "rgba(34,197,94,0.35)" },          // green-500
];

const PermissionView = ({
    width,
    height,
    tileSize,
    layers,
    permissions,
    setPermissions,
}: PermissionViewProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selectedType, setSelectedType] = useState<"walkable" | "blocked" | "water" | "grass">("walkable");
    const [isDrawing, setIsDrawing] = useState(false);

    // Render the map and permissions
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas size
        canvas.width = width * tileSize;
        canvas.height = height * tileSize;

        // Draw background
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw map layers (reuse logic from MapView, simplified here)
        for (const layer of layers) {
            if (!layer.visible) continue;
            for (const tile of layer.tiles) {
                const img = new window.Image();
                img.src = tile.autoTileId || tile.tileId;
                img.onload = () => {
                    ctx.drawImage(
                        img,
                        tile.x * tileSize,
                        tile.y * tileSize,
                        tileSize,
                        tileSize
                    );
                };
            }
        }

        // Draw grid
        ctx.strokeStyle = "rgba(255,255,255,0.1)";
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

        // Draw permissions overlay
        for (const perm of permissions) {
            const color = permissionTypes.find(p => p.type === perm.type)?.color || "rgba(255,255,255,0.2)";
            ctx.fillStyle = color;
            ctx.fillRect(perm.x * tileSize, perm.y * tileSize, tileSize, tileSize);
        }
    }, [width, height, tileSize, layers, permissions]);

    // Handle painting permissions
    const getTileCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / tileSize);
        const y = Math.floor((e.clientY - rect.top) / tileSize);
        return { x, y };
    };

    const paintPermission = (x: number, y: number) => {
        if (x < 0 || x >= width || y < 0 || y >= height) return;
        const idx = permissions.findIndex(p => p.x === x && p.y === y);
        if (idx === -1) {
            setPermissions([...permissions, { x, y, type: selectedType }]);
        } else {
            const updated = [...permissions];
            updated[idx] = { x, y, type: selectedType };
            setPermissions(updated);
        }
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setIsDrawing(true);
        const { x, y } = getTileCoords(e);
        paintPermission(x, y);
    };
    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const { x, y } = getTileCoords(e);
        paintPermission(x, y);
    };
    const handleMouseUp = () => setIsDrawing(false);
    const handleMouseLeave = () => setIsDrawing(false);

    return (
        <div className="space-y-4">
            <div className="flex space-x-2">
                {permissionTypes.map((perm) => (
                    <div key={perm.type} className="flex flex-col items-center">
                        <button
                            onClick={() => setSelectedType(perm.type as any)}
                            className={`px-3 py-1 rounded-md text-sm font-medium border transition-colors
                                ${selectedType === perm.type
                                    ? "border-yellow-400 text-yellow-300"
                                    : "border-transparent text-slate-200"}
                            `}
                        >
                            {perm.label}
                        </button>
                        <div
                            className="mt-1 w-8 h-2 rounded"
                            style={{ background: perm.color, border: "1px solid #222" }}
                        />
                    </div>
                ))}
            </div>
            <Card className="p-4 bg-slate-900">
                <canvas
                    ref={canvasRef}
                    style={{ cursor: "crosshair" }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                />
            </Card>
        </div>
    );
};

export default PermissionView; 