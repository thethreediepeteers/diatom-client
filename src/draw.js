import { lerp, lerpAngle } from "./util.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

ctx.lineCap = "round";
ctx.lineJoin = "round";

const drawConnecting = () => {
  ctx.font = "bold 48px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = "#ffffff";
  ctx.fillText("Connecting...", canvas.width / 2, canvas.height / 2);
}

const drawDisconnected = () => {
  ctx.font = "bold 48px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = "#ff0000";
  ctx.fillText("Disconnected", canvas.width / 2, canvas.height / 2);
}

const drawEntities = (px, py) => {
  if (!global.player) return;

  const cx = canvas.width / 2, cy = canvas.height / 2;

  for (let [id, entity] of global.entities) {
    if (id === global.index) continue;
    entity.x = lerp(entity.x, entity.serverData.x, 0.2);
    entity.y = lerp(entity.y, entity.serverData.y, 0.2);
    entity.size = lerp(entity.size, entity.serverData.size, 0.2);
    entity.angle = lerpAngle(entity.angle, entity.serverData.angle, 0.3);

    let x = entity.x - px + cx;
    let y = entity.y - py + cy;

    drawEntity(x, y, entity.size, entity.shape, entity.angle, entity.color);
  }

  let player = global.player;
  drawEntity(cx, cy, player.size, player.shape, player.angle, player.color); // draw player on top
}

const drawEntity = (x, y, size, shape, angle, color = "#00B0E1") => {
  ctx.lineWidth = 5;
  drawPoly(x, y, size, shape, angle, color);
}

function offsetHex(hex) {
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);

  const clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
  }

  const newR = clamp(r - 50, 0, 255);
  const newG = clamp(g - 50, 0, 255);
  const newB = clamp(b - 50, 0, 255);

  const toHex = (comp) => {
    const hex = comp.toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  }

  const newHex = `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;

  return newHex;
}

const drawPoly = (x, y, radius, shape, angle, color) => {
  angle += shape % 2 ? 0 : Math.PI / shape;

  ctx.beginPath();
  if (!shape) {
    // circle
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
  } else {
    // polygon
    angle += (shape % 1) * Math.PI * 2;
    for (let i = 0; i < shape; i++) {
      let theta = (i / shape) * 2 * Math.PI + angle;
      ctx.lineTo(x + radius * Math.cos(theta), y + radius * Math.sin(theta));
    }
  }

  ctx.closePath();

  ctx.fillStyle = color;
  ctx.fill();

  ctx.lineWidth = 5;
  ctx.strokeStyle = offsetHex(color);
  ctx.stroke();
}

export { drawConnecting, drawDisconnected, drawEntities };
