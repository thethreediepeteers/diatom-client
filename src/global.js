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
  colors: null,
  borderColorsCache: new Map(),
  color: ""
}

global.colors = new Map([
  ['col1', '#00b0e1'],
  ['col2', '#c83737'],
  ['col3', '#ffdd55'],
  ['col4', '#ff7f2a'],

  ['col5', '#bc5fd3'],
  ['col6', '#7fff2a'],
  ['col7', '#00ffcc'],
  ['col8', '#e3dbdb']
]);

window.global = global;

export { global };
