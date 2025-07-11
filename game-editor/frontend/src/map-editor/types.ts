export interface Tile {
  id: string;
  name: string;
  image: string;
  width?: number;
  height?: number;
  subTiles?: string[][];
}

export interface MapTile {
  x: number;
  y: number;
  tileId: string;
  autoTileId?: string;
}

export interface MapLayer {
  id: number;
  name: string;
  visible: boolean;
  locked?: boolean;
  tiles: MapTile[];
}

export interface MapPermission {
  x: number;
  y: number;
  type: "walkable" | "blocked" | "water" | "grass";
}

export interface MapNPC {
  id: string;
  name: string;
  x: number;
  y: number;
  sprite: string;
  direction: "up" | "down" | "left" | "right";
  script?: string;
}

export interface MapEncounter {
  id: string;
  name: string;
  type: "grass" | "water" | "cave" | "fishing";
  pokemon: Array<{
    name: string;
    level: number;
    chance: number;
  }>;
  minLevel: number;
  maxLevel: number;
}

export interface MapData {
  id: string;
  name: string;
  width: number;
  height: number;
  tileSize: number;
  type: string;
  tileset: string;
  layers: MapLayer[];
  permissions: MapPermission[];
  npcs: MapNPC[];
  encounters: MapEncounter[];
  properties?: {
    weather?: string;
    timeOfDay?: string;
    encounterRate?: number;
    music?: string;
    description?: string;
    [key: string]: any;
  };
}

export interface CreateMapData {
  width: number;
  height: number;
  type: string;
  tileset: string;
  mapName: string;
  description?: string;
  music?: string;
  weather?: string;
  timeOfDay?: string;
  encounterRate?: number;
  properties?: Record<string, any>;
}

export interface CreateTilesetData {
  name: string;
  tileSize: number;
  description?: string;
  imageData?: string; // Base64 data URL
  imageWidth?: number;
  imageHeight?: number;
}

export interface MapViewProps {
  width: number;
  height: number;
  tileSize: number;
  selectedTile: Tile | null;
  selectedAutoTile: Tile | null;
  layers: MapLayer[];
  setLayers: (layers: MapLayer[]) => void;
  activeLayerId: number;
  paintMode: 'stamp' | 'fill' | 'remove';
}

export interface MapEditorViewProps {
  map: MapData;
  onMapChange: (map: MapData) => void;
  onBack: () => void;
}