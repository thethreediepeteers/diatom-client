import { global } from "./global.js";

class Socket {
  constructor(addr) {
    this.addr = addr;
  }

  init() {
    this.ws = new WebSocket(this.addr);

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

        this.talk(0, global.movement, o);
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
    let m = JSON.parse(message.data);

    //console.log("Message from server: ", m);
    switch (m[0]) {
      case 0:
        global.index = m[1].id;

        global.map.serverData.width = m[1].map.width;
        global.map.serverData.height = m[1].map.height;

        break;
      case 1:
        let ids = new Set();
        for (let i = 1; i < m.length; i++) {
          const id = m[i].id;
          const pos = m[i].pos;

          ids.add(id);

          let entity = global.entities.find(e => e.index === id);
          if (!entity) {
            entity = { serverData: { x: 0, y: 0 }, x: 0, y: 0 };
            global.entities.push(entity);
          }

          entity.index = id;
          entity.serverData.x = pos.x;
          entity.serverData.y = pos.y;

          if (id === global.index) {
            global.player.x = pos.x;
            global.player.y = pos.y;
          }
        }
        break;
    }
  }

  onclose = () => {
    console.log("Connection closed.");
    clearInterval(this.ws.commandCycle);

    if (global.gameStart) global.disconnected = true;
    global.gameStart = false;
  }

  talk(...message) {
    this.ws.send(JSON.stringify(message));
  }
}

export { Socket };
