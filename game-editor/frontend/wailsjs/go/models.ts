export namespace models {
	
	export class Abilities {
	    Name: string;
	    IsHidden: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Abilities(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.IsHidden = source["IsHidden"];
	    }
	}
	export class Effects {
	    EffectText: string;
	
	    static createFrom(source: any = {}) {
	        return new Effects(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.EffectText = source["EffectText"];
	    }
	}
	export class Descriptions {
	    Description: string;
	
	    static createFrom(source: any = {}) {
	        return new Descriptions(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Description = source["Description"];
	    }
	}
	export class Move {
	    Name: string;
	    Power: number;
	    Pp: number;
	    Accuracy: number;
	    Type: string;
	    KindOfMove: string;
	    ID: number;
	    Descriptions: Descriptions[];
	    Effects: Effects[];
	
	    static createFrom(source: any = {}) {
	        return new Move(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.Power = source["Power"];
	        this.Pp = source["Pp"];
	        this.Accuracy = source["Accuracy"];
	        this.Type = source["Type"];
	        this.KindOfMove = source["KindOfMove"];
	        this.ID = source["ID"];
	        this.Descriptions = this.convertValues(source["Descriptions"], Descriptions);
	        this.Effects = this.convertValues(source["Effects"], Effects);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class AllMoves {
	    Move: Move[];
	
	    static createFrom(source: any = {}) {
	        return new AllMoves(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Move = this.convertValues(source["Move"], Move);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class CaveEncounters {
	    Name: string;
	    ID: string;
	    MinLevel: number;
	    MaxLevel: number;
	    Rarity: number;
	    Shiny: boolean;
	    TimeOfDayToCatch: string;
	
	    static createFrom(source: any = {}) {
	        return new CaveEncounters(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.ID = source["ID"];
	        this.MinLevel = source["MinLevel"];
	        this.MaxLevel = source["MaxLevel"];
	        this.Rarity = source["Rarity"];
	        this.Shiny = source["Shiny"];
	        this.TimeOfDayToCatch = source["TimeOfDayToCatch"];
	    }
	}
	export class CreateNewTileset {
	    tilesetHeight: number;
	    tilesetWidth: number;
	    nameOfTileset: string;
	    tilesetDescription: string;
	    typeOfTileset: string;
	    fileName: string;
	
	    static createFrom(source: any = {}) {
	        return new CreateNewTileset(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tilesetHeight = source["tilesetHeight"];
	        this.tilesetWidth = source["tilesetWidth"];
	        this.nameOfTileset = source["nameOfTileset"];
	        this.tilesetDescription = source["tilesetDescription"];
	        this.typeOfTileset = source["typeOfTileset"];
	        this.fileName = source["fileName"];
	    }
	}
	export class Data {
	    Name: string;
	    Music: string;
	
	    static createFrom(source: any = {}) {
	        return new Data(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.Music = source["Music"];
	    }
	}
	
	
	export class Evolution {
	    Name: string;
	    FrontSprite: string;
	    BackSprite: string;
	    ShinyFront: string;
	    ShinyBack: string;
	    Icon: string;
	    ID: string;
	    Method1: string;
	    Method2: string;
	
	    static createFrom(source: any = {}) {
	        return new Evolution(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.FrontSprite = source["FrontSprite"];
	        this.BackSprite = source["BackSprite"];
	        this.ShinyFront = source["ShinyFront"];
	        this.ShinyBack = source["ShinyBack"];
	        this.Icon = source["Icon"];
	        this.ID = source["ID"];
	        this.Method1 = source["Method1"];
	        this.Method2 = source["Method2"];
	    }
	}
	export class FishingEncounters {
	    Name: string;
	    ID: string;
	    MinLevel: number;
	    MaxLevel: number;
	    Rarity: number;
	    Shiny: boolean;
	    TimeOfDayToCatch: string;
	
	    static createFrom(source: any = {}) {
	        return new FishingEncounters(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.ID = source["ID"];
	        this.MinLevel = source["MinLevel"];
	        this.MaxLevel = source["MaxLevel"];
	        this.Rarity = source["Rarity"];
	        this.Shiny = source["Shiny"];
	        this.TimeOfDayToCatch = source["TimeOfDayToCatch"];
	    }
	}
	export class GrassEncounters {
	    Name: string;
	    ID: string;
	    MinLevel: number;
	    MaxLevel: number;
	    Rarity: number;
	    Shiny: boolean;
	    TimeOfDayToCatch: string;
	
	    static createFrom(source: any = {}) {
	        return new GrassEncounters(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.ID = source["ID"];
	        this.MinLevel = source["MinLevel"];
	        this.MaxLevel = source["MaxLevel"];
	        this.Rarity = source["Rarity"];
	        this.Shiny = source["Shiny"];
	        this.TimeOfDayToCatch = source["TimeOfDayToCatch"];
	    }
	}
	export class HeldItem {
	    Name: string;
	
	    static createFrom(source: any = {}) {
	        return new HeldItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	    }
	}
	export class WaterEncounters {
	    Name: string;
	    ID: string;
	    MinLevel: number;
	    MaxLevel: number;
	    Rarity: number;
	    Shiny: boolean;
	    TimeOfDayToCatch: string;
	
	    static createFrom(source: any = {}) {
	        return new WaterEncounters(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.ID = source["ID"];
	        this.MinLevel = source["MinLevel"];
	        this.MaxLevel = source["MaxLevel"];
	        this.Rarity = source["Rarity"];
	        this.Shiny = source["Shiny"];
	        this.TimeOfDayToCatch = source["TimeOfDayToCatch"];
	    }
	}
	export class Properties {
	    TilesetImagePath: string;
	    FilePath: string;
	    TypeOfMap: string;
	    BgMusic: string;
	    Description: string;
	
	    static createFrom(source: any = {}) {
	        return new Properties(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.TilesetImagePath = source["TilesetImagePath"];
	        this.FilePath = source["FilePath"];
	        this.TypeOfMap = source["TypeOfMap"];
	        this.BgMusic = source["BgMusic"];
	        this.Description = source["Description"];
	    }
	}
	export class Map {
	    Name: string;
	    ID: number;
	    Width: number;
	    Height: number;
	    TileSize: number;
	    Properties: Properties[];
	    GrassEncounters: GrassEncounters[];
	    WaterEncounters: WaterEncounters[];
	    CaveEncounters: CaveEncounters[];
	    FishingEncounters: FishingEncounters[];
	
	    static createFrom(source: any = {}) {
	        return new Map(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.ID = source["ID"];
	        this.Width = source["Width"];
	        this.Height = source["Height"];
	        this.TileSize = source["TileSize"];
	        this.Properties = this.convertValues(source["Properties"], Properties);
	        this.GrassEncounters = this.convertValues(source["GrassEncounters"], GrassEncounters);
	        this.WaterEncounters = this.convertValues(source["WaterEncounters"], WaterEncounters);
	        this.CaveEncounters = this.convertValues(source["CaveEncounters"], CaveEncounters);
	        this.FishingEncounters = this.convertValues(source["FishingEncounters"], FishingEncounters);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class MapEditerMapData {
	    Map: Map[];
	
	    static createFrom(source: any = {}) {
	        return new MapEditerMapData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Map = this.convertValues(source["Map"], Map);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class MapEncounter {
	    minLevel: number;
	    maxLevel: number;
	    pokemonName: string;
	    pokemonId: string;
	
	    static createFrom(source: any = {}) {
	        return new MapEncounter(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.minLevel = source["minLevel"];
	        this.maxLevel = source["maxLevel"];
	        this.pokemonName = source["pokemonName"];
	        this.pokemonId = source["pokemonId"];
	    }
	}
	export class MapEncounters {
	    grass: MapEncounter[];
	    fishing: MapEncounter[];
	    cave: MapEncounter[];
	    diving: MapEncounter[];
	
	    static createFrom(source: any = {}) {
	        return new MapEncounters(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.grass = this.convertValues(source["grass"], MapEncounter);
	        this.fishing = this.convertValues(source["fishing"], MapEncounter);
	        this.cave = this.convertValues(source["cave"], MapEncounter);
	        this.diving = this.convertValues(source["diving"], MapEncounter);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class MapProperties {
	    music: string;
	
	    static createFrom(source: any = {}) {
	        return new MapProperties(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.music = source["music"];
	    }
	}
	export class MapTile {
	    x: number;
	    y: number;
	    tileId: string;
	    autoTileId?: string;
	
	    static createFrom(source: any = {}) {
	        return new MapTile(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.x = source["x"];
	        this.y = source["y"];
	        this.tileId = source["tileId"];
	        this.autoTileId = source["autoTileId"];
	    }
	}
	export class MapLayer {
	    id: number;
	    name: string;
	    visible: boolean;
	    locked?: boolean;
	    tiles: MapTile[];
	
	    static createFrom(source: any = {}) {
	        return new MapLayer(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.visible = source["visible"];
	        this.locked = source["locked"];
	        this.tiles = this.convertValues(source["tiles"], MapTile);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class MapJsonData {
	    id: number;
	    name: string;
	    width: number;
	    height: number;
	    tileSize: number;
	    type: string;
	    tilesetPath: string;
	    layers: MapLayer[];
	    currentlySelectedLayer: string;
	    mapEncounters: MapEncounters;
	    properties: MapProperties;
	
	    static createFrom(source: any = {}) {
	        return new MapJsonData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.width = source["width"];
	        this.height = source["height"];
	        this.tileSize = source["tileSize"];
	        this.type = source["type"];
	        this.tilesetPath = source["tilesetPath"];
	        this.layers = this.convertValues(source["layers"], MapLayer);
	        this.currentlySelectedLayer = source["currentlySelectedLayer"];
	        this.mapEncounters = this.convertValues(source["mapEncounters"], MapEncounters);
	        this.properties = this.convertValues(source["properties"], MapProperties);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	
	
	export class Moves {
	    Name: string;
	    Level: number;
	    Method: string;
	
	    static createFrom(source: any = {}) {
	        return new Moves(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.Level = source["Level"];
	        this.Method = source["Method"];
	    }
	}
	export class OverworldDirectionFrame {
	    Direction: string;
	    FrameNumber: string;
	    Path: string;
	    Sprite: string;
	
	    static createFrom(source: any = {}) {
	        return new OverworldDirectionFrame(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Direction = source["Direction"];
	        this.FrameNumber = source["FrameNumber"];
	        this.Path = source["Path"];
	        this.Sprite = source["Sprite"];
	    }
	}
	export class OverworldDataJson {
	    ID: string;
	    OverworldId: string;
	    SwimmingFrames: OverworldDirectionFrame[];
	    RunningFrames: OverworldDirectionFrame[];
	    WalkingFrames: OverworldDirectionFrame[];
	    IsPlayer: boolean;
	    SurfingFrames: OverworldDirectionFrame[];
	    Name: string;
	
	    static createFrom(source: any = {}) {
	        return new OverworldDataJson(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ID = source["ID"];
	        this.OverworldId = source["OverworldId"];
	        this.SwimmingFrames = this.convertValues(source["SwimmingFrames"], OverworldDirectionFrame);
	        this.RunningFrames = this.convertValues(source["RunningFrames"], OverworldDirectionFrame);
	        this.WalkingFrames = this.convertValues(source["WalkingFrames"], OverworldDirectionFrame);
	        this.IsPlayer = source["IsPlayer"];
	        this.SurfingFrames = this.convertValues(source["SurfingFrames"], OverworldDirectionFrame);
	        this.Name = source["Name"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class PokemonJson {
	    species: string;
	    level: number;
	    hp: number;
	    attack: number;
	    defense: number;
	    speed: number;
	    specialAttack: number;
	    specialDefense: number;
	    moves: string[];
	    heldItem: string;
	    id: string;
	    front: string;
	    icon: string;
	    cry: string;
	
	    static createFrom(source: any = {}) {
	        return new PokemonJson(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.species = source["species"];
	        this.level = source["level"];
	        this.hp = source["hp"];
	        this.attack = source["attack"];
	        this.defense = source["defense"];
	        this.speed = source["speed"];
	        this.specialAttack = source["specialAttack"];
	        this.specialDefense = source["specialDefense"];
	        this.moves = source["moves"];
	        this.heldItem = source["heldItem"];
	        this.id = source["id"];
	        this.front = source["front"];
	        this.icon = source["icon"];
	        this.cry = source["cry"];
	    }
	}
	export class PokemonTrainerEditor {
	    Name: string;
	    FrontSprite: string;
	    BackSprite: string;
	    ShinyFront: string;
	    ShinyBack: string;
	    Icon: string;
	    HP: number;
	    Defense: number;
	    SpecialAttack: number;
	    Speed: number;
	    SpecialDefense: number;
	    Attack: number;
	    Moves: Moves[];
	    ID: string;
	    Abilities: Abilities[];
	    Evolutions: Evolution[];
	    Types: string[];
	    Cry: string;
	
	    static createFrom(source: any = {}) {
	        return new PokemonTrainerEditor(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.FrontSprite = source["FrontSprite"];
	        this.BackSprite = source["BackSprite"];
	        this.ShinyFront = source["ShinyFront"];
	        this.ShinyBack = source["ShinyBack"];
	        this.Icon = source["Icon"];
	        this.HP = source["HP"];
	        this.Defense = source["Defense"];
	        this.SpecialAttack = source["SpecialAttack"];
	        this.Speed = source["Speed"];
	        this.SpecialDefense = source["SpecialDefense"];
	        this.Attack = source["Attack"];
	        this.Moves = this.convertValues(source["Moves"], Moves);
	        this.ID = source["ID"];
	        this.Abilities = this.convertValues(source["Abilities"], Abilities);
	        this.Evolutions = this.convertValues(source["Evolutions"], Evolution);
	        this.Types = source["Types"];
	        this.Cry = source["Cry"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Project {
	    Name: string;
	    FolderLocation: string;
	    VersionOfEngine: string;
	    CreatedDateTime: string;
	    LastUsed: string;
	    ID: string;
	
	    static createFrom(source: any = {}) {
	        return new Project(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.FolderLocation = source["FolderLocation"];
	        this.VersionOfEngine = source["VersionOfEngine"];
	        this.CreatedDateTime = source["CreatedDateTime"];
	        this.LastUsed = source["LastUsed"];
	        this.ID = source["ID"];
	    }
	}
	export class ProjectCreation {
	    name: string;
	    id: string;
	    directory: string;
	
	    static createFrom(source: any = {}) {
	        return new ProjectCreation(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.id = source["id"];
	        this.directory = source["directory"];
	    }
	}
	export class ProjectSelect {
	    CreatedDateTime: string;
	    FolderLocation: string;
	    ID: string;
	    LastUsed: string;
	    Name: string;
	    VersionOfEngine: string;
	
	    static createFrom(source: any = {}) {
	        return new ProjectSelect(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.CreatedDateTime = source["CreatedDateTime"];
	        this.FolderLocation = source["FolderLocation"];
	        this.ID = source["ID"];
	        this.LastUsed = source["LastUsed"];
	        this.Name = source["Name"];
	        this.VersionOfEngine = source["VersionOfEngine"];
	    }
	}
	
	export class Song {
	    Name: string;
	    Path: string;
	    ID: string;
	
	    static createFrom(source: any = {}) {
	        return new Song(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.Path = source["Path"];
	        this.ID = source["ID"];
	    }
	}
	export class Tileset {
	    Name: string;
	    TilesetWidth: number;
	    TilesetHeight: number;
	    TypeOfTileSet: string;
	    Path: string;
	    TilesetDescription: string;
	
	    static createFrom(source: any = {}) {
	        return new Tileset(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.TilesetWidth = source["TilesetWidth"];
	        this.TilesetHeight = source["TilesetHeight"];
	        this.TypeOfTileSet = source["TypeOfTileSet"];
	        this.Path = source["Path"];
	        this.TilesetDescription = source["TilesetDescription"];
	    }
	}
	export class TrainerClasses {
	    Data: Data[];
	
	    static createFrom(source: any = {}) {
	        return new TrainerClasses(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Data = this.convertValues(source["Data"], Data);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class TrainerJson {
	    name: string;
	    sprite: string;
	    spritename: string;
	    id: string;
	    pokemons: PokemonJson[];
	    classType: string;
	
	    static createFrom(source: any = {}) {
	        return new TrainerJson(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.sprite = source["sprite"];
	        this.spritename = source["spritename"];
	        this.id = source["id"];
	        this.pokemons = this.convertValues(source["pokemons"], PokemonJson);
	        this.classType = source["classType"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class TrainerSprite {
	    Name: string;
	    Path: string;
	
	    static createFrom(source: any = {}) {
	        return new TrainerSprite(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.Path = source["Path"];
	    }
	}
	export class UpdatedMove {
	    power: number;
	    pp: number;
	    accuracy: number;
	    type: string;
	    name: string;
	    id: string;
	    description: string;
	
	    static createFrom(source: any = {}) {
	        return new UpdatedMove(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.power = source["power"];
	        this.pp = source["pp"];
	        this.accuracy = source["accuracy"];
	        this.type = source["type"];
	        this.name = source["name"];
	        this.id = source["id"];
	        this.description = source["description"];
	    }
	}

}

export namespace parsing {
	
	export class OnLoadPokemonEditor {
	    ID: string;
	    Name: string;
	
	    static createFrom(source: any = {}) {
	        return new OnLoadPokemonEditor(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ID = source["ID"];
	        this.Name = source["Name"];
	    }
	}

}

