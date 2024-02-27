export interface Trainer {
    id: string;
    name: string;
    sprite: string;
    classType: string;
    pokemons: {
        Species: string;
        Level: number;
        Moves: string[];
        HeldItem: string;
        HP: number;
        Attack: number;
        Defense: number;
        Speed: number;
        SpecialAttack: number;
        SpecialDefense: number;
        ID: number;
    }[];
}