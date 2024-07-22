class Socket {
  constructor(addr) {
    this.addr = addr;
  }

  init() {
    this.ws = new WebSocket(this.addr);

    let flag = false;

    this.cmd = {
      set: () => {
        flag = true;
      },

      talk: () => {
        flag = false;
      },

      ready: () => flag
    }

    this.ws.onopen = () => {
      console.log("Connected to server");
      this.ws.commandCycle = setInterval(() => {
        if (this.cmd.ready()) this.cmd.talk();
      });
    }
  }
}

export { Socket };
