import { Canvas } from "./canvas.js";
import { Socket } from "./socket.js";
import { global } from "./global.js";
import { drawConnecting, drawEntity } from "./draw.js";

class Game {
  constructor() {
    global.socket = new Socket("http://localhost:3000/ws");
    this.canvas = new Canvas();
  }

  init() {
    document.getElementById("start").addEventListener("click", this.start);
  }

  start = () => {
    document.getElementById("startmenu").style.display = "none";

    global.socket.init();
    this.canvas.init();

    window.requestAnimationFrame(this.update);
  }

  update = () => {
    this.render();

    window.requestAnimationFrame(this.update);
  }

  render = () => {
    this.canvas.clear();

    if (global.gameStart) {
      // draw game
      this.canvas.drawGrid(0, 0, 32);
      for (let entity of global.entities) {
        drawEntity(entity, this.canvas.ctx);
      }
    }
    else if (!global.disconnected) {
      drawConnecting();
    }
    if (global.disconnected) {
      // draw disconnect
    }
  }
}

const game = new Game();
game.init();
