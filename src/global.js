const global = {
  movement: 0,
  entities: new Map(),
  gameStart: false,
  disconnected: false,
  map: {
    width: 0,
    height: 0,
    serverData: {
      width: 0,
      height: 0
    }
  },
  player: {
    x: 0,
    y: 0,
    size: 0,
    shape: 0,
    angle: 0,
    color: "#00B0E1",
    mockupId: NaN
  },
  mouse: {
    x: 0,
    y: 0
  },
  target: {
    x: 0,
    y: 0
  },
  mockups: new Map(),
  colors: new Map(),
  color: "",
}

global.colors.set("col1", "#00b0e1");
global.colors.set("col2", "#c83737");
global.colors.set("col3", "#ffdd55");
global.colors.set("col4", "#ff7f2a");

global.colors.set("col5", "#bc5fd3");
global.colors.set("col6", "#7fff2a");
global.colors.set("col7", "#00ffcc");
global.colors.set("col8", "#e3dbdb");

window.global = global;

export { global };
