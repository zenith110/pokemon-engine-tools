export interface Pokemon {
    ID: string;
    Name: string;
    Types: string[];
    DexEntry: string;
    Abilities: {
        Name: string;
        isHidden: boolean;
    }[];
    Moves: {
        Name: string;
        Level: number;
        Method: string;
    }[];
    Evolutions: {
        Name: string;
        Methods: string[];
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