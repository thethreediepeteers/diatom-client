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

    console.log("Message from server: ", m);
    switch (m[0]) {
      case 0:
        global.index = m[1].id;

        break;
      case 1:
        for (let i = 1; i < m.length; i++) {
          let entity = global.entities.find(e => e.index === m[i].id);
          if (!entity) {
            console.log(m[1].id);
            entity = {};
            global.entities.push(entity);
          }

          entity.index = m[i].id;

          const pos = m[i].pos;
          entity.x = pos.x;
          entity.y = pos.y;
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
