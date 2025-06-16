import { Eye, EyeOff, Lock, LockOpen, Plus, Trash2, Check } from "lucide-react"
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
                            className={`flex items-center justify-between p-2 rounded-md group transition-colors ${
                                layer.id === activeLayerId 
                                    ? 'bg-yellow-900/50 border border-yellow-500/50' 
                                    : 'bg-slate-800 hover:bg-slate-700'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setActiveLayerId(layer.id)}
                                    className={`p-1 rounded hover:bg-slate-600 transition-colors ${
                                        layer.id === activeLayerId ? 'text-yellow-400' : 'text-slate-400'
                                    }`}
                                >
                                    <Check className="h-4 w-4" />
                                </button>
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
                                <span className={`text-sm ${
                                    layer.id === activeLayerId ? 'text-yellow-400' : 'text-slate-300'
                                }`}>
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