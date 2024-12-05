const TAU = 2 * Math.PI;

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpAngle(a, b, t) {
  let diff = (b - a) % TAU;

  if (diff <= -Math.PI) diff += TAU;
  else if (diff > Math.PI) diff -= TAU;

  return a + diff * t;
}

async function fetchAsync(url) {
  let response = await fetch(url);
  let data = await response.text();

  return data;
}

export {
  lerp,
  lerpAngle,
  fetchAsync
};
