function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpAngle(a, b, t) {
  let diff = b - a;

  while (diff < -Math.PI) diff += 2 * Math.PI;
  while (diff > Math.PI) diff -= 2 * Math.PI;

  return a + diff * t;
};

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
