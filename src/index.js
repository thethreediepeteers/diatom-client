import { Canvas } from "./canvas.js";
import { Socket } from "./socket.js";

class Game {
  constructor() {
    this.movement = { val: 0 };
    this.socket = new Socket("http://localhost:3000", this.movement);

    this.canvas = new Canvas(this.socket, this.movement);

    this.entities = [];
  }

  init() {
    document.getElementById("start").addEventListener("click", this.start);
  }

  start = () => {
    document.getElementById("startmenu").style.display = "none";

    this.socket.init();
    this.canvas.init();

    window.requestAnimationFrame(this.update);
  }

  update = () => {
    this.render();

    window.requestAnimationFrame(this.update);
  }

  render = () => {
    for (let entity of this.entities) {

    }
  }
}

const game = new Game();
game.init();
