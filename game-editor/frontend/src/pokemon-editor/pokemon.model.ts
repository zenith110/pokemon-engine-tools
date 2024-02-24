export interface Pokemon {
    ID: string;
    Name: string;
    Types: string[];
    DexEntry: string;
    Abilities: {
        Name: string;
        IsHidden: boolean;
    }[];
    Moves: {
        Name: string;
        Level: number;
        Method: string;
    }[];
    Evolutions: {
        Name: string;
        Method1: string[];
        Method2: string[];
        ID: string;
    }[];

    HP: number;
    Attack: number;
    Defense: number;
    SpecialAttack: number;
    SpecialDefense: number;
    Speed: number;

    FrontSprite: string;
    BackSprite: string;
    ShinyFront: string;
    ShinyBack: string;
    Icon: string;
}