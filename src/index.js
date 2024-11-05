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
}

class Game {
  constructor() {
    this.canvas = new Canvas();
    this.protocol = "http";
    this.ip = "0.0.0.0";
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

    global.socket = new Socket(`${this.protocol === "http" ? "ws" : "wss"}://${this.ip}:3000/ws?color=${encodeURIComponent(global.color)}`);
    global.socket.init(this.canvas);

    window.addEventListener("resize", () => this.canvas.resize());
    window.addEventListener("contextmenu", (event) => event.preventDefault());
    window.requestAnimationFrame(this.update);
  }

  loadMockups = () => {
    let mockupData = fetchAsync(`${this.protocol}://${this.ip}:3000/mockups`);

    const TYPE_NUM = 0x01;
    const TYPE_STRING = 0x02;
    const TYPE_STARTTABLE = 0x03;
    const TYPE_ENDTABLE = 0x04;
    const TYPE_ARRAY = 0x05;

    mockupData.then(hexMockups => {
      let buffer = new Uint8Array(hexMockups.match(/../g).map(h => parseInt(h, 16))).buffer;
      let view = new DataView(buffer);

      let offset = 0;

      function readUint8() {
        return view.getUint8(offset++, true);
      }

      function readDouble() {
        let value = view.getFloat64(offset, true);
        offset += 8;
        return value;
      }

      function readString() {
        const length = readUint8();
        const chars = new Array(length);
        for (let i = 0; i < length; i++) {
          chars[i] = String.fromCharCode(readUint8());
        }
        return chars.join('');
      }

      function parseTable() {
        const obj = {};
        const arr = [];

        let isArray = false;

        while (offset < view.byteLength) {
          const keyType = readUint8();

          if (keyType === TYPE_ENDTABLE) {
            break;
          }

          let key;
          if (keyType === TYPE_ARRAY) {
            isArray = true;
          }
          else {
            key = readString();
          }

          const valueType = readUint8();

          let value;
          if (valueType === TYPE_NUM) {
            value = readDouble();
          }
          else if (valueType === TYPE_STRING) {
            value = readString();
          }
          else if (valueType === TYPE_STARTTABLE) {
            value = parseTable();
          }

          if (isArray) {
            arr.push(value);
          } else {
            obj[key] = value;
          }
        }

        return isArray ? arr : obj;
      }

      for (let mockup of parseTable()) {
        if (!mockup.guns) mockup.guns = [];
        if (!mockup.turrets) mockup.turrets = [];
        global.mockups.set(mockup.id, mockup);
      }
    });
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
