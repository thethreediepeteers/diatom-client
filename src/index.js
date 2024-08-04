import { Canvas } from "./canvas.js";
import { Socket } from "./socket.js";
import { global } from "./global.js";
import { drawConnecting, drawDisconnected, drawEntities } from "./draw.js";
import { lerp } from "./util.js";

function calculateMouse() {
  global.target.x = Math.round(global.mouse.x - global.screenWidth / 2);
  global.target.y = Math.round(global.mouse.y - global.screenHeight / 2);
}

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

    window.addEventListener("resize", () => this.canvas.resize());
    window.addEventListener("contextmenu", (event) => event.preventDefault());

    window.requestAnimationFrame(this.update);
  }

  update = () => {
    global.map.width = lerp(global.map.width, global.map.serverData.width, 0.1);
    global.map.height = lerp(global.map.height, global.map.serverData.height, 0.1);

    calculateMouse();

    this.render();

    window.requestAnimationFrame(this.update);
  }

  render = () => {
    this.canvas.clear();

    if (global.gameStart && global.player) {
      const cx = this.canvas.width / 2;
      const cy = this.canvas.height / 2;
      const px = global.player.x;
      const py = global.player.y;

      this.canvas.ctx.fillStyle = "#d9d9d9";
      this.canvas.ctx.fillRect(cx - px, cy - py, global.map.width, global.map.height);

      this.canvas.drawGrid(cx - px, cy - py, 32);

      drawEntities(px, py);
    }
    else if (!global.disconnected) {
      drawConnecting();
    }
    if (global.disconnected) {
      drawDisconnected();
    }
  }
}

const game = new Game();
game.init();
