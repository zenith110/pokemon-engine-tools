import { useRef, useState } from "react";
import { Eye, EyeOff, Lock, LockOpen, Plus, Trash2 } from "lucide-react"
import { Button } from "../../components/ui/button"
import { ScrollArea } from "../../components/ui/scroll-area"

interface Layer {
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
}

interface LayerPanelProps {
    layers: Layer[];
    setLayers: (layers: Layer[]) => void;
    activeLayerId: number;
    setActiveLayerId: (id: number) => void;
}

const LayerPanel = ({ layers, setLayers, activeLayerId, setActiveLayerId }: LayerPanelProps) => {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [editingLayerId, setEditingLayerId] = useState<number | null>(null);
    const [editName, setEditName] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const toggleLayerVisibility = (layerId: number) => {
        setLayers(layers.map(layer => 
            layer.id === layerId 
                ? { ...layer, visible: !layer.visible }
                : layer
        ));
    };

    const toggleLayerLock = (layerId: number) => {
        setLayers(layers.map(layer => 
            layer.id === layerId 
                ? { ...layer, locked: !layer.locked }
                : layer
        ));
    };

    const addNewLayer = () => {
        const newLayer: Layer = {
            id: Math.max(...layers.map(l => l.id)) + 1,
            name: `Layer ${layers.length + 1}`,
            visible: true,
            locked: false,
            tiles: []
        };
        setLayers([...layers, newLayer]);
        setActiveLayerId(newLayer.id);
    };

    const deleteLayer = (layerId: number) => {
        if (layers.length > 1) {
            setLayers(layers.filter(layer => layer.id !== layerId));
            if (activeLayerId === layerId) {
                const remainingLayers = layers.filter(layer => layer.id !== layerId);
                setActiveLayerId(remainingLayers[0].id);
            }
        }
    };

    // Drag and drop handlers
    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };
    const handleDragOver = (index: number, e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOverIndex(index);
    };
    const handleDrop = (index: number) => {
        if (draggedIndex === null || draggedIndex === index) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }
        const newLayers = [...layers];
        const [removed] = newLayers.splice(draggedIndex, 1);
        newLayers.splice(index, 0, removed);
        setLayers(newLayers);
        setDraggedIndex(null);
        setDragOverIndex(null);
    };
    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    // Rename logic
    const handleNameDoubleClick = (layer: Layer) => {
        setEditingLayerId(layer.id);
        setEditName(layer.name);
        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    };
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditName(e.target.value);
    };
    const finishEdit = (layer: Layer) => {
        if (editName.trim() && editName !== layer.name) {
            setLayers(layers.map(l => l.id === layer.id ? { ...l, name: editName.trim() } : l));
        }
        setEditingLayerId(null);
    };
    const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, layer: Layer) => {
        if (e.key === "Enter") {
            finishEdit(layer);
        } else if (e.key === "Escape") {
            setEditingLayerId(null);
        }
    };

    return (
        <div className="space-y-4 border border-slate-600 bg-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Layers</h3>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={addNewLayer}
                    className="h-8 w-8 p-0"
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            <ScrollArea className="h-[calc(100vh-12rem)]">
                <div className="space-y-2">
                    {layers.map((layer, idx) => (
                        <div
                            key={layer.id}
                            className={`flex items-center justify-between p-2 rounded-md group transition-colors cursor-pointer ${
                                layer.id === activeLayerId 
                                    ? 'bg-yellow-900/50 border border-yellow-500/50' 
                                    : 'bg-slate-700 hover:bg-slate-600'
                            } ${dragOverIndex === idx ? 'ring-2 ring-blue-400' : ''}`}
                            onClick={() => setActiveLayerId(layer.id)}
                            draggable
                            onDragStart={() => handleDragStart(idx)}
                            onDragOver={e => handleDragOver(idx, e)}
                            onDrop={() => handleDrop(idx)}
                            onDragEnd={handleDragEnd}
                        >
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={e => { e.stopPropagation(); toggleLayerVisibility(layer.id); }}
                                    className="text-slate-300 hover:text-white"
                                >
                                    {layer.visible ? (
                                        <Eye className="h-4 w-4" />
                                    ) : (
                                        <EyeOff className="h-4 w-4" />
                                    )}
                                </button>
                                <button
                                    onClick={e => { e.stopPropagation(); toggleLayerLock(layer.id); }}
                                    className="text-slate-300 hover:text-white"
                                >
                                    {layer.locked ? (
                                        <Lock className="h-4 w-4" />
                                    ) : (
                                        <LockOpen className="h-4 w-4" />
                                    )}
                                </button>
                                {editingLayerId === layer.id ? (
                                    <input
                                        ref={inputRef}
                                        value={editName}
                                        onChange={handleNameChange}
                                        onBlur={() => finishEdit(layer)}
                                        onKeyDown={e => handleNameKeyDown(e, layer)}
                                        className={`text-sm px-1 py-0.5 rounded bg-slate-600 text-yellow-400 border border-yellow-400 outline-none w-28`}
                                    />
                                ) : (
                                    <span
                                        className={`text-sm font-medium select-none ${
                                            layer.id === activeLayerId 
                                                ? 'text-yellow-300' 
                                                : 'text-slate-200'
                                        }`}
                                        onDoubleClick={e => { e.stopPropagation(); handleNameDoubleClick(layer); }}
                                    >
                                        {layer.name}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={e => { e.stopPropagation(); deleteLayer(layer.id); }}
                                className="text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
};

export default LayerPanel; 