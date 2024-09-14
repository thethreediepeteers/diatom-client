import { global } from "./global.js";

class Socket {
  constructor(addr) {
    this.addr = addr;
    this.canvas = false;
  }

  init = (canvas) => {
    this.ws = new WebSocket(this.addr);
    this.ws.binaryType = "arraybuffer";
    this.canvas = canvas;

    let flag = false;
    let commands = [
      false, // moving
      false, // lmb
      false  // rmb 
    ];

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
          if (commands[i]) o |= (1 << i);
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

    let buffer = new ArrayBuffer(4);
    let view = new DataView(buffer);

    view.setInt32(0, 1, true);
    this.ws.send(buffer);

    global.gameStart = true;
    if (this.canvas === false) {
      console.log("Something went wrong");
    } else {
      this.canvas.init();
    }
  }

  onmessage = (message) => {
    const view = new DataView(message.data);

    let o = 0;
    const messageType = String.fromCharCode(view.getUint8(o++, true));

    switch (messageType) {
      case 's': // spawn data
        const id = view.getUint32(o, true);
        global.index = id;
        break;

      case 'm': // map data
        const map = { width: view.getUint32(o, true), height: view.getUint32(o + 4, true) };

        global.map.serverData.width = map.width;
        global.map.serverData.height = map.height;
        break;

      case 'u': // update message
        const ids = new Set();

        const pos = { x: 0, y: 0 };
        const color = { r: 0, g: 0, b: 0 };

        for (let offset = o; offset < view.byteLength;) {
          pos.x = view.getFloat64(offset, true);
          offset += 8;
          pos.y = view.getFloat64(offset, true);
          offset += 8;
          const size = view.getFloat32(offset, true);
          offset += 4;
          const angle = view.getFloat32(offset, true);
          offset += 4;
          const id = view.getInt32(offset, true);
          offset += 4;
          const mockupId = view.getInt32(offset, true);
          offset += 4;
          const health = view.getInt32(offset, true);
          offset += 4;
          const maxHealth = view.getInt32(offset, true);
          offset += 4;
          const team = view.getInt32(offset, true);
          offset += 4;
          const shape = view.getUint8(offset, true);
          offset += 1;
          color.r = view.getUint8(offset, true);
          offset += 1;
          color.g = view.getUint8(offset, true);
          offset += 1;
          color.b = view.getUint8(offset, true);
          offset += 1;

          const colorStr = `#${color.r.toString(16).padStart(2, '0')
            }${color.g.toString(16).padStart(2, '0')
            }${color.b.toString(16).padStart(2, '0')
            }`;

          ids.add(id);

          let entity = global.entities.get(id);
          if (!entity) {
            entity = {
              serverData: {
                x: 0,
                y: 0,
                angle: 0,
                health: 0,
                maxHealth: 0
              },
              x: 0,
              y: 0,
              size: 0,
              angle: 0,
              health: 0,
              maxHealth: 0,
              color: colorStr,
              team: 0,
              scale: 0,
              dead: false,
              dying: false
            };
            global.entities.set(id, entity);
          }

          entity.index = id;
          entity.serverData.x = pos.x;
          entity.serverData.y = pos.y;
          entity.serverData.angle = angle;
          entity.serverData.health = health;
          entity.serverData.maxHealth = maxHealth;
          entity.size = size;
          entity.color = colorStr;
          entity.shape = shape;
          entity.team = team;
          entity.mockupId = mockupId;

          if (id === global.index) {
            global.player.x = pos.x;
            global.player.y = pos.y;
            global.player.size = size;
            global.player.angle = angle;
            global.player.color = colorStr;
            global.player.shape = shape;
            global.player.health = health;
            global.player.maxHealth = maxHealth;
            global.player.team = team;
            global.player.mockupId = mockupId;
          }
        }

        for (let [id, entity] of global.entities) {
          if (!ids.has(id)) {
            entity.dying = true;
          }
        }

        global.entities = new Map([...global.entities].filter(([id, entity]) => {
          return ids.has(id) || !entity.dead || id === global.index;
        }));

        break;
    }
  }

  onclose = () => {
    console.log("Connection closed.");
    clearInterval(this.ws.commandCycle);

    if (global.gameStart) global.disconnected = true;
    global.gameStart = false;
  }

  talk = (movement, flags) => {
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
