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

