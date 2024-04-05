export namespace main {
	
	
	
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
		    if (a.slice) {
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
	
	export class UpdatedMove {
	    power: number;
	    pp: number;
	    accuracy: number;
	    type: string;
	    name: string;
	    id: string;
	
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
	    }
	}

}

