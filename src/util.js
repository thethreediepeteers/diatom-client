const lerp = (a, b, t) => {
  return a + (b - a) * t;
}

const lerpAngle = (a, b, t) => {
  let diff = (b - a + Math.PI) % (2 * Math.PI) - Math.PI;
  return a + diff * t;
}
export { lerp, lerpAngle };
