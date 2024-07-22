class Canvas {
  constructor(socket, movement) {
    this.cv = document.getElementById("canvas");

    this.cv.style.display = "none";
    this.resize();

    this.ctx = this.cv.getContext("2d");

    this.movement = { up: false, down: false, left: false, right: false };

    this.socket = socket;
    this.mv = movement;
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

  calcMovement() {
    const x = this.movement.right - this.movement.left;
    const y = this.movement.down - this.movement.up;

    if (x === 0 && y === 0) {
      this.mv.val = 0;
      this.socket.cmd.set(0, false);
    }
    else {
      this.mv.val = Math.atan2(y, x);
      this.socket.cmd.set(0, true);
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
