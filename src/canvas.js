import { global } from "./global.js";

class Canvas {
  constructor() {
    this.cv = document.getElementById("canvas");

    this.width = this.cv.width;
    this.height = this.cv.height;

    this.resize();

    this.ctx = this.cv.getContext("2d");

    this.movement = { up: false, down: false, left: false, right: false };
  }

  resize(width = window.innerWidth, height = window.innerHeight) {
    this.cv.width = this.width = global.screenWidth = width * window.devicePixelRatio;
    this.cv.height = this.height = global.screenHeight = height * window.devicePixelRatio;
  }

  init() {
    this.cv.style.display = "flex";
    this.cv.focus();

    this.cv.addEventListener("keydown", (event) => this.keyDown(event));
    this.cv.addEventListener("keyup", (event) => this.keyUp(event));

    this.cv.addEventListener("mousedown", (event) => this.mouseDown(event));
    this.cv.addEventListener("mouseup", (event) => this.mouseUp(event));
    this.cv.addEventListener("mousemove", (event) => this.mouseMove(event));
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.ctx.fillStyle = "#c9c9c9";
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawGrid(dx, dy, cellSize) {

    this.ctx.beginPath();
    for (let x = dx % cellSize; x < this.width; x += cellSize) {
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
    }

    for (let y = dy % cellSize; y < this.height; y += cellSize) {
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
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
    }
    else {
      global.movement = Math.atan2(y, x);
      global.socket.cmd.set(0, true);
    }
  }

  keyDown(event) {
    let changedMovement = false;

    switch (event.code) {
      case "KeyW":
        this.movement.up = true;
        changedMovement = true;
        break;

      case "KeyS":
        this.movement.down = true;
        changedMovement = true;
        break;

      case "KeyD":
        this.movement.right = true;
        changedMovement = true;
        break;

      case "KeyA":
        this.movement.left = true;
        changedMovement = true;
        break;
    }

    if (changedMovement) this.calcMovement();
  }

  keyUp(event) {
    let changedMovement = false;

    switch (event.code) {
      case "KeyW":
        this.movement.up = false;
        changedMovement = true;
        break;

      case "KeyS":
        this.movement.down = false;
        changedMovement = true;
        break;

      case "KeyD":
        this.movement.right = false;
        changedMovement = true;
        break;

      case "KeyA":
        this.movement.left = false;
        changedMovement = true;
        break;
    }

    if (changedMovement) this.calcMovement();
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
