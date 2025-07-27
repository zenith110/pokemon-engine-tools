import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Link, X } from "lucide-react";
import { GetAllMaps } from "../../../bindings/github.com/zenith110/pokemon-engine-tools/parsing/ParsingApp";

interface MapConnection {
  direction: "up" | "down" | "left" | "right";
  mapId: number;
  mapName: string;
}

interface MapConnectionDialogProps {
  currentMapId: number;
  currentMapName: string;
  onConnectionsChange: (connections: MapConnection[]) => void;
  existingConnections?: MapConnection[];
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface Map {
  ID: number;
  Name: string;
  Width: number;
  Height: number;
}

const MapConnectionDialog = ({
  currentMapId,
  currentMapName,
  onConnectionsChange,
  existingConnections = [],
  trigger,
  open,
  onOpenChange
}: MapConnectionDialogProps) => {
  const [internalDialogOpen, setInternalDialogOpen] = useState(false);
  const dialogOpen = open !== undefined ? open : internalDialogOpen;
  const setDialogOpen = onOpenChange || setInternalDialogOpen;
  const [maps, setMaps] = useState<Map[]>([]);
  const [connections, setConnections] = useState<MapConnection[]>(existingConnections);
  const [selectedDirection, setSelectedDirection] = useState<"up" | "down" | "left" | "right" | null>(null);

  useEffect(() => {
    const loadMaps = async () => {
      try {
        const allMaps = await GetAllMaps();
        // Filter out the current map from the list
        const availableMaps = allMaps.filter(map => map.ID !== currentMapId);
        setMaps(availableMaps);
      } catch (error) {
        console.error('Error loading maps:', error);
      }
    };
    loadMaps();
  }, [currentMapId]);

  const handleDirectionClick = (direction: "up" | "down" | "left" | "right") => {
    setSelectedDirection(direction);
  };

  const handleMapSelect = (mapId: string) => {
    if (!selectedDirection) return;
    
    const selectedMap = maps.find(map => map.ID.toString() === mapId);
    if (!selectedMap) return;

    // Remove any existing connection in this direction
    const updatedConnections = connections.filter(conn => conn.direction !== selectedDirection);
    
    // Add the new connection
    const newConnection: MapConnection = {
      direction: selectedDirection,
      mapId: selectedMap.ID,
      mapName: selectedMap.Name
    };
    
    const newConnections = [...updatedConnections, newConnection];
    setConnections(newConnections);
    setSelectedDirection(null);
  };

  const removeConnection = (direction: "up" | "down" | "left" | "right") => {
    const updatedConnections = connections.filter(conn => conn.direction !== direction);
    setConnections(updatedConnections);
  };

  const handleSave = () => {
    onConnectionsChange(connections);
    setDialogOpen(false);
  };

  const handleCancel = () => {
    setConnections(existingConnections);
    setSelectedDirection(null);
    setDialogOpen(false);
  };

  const getConnectionForDirection = (direction: "up" | "down" | "left" | "right") => {
    return connections.find(conn => conn.direction === direction);
  };

  const isDirectionSelected = (direction: "up" | "down" | "left" | "right") => {
    return selectedDirection === direction;
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">
            Connect Maps - {currentMapName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col h-full space-y-6">
          {/* Map Grid Visualization */}
          <div className="flex justify-center">
            <div className="relative">
              {/* Up Connection */}
              <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
                <div className={`p-4 rounded-lg border-2 transition-colors ${
                  isDirectionSelected("up") 
                    ? "border-blue-500 bg-blue-500/20" 
                    : getConnectionForDirection("up")
                    ? "border-green-500 bg-green-500/20"
                    : "border-slate-600 bg-slate-800"
                }`}>
                  <div className="flex items-center gap-2">
                    <ArrowUp className="h-6 w-6" />
                    {getConnectionForDirection("up") ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{getConnectionForDirection("up")?.mapName}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeConnection("up")}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">No connection</span>
                    )}
                  </div>
                  {isDirectionSelected("up") && (
                    <Select onValueChange={handleMapSelect}>
                      <SelectTrigger className="mt-2 bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Select map..." />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {maps.map((map) => (
                          <SelectItem key={map.ID} value={map.ID.toString()} className="text-white">
                            {map.Name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <Button
                  variant="ghost"
                  onClick={() => handleDirectionClick("up")}
                  className="mt-2 w-full"
                  disabled={isDirectionSelected("up")}
                >
                  Connect Up
                </Button>
              </div>

              {/* Left Connection */}
              <div className="absolute top-1/2 -left-32 transform -translate-y-1/2">
                <div className={`p-4 rounded-lg border-2 transition-colors ${
                  isDirectionSelected("left") 
                    ? "border-blue-500 bg-blue-500/20" 
                    : getConnectionForDirection("left")
                    ? "border-green-500 bg-green-500/20"
                    : "border-slate-600 bg-slate-800"
                }`}>
                  <div className="flex items-center gap-2">
                    <ArrowLeft className="h-6 w-6" />
                    {getConnectionForDirection("left") ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{getConnectionForDirection("left")?.mapName}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeConnection("left")}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">No connection</span>
                    )}
                  </div>
                  {isDirectionSelected("left") && (
                    <Select onValueChange={handleMapSelect}>
                      <SelectTrigger className="mt-2 bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Select map..." />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {maps.map((map) => (
                          <SelectItem key={map.ID} value={map.ID.toString()} className="text-white">
                            {map.Name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <Button
                  variant="ghost"
                  onClick={() => handleDirectionClick("left")}
                  className="mt-2 w-full"
                  disabled={isDirectionSelected("left")}
                >
                  Connect Left
                </Button>
              </div>

              {/* Center Map */}
              <div className="w-32 h-32 bg-slate-700 border-2 border-slate-500 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-sm font-semibold">{currentMapName}</div>
                  <div className="text-xs text-slate-400">Current Map</div>
                </div>
              </div>

              {/* Right Connection */}
              <div className="absolute top-1/2 -right-32 transform -translate-y-1/2">
                <div className={`p-4 rounded-lg border-2 transition-colors ${
                  isDirectionSelected("right") 
                    ? "border-blue-500 bg-blue-500/20" 
                    : getConnectionForDirection("right")
                    ? "border-green-500 bg-green-500/20"
                    : "border-slate-600 bg-slate-800"
                }`}>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-6 w-6" />
                    {getConnectionForDirection("right") ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{getConnectionForDirection("right")?.mapName}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeConnection("right")}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">No connection</span>
                    )}
                  </div>
                  {isDirectionSelected("right") && (
                    <Select onValueChange={handleMapSelect}>
                      <SelectTrigger className="mt-2 bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Select map..." />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {maps.map((map) => (
                          <SelectItem key={map.ID} value={map.ID.toString()} className="text-white">
                            {map.Name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <Button
                  variant="ghost"
                  onClick={() => handleDirectionClick("right")}
                  className="mt-2 w-full"
                  disabled={isDirectionSelected("right")}
                >
                  Connect Right
                </Button>
              </div>

              {/* Down Connection */}
              <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                <div className={`p-4 rounded-lg border-2 transition-colors ${
                  isDirectionSelected("down") 
                    ? "border-blue-500 bg-blue-500/20" 
                    : getConnectionForDirection("down")
                    ? "border-green-500 bg-green-500/20"
                    : "border-slate-600 bg-slate-800"
                }`}>
                  <div className="flex items-center gap-2">
                    <ArrowDown className="h-6 w-6" />
                    {getConnectionForDirection("down") ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{getConnectionForDirection("down")?.mapName}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeConnection("down")}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">No connection</span>
                    )}
                  </div>
                  {isDirectionSelected("down") && (
                    <Select onValueChange={handleMapSelect}>
                      <SelectTrigger className="mt-2 bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Select map..." />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {maps.map((map) => (
                          <SelectItem key={map.ID} value={map.ID.toString()} className="text-white">
                            {map.Name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <Button
                  variant="ghost"
                  onClick={() => handleDirectionClick("down")}
                  className="mt-2 w-full"
                  disabled={isDirectionSelected("down")}
                >
                  Connect Down
                </Button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-center text-slate-400 text-sm">
            <p>Click on a direction button to connect a map, then select the target map from the dropdown.</p>
            <p>Connected maps will be highlighted in green.</p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              Save Connections
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MapConnectionDialog; 