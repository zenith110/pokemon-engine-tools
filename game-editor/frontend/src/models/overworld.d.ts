interface OverworldDirectionFrame {
    Direction: string;
    FrameNumber: string;
    Path: string;
    Sprite: string;
}
export interface OverworldDataJson {
    ID: string;
    OverworldId: string;
    SwimmingFrames: OverworldDirectionFrame[];
    RunningFrames: OverworldDirectionFrame[];
    WalkingFrames: OverworldDirectionFrame[];
    IsPlayer: boolean;
    SurfingFrames: OverworldDirectionFrame[];
    Name: string;
}
export {};
