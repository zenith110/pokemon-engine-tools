import { useState, useEffect } from "react";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Settings, Music, Map, Type } from "lucide-react";
import { GrabMusicTracks } from "../../../../bindings/github.com/zenith110/pokemon-engine-tools/parsing/ParsingApp";
import { Song } from "../../../models/song";

interface SettingsViewProps {
  mapData: {
    name?: string;
    width: number;
    height: number;
    tileSize: number;
    type?: string;
    music?: string;
  };
  onSettingsChange: (settings: {
    name: string;
    width: number;
    height: number;
    tileSize: number;
    type: string;
    music: string;
  }) => void;
}

const mapTypes = [
  { value: "overworld", label: "Overworld" },
  { value: "town", label: "Town" },
  { value: "route", label: "Route" },
  { value: "cave", label: "Cave" },
  { value: "building", label: "Building" },
  { value: "dungeon", label: "Dungeon" },
  { value: "forest", label: "Forest" },
  { value: "beach", label: "Beach" },
  { value: "mountain", label: "Mountain" },
  { value: "city", label: "City" },
  { value: "gym", label: "Gym" },
  { value: "pokemon-center", label: "Pokemon Center" },
  { value: "mart", label: "Mart" },
  { value: "other", label: "Other" },
];

const tileSizes = [
  { value: 16, label: "16x16" },
  { value: 24, label: "24x24" },
  { value: 32, label: "32x32" },
  { value: 48, label: "48x48" },
  { value: 64, label: "64x64" },
];

const SettingsView = ({ mapData, onSettingsChange }: SettingsViewProps) => {
  const [musicTracks, setMusicTracks] = useState<Song[]>([]);
  const [settings, setSettings] = useState({
    name: mapData.name || "",
    width: mapData.width,
    height: mapData.height,
    tileSize: mapData.tileSize,
    type: mapData.type || "overworld",
    music: mapData.music || "",
  });

  useEffect(() => {
    const loadMusicTracks = async () => {
      try {
        const tracks = await GrabMusicTracks();
        setMusicTracks(tracks);
      } catch (error) {
        console.error('Error loading music tracks:', error);
      }
    };
    loadMusicTracks();
  }, []);

  const updateSetting = (field: keyof typeof settings, value: string | number) => {
    // Validate map dimensions
    if (field === "width" && (value as number) > 200) {
      value = 200;
    }
    if (field === "height" && (value as number) > 200) {
      value = 200;
    }
    
    const newSettings = { ...settings, [field]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-6 w-6 text-blue-500" />
        <h2 className="text-2xl font-bold text-white">Map Settings</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Map className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white text-sm">Map Name</Label>
              <Input
                value={settings.name}
                onChange={(e) => updateSetting("name", e.target.value)}
                placeholder="Enter map name..."
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white text-sm">Map Type</Label>
              <Select value={settings.type} onValueChange={(value) => updateSetting("type", value)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select map type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {mapTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="text-white">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Map Dimensions */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Type className="h-5 w-5" />
              Map Dimensions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white text-sm">Width</Label>
                <Input
                  type="number"
                  min="1"
                  max="200"
                  value={settings.width}
                  onChange={(e) => updateSetting("width", parseInt(e.target.value) || 1)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white text-sm">Height</Label>
                <Input
                  type="number"
                  min="1"
                  max="200"
                  value={settings.height}
                  onChange={(e) => updateSetting("height", parseInt(e.target.value) || 1)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white text-sm">Tile Size</Label>
              <Select value={settings.tileSize.toString()} onValueChange={(value) => updateSetting("tileSize", parseInt(value))}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select tile size" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {tileSizes.map((size) => (
                    <SelectItem key={size.value} value={size.value.toString()} className="text-white">
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-xs text-slate-400">
              Map size: {settings.width * settings.tileSize} × {settings.height * settings.tileSize} pixels
            </div>
          </CardContent>
        </Card>

        {/* Audio Settings */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Music className="h-5 w-5" />
              Audio Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white text-sm">Background Music</Label>
              <Select value={settings.music || "none"} onValueChange={(value) => updateSetting("music", value === "none" ? "" : value)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select background music (optional)" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="none" className="text-white">
                    No Music
                  </SelectItem>
                  {musicTracks.map((track) => (
                    <SelectItem key={track.ID} value={track.Name} className="text-white">
                      {track.Name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-400">
                Select a music track from your available audio files
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Map Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-slate-300">
              <div><strong>Name:</strong> {settings.name || "Unnamed Map"}</div>
              <div><strong>Type:</strong> {mapTypes.find(t => t.value === settings.type)?.label || "Other"}</div>
              <div><strong>Dimensions:</strong> {settings.width} × {settings.height} tiles</div>
              <div><strong>Tile Size:</strong> {settings.tileSize}px</div>
              <div><strong>Music:</strong> {settings.music || "None"}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsView; 