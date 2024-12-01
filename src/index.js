import { Canvas } from "./canvas.js";
import { Socket } from "./socket.js";
import { global } from "./global.js";
import {
  drawConnecting,
  drawDisconnected,
  drawEntities
} from "./draw.js";
import {
  fetchAsync,
  lerp
} from "./util.js";

function calculateMouse() {
  global.target.x = Math.round(global.mouse.x - global.screenWidth / 2);
  global.target.y = Math.round(global.mouse.y - global.screenHeight / 2);

  global.mouseAngle = Math.atan2(global.target.y, global.target.x);
}

class Game {
  constructor() {
    this.canvas = new Canvas();

    if (window.location.hostname === "localhost") {
      this.protocol = "http";
      this.ip = "0.0.0.0:3000";
    }
    else {
      this.protocol = "https";
      this.ip = "diatom-server.onrender.com";
    }
  }

  init = () => {
    let colorBucket = document.getElementById("colorbucket");
    let mainButtonsDiv = document.getElementById("mainbuttons");
    let colorButtonsDiv = document.getElementById("colorbuttons");
    let colorConfirm = document.getElementById("colorconfirm");
    let colorRows = document.getElementById("colorselect").children;
    let playerColor = window.localStorage.getItem("playerColor");

    global.color = playerColor ?? "#00b0e1"

    colorBucket.style.background = playerColor;
    colorBucket.addEventListener("click", () => {
      mainButtonsDiv.style.display = "none";
      colorButtonsDiv.style.display = "block";
    });
    colorConfirm.addEventListener("click", () => {
      colorButtonsDiv.style.display = "none";
      mainButtonsDiv.style.display = "block";
    });

    Array.from(colorRows).forEach(row => {
      let buttons = row.children;

      Array.from(buttons).forEach(button => {
        button.addEventListener("click", () => {
          global.color = global.colors.get(button.id);

          window.localStorage.setItem("playerColor", global.color);
          document.getElementById("colorconfirm").style.background = global.color;
          document.getElementById("colorbucket").style.background = global.color;
        });
      });
    });

    document.getElementById("start").addEventListener("click", this.start);
  }

  start = () => {
    document.getElementById("startmenu").style.display = "none";

    this.loadMockups();

    global.socket = new Socket(`${this.protocol === "http" ? "ws" : "wss"}://${this.ip}/ws?color=${encodeURIComponent(global.color)}`);
    global.socket.init(this.canvas);

    window.addEventListener("resize", () => this.canvas.resize());
    window.addEventListener("contextmenu", (event) => event.preventDefault());
    window.requestAnimationFrame(this.update);
  }

  loadMockups = () => {
    let mockupData = fetchAsync(`${this.protocol}://${this.ip}/mockups`);

    mockupData.then((hexMockups) => {
      let buffer = new Uint8Array(hexMockups.match(/../g).map(h => parseInt(h, 16))).buffer;
      let view = new DataView(buffer);

      for (let offset = 0; offset < view.byteLength;) {
        let mockup = {
          guns: [],
          turrets: []
        };

        let mockupId = view.getInt32(offset, true);
        offset += 4;
        let size = view.getFloat32(offset, true);
        offset += 4;
        let shape = view.getUint8(offset, true);
        offset += 1;

        mockup.id = mockupId;
        mockup.size = size;
        mockup.shape = shape;

        let gunsSize = view.getInt32(offset, true);
        offset += 4;

        for (let i = 0; i < gunsSize; i++) {
          let gunLength = view.getFloat32(offset, true);
          offset += 4;
          let gunWidth = view.getFloat32(offset, true);
          offset += 4;
          let gunOffset = view.getFloat32(offset, true);
          offset += 4;
          let gunDirection = view.getFloat32(offset, true);
          offset += 4;
          let angle = view.getFloat32(offset, true);
          offset += 4;
          let aspect = view.getFloat32(offset, true);
          offset += 4;

          let gun = {
            length: gunLength,
            width: gunWidth,
            offset: gunOffset,
            direction: gunDirection,
            angle: angle,
            aspect: aspect
          };

          mockup.guns.push(gun);
        }

        let turretsSize = view.getInt32(offset, true);
        offset += 4;

        for (let i = 0; i < turretsSize; i++) {
          let turretX = view.getFloat32(offset, true);
          offset += 4;
          let turretY = view.getFloat32(offset, true);
          offset += 4;
          let turretSize = view.getFloat32(offset, true);
          offset += 4;
          let turretAngle = view.getFloat32(offset, true);
          offset += 4;
          let turretShape = view.getUint8(offset, true);
          offset += 1;

          let turret = {
            size: turretSize,
            x: turretX,
            y: turretY,
            angle: turretAngle,
            shape: turretShape
          };

          mockup.turrets.push(turret);
        }

        global.mockups.set(mockupId, mockup);
      }
    });
  }

  update = () => {
    global.deltaTime = performance.now() - this.lastUpdate;
    this.lastUpdate = performance.now();
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
