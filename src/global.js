const global = {
  movement: 0,
  entities: new Map(),
  gameStart: false,
  disconnected: false,
  map: { width: 0, height: 0, serverData: { width: 0, height: 0 } },
  scale: 1,
  player: { x: 0, y: 0, size: 0, shape: 0, angle: 0, color: "#00B0E1", mockupId: NaN },
  mouse: { x: 0, y: 0 },
  target: { x: 0, y: 0 },
  mockups: new Map()
}

window.global = global;

export { global };
