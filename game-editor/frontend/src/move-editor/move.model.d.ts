export interface Move {
    ID: string;
    Power: number | undefined;
    Pp: number | undefined;
    Accuracy: number | undefined;
    Type: string;
    Name: string;
    Descriptions: {
        Description: string;
    }[];
    Effects: {
        EffectText: string;
    }[];
}
