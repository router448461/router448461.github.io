// js/noise.js

/**
 * Returns a small random force vector.
 * Replace with Perlin/Simplex noise for smoother fields.
 */
export function noise(position, pointer) {
  const magnitude = 0.5;
  const angle = Math.random() * Math.PI * 2;
  return {
    x: Math.cos(angle) * magnitude,
    y: Math.sin(angle) * magnitude
  };
}
