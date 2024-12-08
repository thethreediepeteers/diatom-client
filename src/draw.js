import {
  lerp,
  lerpAngle
} from "./util.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { alpha: false });

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

function drawHealth(x, y, health, maxHealth, r, color, strokeColor) {
  ctx.beginPath();

  ctx.fillStyle = strokeColor;
  ctx.roundRect(x - maxHealth, y + r + 10, maxHealth * 2, 10, 5);
  ctx.fill();

  ctx.beginPath();

  ctx.fillStyle = color;
  ctx.roundRect(x - maxHealth + 2, y + r + 12, (health * 2 - 4), 6, 5);
  ctx.fill();
}

function drawEntities() {
  if (!global || !global.player?.serverData?.x) return;
  
  const tmpDist = Math.hypot(camX - global.player.x, camY - global.player.y);
  const tmpDir = Math.atan2(global.player.y - camY, global.player.x - camX);
  const camSpd = Math.min(tmpDist * 0.01 * global.deltaTime, tmpDist);

  camX += camSpd * Math.cos(tmpDir);
  camY += camSpd * Math.sin(tmpDir);

  const xOffset = camX - global.screenWidthHalf;
  const yOffset = camY - global.screenHeightHalf;

  for (let [id, entity] of global.entities) {
    if (entity.dead) continue;

    entity.dt = entity.dt + global.deltaTime;

    const distX = entity.serverData.x - entity.xOld;
    const distY = entity.serverData.y - entity.yOld;

    const rate = entity.dt / 170;
    const targetX = entity.xOld + distX * rate;
    const targetY = entity.yOld + distY * rate;
    
    const targetHealth = lerp(entity.health, entity.serverData.health, 0.2);
    const targetMaxHealth = lerp(entity.maxHealth, entity.serverData.maxHealth, 0.2);

    entity.x = targetX;
    entity.y = targetY;
    
    entity.health = targetHealth;
    entity.maxHealth = targetMaxHealth;
    
    entity.angle = lerpAngle(entity.angle, entity.serverData.angle, 0.3);

    let x = entity.x - xOffset;
    let y = entity.y - yOffset;

    drawEntity(x, y, entity.size, entity.angle, entity.color, entity.strokeColor, global.mockups.get(entity.mockupId));
    drawHealth(x, y, entity.health, entity.maxHealth, entity.size, entity.color, entity.strokeColor);
  }
}

function drawEntity(x, y, size, angle, color, strokeColor, mockup) {
  for (let gun of mockup.guns) {
    let gx = gun.offset * Math.cos(gun.direction + gun.angle + angle);
    let gy = gun.offset * Math.sin(gun.direction + gun.angle + angle);

    drawTrapezoid(x + gx, y + gy, gun.length, gun.width, angle + gun.angle, gun.aspect, "#808080", "#606060");
  }

  ctx.lineWidth = 5;
  drawPoly(x, y, size, mockup.shape, angle, color, strokeColor);

  for (let turret of mockup.turrets) {
    drawPoly(turret.x + x, turret.y + y, turret.size, turret.shape, angle + turret.angle, "#808080", "#606060");
  }
}

function drawTrapezoid(x, y, length, width, angle, aspect, color, strokeColor) {
  const h1 = aspect > 0 ? width * aspect : width;
  const h2 = aspect > 0 ? width : -width / aspect;

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
  ctx.resetTransform();
}

function drawPoly(x, y, radius, shape, angle, color, strokeColor) {
  angle += shape % 2 ? 0 : Math.PI / shape;

  ctx.beginPath();
  if (shape) {
    angle += (shape % 1) * Math.PI * 2;

    for (let i = 0; i < shape; i++) {
      let theta = (i / shape) * 2 * Math.PI + angle;

      ctx.lineTo(x + radius * Math.cos(theta), y + radius * Math.sin(theta));
    }
  } else ctx.arc(x, y, radius, 0, 2 * Math.PI);

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
