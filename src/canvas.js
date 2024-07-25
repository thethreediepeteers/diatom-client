import { global } from "./global.js";

class Canvas {
  constructor() {
    this.cv = document.getElementById("canvas");

    this.cv.style.display = "none";
    this.resize();

    this.ctx = this.cv.getContext("2d");

    this.movement = { up: false, down: false, left: false, right: false };
  }

  resize(width = window.innerWidth, height = window.innerHeight) {
    this.cv.width = width;
    this.cv.height = height;
  }

  init() {
    this.cv.style.display = "flex";

    window.addEventListener("keydown", (event) => this.keyDown(event));
    window.addEventListener("keyup", (event) => this.keyUp(event));
    window.addEventListener("resize", () => this.resize());
  }

  clear() {
    this.ctx.clearRect(0, 0, this.cv.width, this.cv.height);

    this.ctx.fillStyle = "#c9c9c9";
    this.ctx.fillRect(0, 0, this.cv.width, this.cv.height);
  }

  drawGrid(dx, dy, cellSize) {
    const width = this.cv.width;
    const height = this.cv.height;

    this.ctx.beginPath();
    for (let x = dx % cellSize; x < width; x += cellSize) {
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
    }

    for (let y = dy % cellSize; y < height; y += cellSize) {
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
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
}

export { Canvas };
