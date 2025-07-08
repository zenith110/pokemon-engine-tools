export interface MapData {
    id: string;
    name: string;
    width: number;
    height: number;
    tileSize: number;
    type: string;
    tileset: string;
    tilesetImage: string;
    layers: Array<{
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
    }>;
    permissions: Array<{
        x: number;
        y: number;
        type: "walkable" | "blocked" | "water" | "grass";
    }>;
    npcs: Array<{
        id: string;
        name: string;
        x: number;
        y: number;
        sprite: string;
        direction: "up" | "down" | "left" | "right";
        script?: string;
    }>;
} 