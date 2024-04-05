// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT
import {main} from '../models';
import {models} from '../models';

export function CreateMapConfig(arg1:main.MapInput):Promise<void>;

export function CreateProject():Promise<void>;

export function CreateTrainerData(arg1:main.TrainerJson):Promise<void>;

export function GrabAllMoves():Promise<models.AllMoves>;

export function GrabMusicTracks():Promise<Array<main.Song>>;

export function GrabTrainerSprites():Promise<Array<main.TrainerSprite>>;

export function ParseHeldItems():Promise<Array<main.HeldItem>>;

export function ParseMoves():Promise<models.AllMoves>;

export function ParsePokemonData():Promise<Array<main.PokemonTrainerEditor>>;

export function ParseTrainerClass():Promise<models.TrainerClasses>;

export function ParseTrainers():Promise<Array<main.TrainerJson>>;

export function SetDataFolder():Promise<void>;

export function SetMapTileset():Promise<string>;

export function UpdateTrainer(arg1:main.TrainerJson):Promise<void>;

export function UpdateTrainerSprite():Promise<string>;

export function UploadNewSong():Promise<void>;
