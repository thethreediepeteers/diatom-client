import {
  lerp,
  lerpAngle
} from "./util.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { alpha: false });
const clamp = value => Math.min(Math.max(value - 32, 0), 255);

let camX = 0, camY = 0;

ctx.lineCap = "round";
ctx.lineJoin = "round";

function drawConnecting() {
  ctx.font = "bold 48px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = "#ffffff";
  ctx.fillText("Connecting", global.screenWidthHalf, global.screenHeightHalf);
}

function drawDisconnected() {
  ctx.font = "bold 48px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = "#ff0000";
  ctx.fillText("Disconnected", global.screenWidthHalf, global.screenHeightHalf);
}

function drawHealth(x, y, health, maxHealth, r, color) {
  ctx.beginPath();

  ctx.fillStyle = offsetHex(color);
  ctx.roundRect(x - maxHealth, y + r + 10, maxHealth * 2, 10, 5);
  ctx.fill();

  ctx.beginPath();

  ctx.fillStyle = color;
  ctx.roundRect(x - maxHealth + 2, y + r + 12, (health * 2 - 4), 6, 5);
  ctx.fill();
}

function drawEntities() {
  let player = global.player;

  player.dt = (player.dt + global.deltaTime) || 0;

  const rate = Math.min(1.7, player.dt / 170);

  const distX = player.serverX - player.xOld;
  const distY = player.serverY - player.yOld;

  const tooFar = Math.hypot(distX, distY) > 150;

  player.x = (player.xOld + distX * rate) || player.serverX;
  player.y = (player.yOld + distY * rate) || player.serverY;

  const tmpDist = Math.hypot(camX - player.x, camY - player.y);
  const tmpDir = Math.atan2(player.y - camY, player.x - camX);
  const camSpd = Math.min(tmpDist * 0.01 * global.deltaTime, tmpDist);

  camX = (camX + camSpd * Math.cos(tmpDir)) || player.x;
  camY = (camY + camSpd * Math.sin(tmpDir)) || player.y;

  const xOffset = camX - global.screenWidthHalf;
  const yOffset = camY - global.screenHeightHalf;

  let playerMockup = global.mockups.get(player.mockupId);

  if (!global || !playerMockup) return;

  for (let [id, entity] of global.entities) {
    if (entity.dead) {
      if (id === global.index) {
        console.log("I am dead, please respawn");
      }
      continue;
    }

    let mockup = global.mockups.get(entity.mockupId);

    const distX = entity.serverData.x - entity.xOld;
    const distY = entity.serverData.y - entity.yOld;
    const tooFar = Math.hypot(distX, distY) > 150;

    entity.dt = (entity.dt + global.deltaTime) || 0;

    const rate = Math.min(1.7, entity.dt / 170);

    const targetX = entity.xOld + distX * rate;
    const targetY = entity.yOld + distY * rate;

    entity.x = (tooFar ? entity.serverData.x : targetX) || entity.serverData.x;
    entity.y = (tooFar ? entity.serverData.y : targetY) || entity.serverData.y;

    const targetHealth = entity.health === 0 ? entity.serverData.health : lerp(entity.health, entity.serverData.health, 0.2);
    const targetMhealth = entity.maxHealth === 0 ? entity.serverData.maxHealth : lerp(entity.maxHealth, entity.serverData.maxHealth, 0.2);

    entity.health = targetHealth;
    entity.maxHealth = targetMhealth;

    entity.angle = global.index == entity.index ? global.mouseAngle : (entity.angle === 0 ? entity.serverData.angle : lerpAngle(entity.angle, entity.serverData.angle, 0.4));

    let x = entity.x - xOffset;
    let y = entity.y - yOffset;

    drawEntity(x, y, entity.size, entity.angle, entity.color, mockup);
    drawHealth(x, y, entity.health, entity.maxHealth, entity.size, entity.color);
  }
}

function drawEntity(x, y, size, angle, color, mockup) {
  // draw guns below 
  for (let gun of mockup.guns) {
    let gx = gun.offset * Math.cos(gun.direction + gun.angle + angle);
    let gy = gun.offset * Math.sin(gun.direction + gun.angle + angle);

    drawTrapezoid(x + gx, y + gy, gun.length, gun.width, angle + gun.angle, gun.aspect, "#808080");
  }

  ctx.lineWidth = 5;
  drawPoly(x, y, size, mockup.shape, angle, color);

  // draw turrets above
  for (let turret of mockup.turrets) {
    drawPoly(turret.x + x, turret.y + y, turret.size, turret.shape, angle + turret.angle, "#808080");
  }
}

function offsetHex(hex) {
  const color = parseInt(hex.slice(1), 16);
  const r = clamp((color >> 16) & 0xff);
  const g = clamp((color >> 8) & 0xff);
  const b = clamp(color & 0xff);

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function drawTrapezoid(x, y, length, width, angle, aspect, color, strokeColor = offsetHex(color)) {
  const h1 = aspect > 0 ? width * aspect : width;
  const h2 = aspect > 0 ? width : -width / aspect;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  
  ctx.beginPath();
  ctx.moveTo(0, h2);
  ctx.lineTo(length * 2, h1);
  ctx.lineTo(length * 2, -h1);
  ctx.lineTo(0, -h2);
  
  ctx.lineWidth = 5;
  ctx.fillStyle = color;
  ctx.strokeStyle = strokeColor;
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawPoly(x, y, radius, shape, angle, color, strokeColor = offsetHex(color)) {
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

export {
  drawConnecting,
  drawDisconnected,
  drawEntities
};
