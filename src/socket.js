class Socket {
  constructor(addr, movement) {
    this.addr = addr;
    this.movement = movement;
  }

  init() {
    this.ws = new WebSocket(this.addr);

    let flag = false;
    let commands = [false];

    this.cmd = {
      set: (index, value) => {
        if (commands[index] !== value) {
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

        this.talk(0, this.movement.val, o);
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
  }

  onmessage = (message) => {
    console.log("Message from server: ", message.data);
  }

  onclose = () => {
    console.log("Connection closed.");
    clearInterval(this.ws.commandCycle);
  }

  talk(...message) {

    console.log('t');
    this.ws.send(JSON.stringify(message));
  }
}

export { Socket };
