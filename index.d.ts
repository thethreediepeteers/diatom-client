interface ServerEntity {
    x: number;
    y: number;
    health: number;
    maxHealth: number;
    angle: number;
}

interface Entity extends ServerEntity {
    index: number;
    mockupId: number;
    xOld: number;
    yOld: number;
    size: number;
    shape: number;
    team: number;
    color: HexColor; // NOTE: its not cached in socket.js
    serverData: ServerEntity;
    dead: boolean;
    dt: number;
}

interface Mockup {
    guns: any[],
    turrets: any[],
    // TODO
}

type ColorStrings = 'col1' | 'col2' | 'col3' | 'col4' | 'col5' | 'col6' | 'col7' | 'col8';
type HexColor = `#${string}`;

interface DiatomGlobal {
    movement: number;
    entities: Map<number, Entity>;
    gameStart: boolean;
    disconnected: boolean;
    map: {
        width: number,
        height: number,
        serverData: { width: number, height: number }
    };
    player: Omit<Entity, 'index' | 'serverData'> | { serverX: number, serverY: number };
    mouse: { x: number, y: number };
    target: { x: number, y: number };
    mockups: Map<number, Mockup>;
    colors: Map<ColorStrings, HexColor>;
    borderColorsCache: Map<HexColor, HexColor>;
    color: HexColor, // should be in player

    // undefined in global by default
    deltaTime: number,
    index: number, // should be in player
    mouseAngle: number,

    //camX and camY are not defined in global
    //camX: number,
    //camY: number,

}

declare const global: DiatomGlobal;