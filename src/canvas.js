class Canvas {
  constructor() {
    this.cv = document.getElementById("canvas");

    this.cv.style.display = "none";
    this.cv.width = window.innerWidth;
    this.cv.height = window.innerHeight;

    this.ctx = this.cv.getContext("2d");
  }

  display() {
    this.cv.style.display = "flex";
  }
}

export { Canvas };
