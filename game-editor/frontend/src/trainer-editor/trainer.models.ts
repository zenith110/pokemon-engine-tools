export interface Trainer {
    ID: string;
    Name: string;
    Sprite: string;
    ClassType: string;
    Pokemons: {
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