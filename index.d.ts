interface DiatomGlobal {
    movement: number;
    entities: Map<number, any>;
    gameStart: boolean;
    disconnected: boolean;
    map: {
        width: number,
        height: number,
        serverData: { width: number, height: number }
    };
    player: {
        x: number,
        y: number,
        size: number,
        shape: number,
        angle: number,
        color: string,
        mockupId: number
    };
    mouse: { x: number, y: number };
    target: { x: number, y: number };
    mockups: Map<number, any>;
    colors: Map<string, string>;
    borderColorsCache: Map<number, string>;
    color: string
}

declare const global: DiatomGlobal;