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

    global.screenWidthHalf = global.screenWidth / 2;
    global.screenHeightHalf = global.screenHeight / 2;
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
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.ctx.fillStyle = "#c9c9c9";
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawGrid(dx, dy, cellSize) {
    this.ctx.beginPath();

    for (let x = dx % cellSize, y = dy % cellSize; x < this.width || y < this.height; x += cellSize, y += cellSize) {
      if (x < this.width) {
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, this.height);
      }

      if (y < this.height) {
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(this.width, y);
      }
    }

    this.ctx.lineWidth = 0.5;
    this.ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
    this.ctx.stroke();
  }

  calcMovement() {
    const x = this.movement.KeyD - this.movement.KeyA;
    const y = this.movement.KeyS - this.movement.KeyW;

    if (x === 0 && y === 0) {
      global.movement = 0;
      global.socket.cmd.set(0, false);
    } else {
      global.movement = Math.atan2(y, x);
      global.socket.cmd.set(0, true);
    }
  }

  keyDown(event) {
    this.movement[event.code] = 1;

    this.calcMovement();
  }

  keyUp(event) {
    this.movement[event.code] = 0;

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
