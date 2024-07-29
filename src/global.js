const global = {
  movement: 0,
  entities: [],
  gameStart: false,
  disconnected: false,
  map: { width: 0, height: 0, serverData: { width: 0, height: 0 } },
  scale: 1,
  player: { x: 0, y: 0, size: 0 },
}

window.global = global;

export { global };
