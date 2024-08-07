const lerp = (a, b, t) => {
  return a + (b - a) * t;
}

const lerpAngle = (a, b, t) => {
  let diff = (b - a + Math.PI) % (2 * Math.PI) - Math.PI;
  return a + diff * t;
}

const fetchAsync = async (url) => {
  let response = await fetch(url);
  let data = await response.text();
  return data;
}

export { lerp, lerpAngle, fetchAsync };
