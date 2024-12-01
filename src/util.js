const PI2 = 2 * Math.PI;

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpAngle(a, b, t) {
  let diff = (b - a) % PI2;

  if (diff <= -Math.PI) diff += PI2;
  else if (diff > Math.PI) diff -= PI2;

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
