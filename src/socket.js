import { global } from "./global.js";

class Socket {
  constructor(addr) {
    this.addr = addr;
  }

  init() {
    this.ws = new WebSocket(this.addr);
    this.ws.binaryType = "arraybuffer";

    let flag = false;
    let commands = [false];

    this.cmd = {
      set: (index, value) => {
        if (commands[index] !== value || index === 0) {
          commands[index] = value;
          flag = true;
        }
      },

      talk: () => {
        flag = false;
        let o = 0;
        for (let i = 0; i < commands.length; i++) {
          if (commands[i]) o += Math.pow(2, i);
        }

        this.talk(global.movement, o);
      },

      ready: () => flag
    }

    this.ws.onopen = this.onopen;
    this.ws.onmessage = this.onmessage;
    this.ws.onclose = this.onclose;
  }

  onopen = () => {
    console.log("Connected to server.");
    this.ws.commandCycle = setInterval(() => {
      if (this.cmd.ready()) this.cmd.talk();
    });
    global.gameStart = true;
  }

  onmessage = (message) => {
    const view = new DataView(message.data);

    if (view.byteLength === 12) {
      const id = view.getUint32(0, true);
      const map = { width: view.getUint32(4, true), height: view.getUint32(8, true) };

      global.index = id;
      global.map.serverData.width = map.width;
      global.map.serverData.height = map.height;

      return;
    }

    const ids = new Set();
    const entitySize = 32;

    for (let offset = 0; offset < view.byteLength; offset += entitySize) {
      const pos = { x: view.getFloat64(offset, true), y: view.getFloat64(offset + 8, true) };
      const size = view.getFloat32(offset + 16, true);
      const angle = view.getFloat32(offset + 20, true);
      const id = view.getUint32(offset + 24, true);
      const shape = view.getUint8(offset + 28, true);
      const color = { r: view.getUint8(offset + 29, true), g: view.getUint8(offset + 30, true), b: view.getUint8(offset + 31, true) };
      const colorStr = `#${color.r.toString(16).padStart(2, '0')}${color.g.toString(16).padStart(2, '0')}${color.b.toString(16).padStart(2, '0')}`;

      ids.add(id);
      let entity = global.entities.get(id);
      if (!entity) {
        entity = { serverData: { x: 0, y: 0, size: 0, angle: 0 }, x: 0, y: 0, size: 0, angle: 0, color: colorStr };
        global.entities.set(id, entity);
      }

      entity.index = id;
      entity.serverData.x = pos.x;
      entity.serverData.y = pos.y;
      entity.serverData.size = size;
      entity.serverData.angle = angle;
      entity.color = colorStr;
      entity.shape = shape;

      if (id === global.index) {
        global.player.x = pos.x;
        global.player.y = pos.y;
        global.player.size = size;
        global.player.angle = angle;
        global.player.color = colorStr;
        global.player.shape = shape;
      }
    }

    for (let [id, entity] of global.entities) {
      if (!ids.has(id)) {
        entity.shape = 0;
        entity.serverData.size = 0;
      }
    }

    global.entities = new Map([...global.entities].filter(([id, entity]) => {
      if (!ids.has(id)) {
        entity.serverData.size = 0;
      }
      return ids.has(id) || entity.serverData.size !== 0 || entity.size !== 0;
    }));
  }

  onclose = () => {
    console.log("Connection closed.");
    clearInterval(this.ws.commandCycle);

    if (global.gameStart) global.disconnected = true;
    global.gameStart = false;
  }

  talk(movement, flags) {
    const buffer = new ArrayBuffer(12); // 4 bytes for mouse, 4 bytes for movement, 4 bytes for flags
    const view = new DataView(buffer);

    view.setInt16(0, global.target.x, true);
    view.setInt16(2, global.target.y, true);
    view.setFloat32(4, movement, true);
    view.setUint32(8, flags, true);

    this.ws.send(buffer);
  }
}

export { Socket };
