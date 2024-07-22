import { Canvas } from "./canvas.js";
import { Socket } from "./socket.js";

class Game {
  constructor() {
    this.canvas = new Canvas();

    this.socket = new Socket("http://localhost:3000");
    this.movement = { up: false, down: false, left: false, right: false };
  }

  init() {
    document.getElementById("start").addEventListener("click", this.start);
  }

  start = () => {
    document.getElementById("startmenu").style.display = "none";
    this.canvas.display();

    this.socket.init();

    window.requestAnimationFrame(this.update);
  }

  update = () => {

  }
}

const game = new Game();
game.init();
