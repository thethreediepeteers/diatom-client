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
  let player = global.player;
  let playerMockup = global.mockups.get(player.mockupId);
  if (!global || !playerMockup) return;

  const cx = canvas.width / 2, cy = canvas.height / 2;

  for (let [id, entity] of global.entities) {
    if (id === global.index) continue;
    if (entity.dead) continue;
    let mockup = global.mockups.get(entity.mockupId);

    entity.x = entity.x === 0 ? entity.serverData.x : lerp(entity.x, entity.serverData.x, 0.2);
    entity.y = entity.y === 0 ? entity.serverData.y : lerp(entity.y, entity.serverData.y, 0.2);

    let scaleTo = 1;
    if (entity.dying) {
      scaleTo = 0;

      if (entity.scale < 0.01) {
        entity.dying = false;
        entity.dead = true;
        continue;
      }
    }

    entity.scale = lerp(entity.scale, scaleTo, 0.2);
    entity.angle = lerpAngle(entity.angle, entity.serverData.angle, 0.4);

    let x = entity.x - px;
    let y = entity.y - py;

    x += cx;
    y += cy;

    drawEntity(x, y, entity.size, entity.scale, entity.angle, entity.color, mockup);
  }

  let entity = global.entities.get(global.index);
  let scaleTo = 1;
  if (entity.dying) {
    scaleTo = 0;

    if (entity.scale < 0.01) {
      entity.dying = false;
      entity.dead = true;
      return;
    }
  }

  entity.scale = lerp(entity.scale, scaleTo, 0.2);
  entity.angle = lerpAngle(entity.angle, entity.serverData.angle, 0.4);

  let x = cx;
  let y = cy;

  drawEntity(x, y, entity.size, entity.scale, entity.angle, entity.color, playerMockup);
}

const drawEntity = (x, y, size, scale, angle, color, mockup) => {
  // draw guns below 
  for (let gun of mockup.guns) {
    let gx = gun.offset * Math.cos(gun.direction + gun.angle + angle);
    let gy = gun.offset * Math.sin(gun.direction + gun.angle + angle);
    drawTrapezoid(x + gx, y + gy, gun.length * scale, gun.width * scale, angle + gun.angle, gun.aspect, "#808080");
  }

  ctx.lineWidth = 5;
  drawPoly(x, y, size * scale, mockup.shape, angle, color);

  // draw turrets above
  for (let turret of mockup.turrets) {
    drawPoly(turret.x + x, turret.y + y, turret.size * scale, turret.shape, angle + turret.angle, "#808080");
  }
}

function offsetHex(hex) {
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);

  const clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
  }

  const newR = clamp(r - 32, 0, 255);
  const newG = clamp(g - 32, 0, 255);
  const newB = clamp(b - 32, 0, 255);

  const toHex = (comp) => {
    const hex = comp.toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  }

  const newHex = `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;

  return newHex;
}

const drawTrapezoid = (x, y, length, width, angle, aspect, color, strokeColor = offsetHex(color)) => {
  let h = aspect > 0 ? [width * aspect, width] : [width, -width / aspect];

  let points = [
    [0, h[1]],
    [length * 2, h[0]],
    [length * 2, -h[0]],
    [0, -h[1]]
  ];

  let sinT = Math.sin(angle);
  let cosT = Math.cos(angle);

  ctx.beginPath();
  for (let point of points) {
    let newX = point[0] * cosT - point[1] * sinT + x,
      newY = point[0] * sinT + point[1] * cosT + y;
    ctx.lineTo(newX, newY);
  }
  ctx.closePath();

  ctx.lineWidth = 5;
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.stroke();
}

const drawPoly = (x, y, radius, shape, angle, color, strokeColor = offsetHex(color)) => {
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
  ctx.strokeStyle = strokeColor;
  ctx.stroke();
}

export { drawConnecting, drawDisconnected, drawEntities };
