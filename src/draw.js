const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const drawConnecting = () => {
  ctx.font = "bold 48px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = "ffffff";
  ctx.fillText("Connecting...", canvas.width / 2, canvas.height / 2);
}

const drawEntity = (entity) => {
  ctx.lineWidth = 5;
  ctx.fillStyle = "#fff000";
  ctx.fillRect(entity.x, entity.y, 50, 50);
}

export { drawConnecting, drawEntity };
