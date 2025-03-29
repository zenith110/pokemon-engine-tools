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
}

const LayerPanel = ({ layers, setLayers }: LayerPanelProps) => {
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
    };

    const deleteLayer = (layerId: number) => {
        if (layers.length > 1) {
            setLayers(layers.filter(layer => layer.id !== layerId));
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Layers</h3>
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
                    {layers.map((layer) => (
                        <div
                            key={layer.id}
                            className="flex items-center justify-between p-2 bg-slate-800 rounded-md group"
                        >
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => toggleLayerVisibility(layer.id)}
                                    className="text-slate-400 hover:text-slate-300"
                                >
                                    {layer.visible ? (
                                        <Eye className="h-4 w-4" />
                                    ) : (
                                        <EyeOff className="h-4 w-4" />
                                    )}
                                </button>
                                <button
                                    onClick={() => toggleLayerLock(layer.id)}
                                    className="text-slate-400 hover:text-slate-300"
                                >
                                    {layer.locked ? (
                                        <Lock className="h-4 w-4" />
                                    ) : (
                                        <LockOpen className="h-4 w-4" />
                                    )}
                                </button>
                                <span className="text-sm text-slate-300">
                                    {layer.name}
                                </span>
                            </div>
                            <button
                                onClick={() => deleteLayer(layer.id)}
                                className="text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
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