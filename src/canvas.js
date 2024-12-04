import { global } from "./global.js";

class Canvas {
  constructor() {
    this.cv = document.getElementById("canvas");

    this.width = this.cv.width;
    this.height = this.cv.height;

    this.resize();

    this.ctx = this.cv.getContext("2d");

    this.movement = {};
  }

  resize(width = window.innerWidth, height = window.innerHeight) {
    this.cv.width = this.width = global.screenWidth = width * window.devicePixelRatio;
    this.cv.height = this.height = global.screenHeight = height * window.devicePixelRatio;
  }

  init() {
    this.cv.style.display = "flex";
    this.cv.focus();

    this.cv.addEventListener("keydown", this.keyDown.bind(this));
    this.cv.addEventListener("keyup", this.keyUp.bind(this));

    this.cv.addEventListener("mousedown", this.mouseDown.bind(this));
    this.cv.addEventListener("mouseup", this.mouseUp.bind(this));
    this.cv.addEventListener("mousemove", this.mouseMove.bind(this));
  }

  clear() {
    this.ctx.fillStyle = "#c9c9c9";
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawGrid(dx, dy, cellSize) {
    this.ctx.beginPath();

    const startX = dx % cellSize;
    const startY = dy % cellSize;

    for (let i = 0; i < Math.max(this.width, this.height); i += cellSize) {
      if (startX + i < this.width) {
        this.ctx.moveTo(startX + i, 0);
        this.ctx.lineTo(startX + i, this.height);
      }
  
      if (startY + i < this.height) {
        this.ctx.moveTo(0, startY + i);
        this.ctx.lineTo(this.width, startY + i);
      }
    }

    this.ctx.lineWidth = 0.5;
    this.ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
    this.ctx.stroke();
  }

  calcMovement() {
    const x = this.movement.right - this.movement.left;
    const y = this.movement.down - this.movement.up;

    if (x === 0 && y === 0) {
      global.movement = 0;
      global.socket.cmd.set(0, false);
    } else {
      global.movement = Math.atan2(y, x);
      global.socket.cmd.set(0, true);
    }
  }

  keyDown(event) {
    switch (event.code) {
      case "KeyW":
        this.movement.up = true;
        break;
      case "KeyS":
        this.movement.down = true;
        break;
      case "KeyD":
        this.movement.right = true;
        break;
      case "KeyA":
        this.movement.left = true;
        break;
      default:
        return;
    }

    this.calcMovement();
  }

  keyUp(event) {
    switch (event.code) {
      case "KeyW":
        this.movement.up = false;
        break;
      case "KeyS":
        this.movement.down = false;
        break;
      case "KeyD":
        this.movement.right = false;
        break;
      case "KeyA":
        this.movement.left = false;
        break;
      default:
        return;
    }

    this.calcMovement();
  }

  handleMouse(button, pressed) {
    switch (button) {
      case 0:
        global.socket.cmd.set(1, pressed);
        break;
      case 2:
        global.socket.cmd.set(2, pressed);
        break;
    }
  }

  mouseDown(event) {
    this.handleMouse(event.button, true);
  }

  mouseUp(event) {
    this.handleMouse(event.button, false);
  }

  mouseMove(event) {
    global.mouse.x = event.clientX;
    global.mouse.y = event.clientY;
    
    global.socket.cmd.talk();
  }
}

export { Canvas };
