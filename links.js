// links.js
export function buildGrid(particles, cellSize) {
  const grid = new Map();
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    const ix = (p.x / cellSize) | 0;
    const iy = (p.y / cellSize) | 0;
    const key = ix + ',' + iy;
    let bucket = grid.get(key);
    if (!bucket) {
      bucket = [];
      grid.set(key, bucket);
    }
    bucket.push(i);
  }
  return grid;
}

export function drawLinks(ctx, particles, grid, THEME, linkDist, lineLfo) {
  const [rC, gC, bC] = THEME.lineRGB;
  const maxA = THEME.lineMaxAlpha * lineLfo;
  const maxD2 = linkDist * linkDist;
  ctx.lineWidth = THEME.lineWidth;

  for (let i = 0; i < particles.length; i++) {
    const a = particles[i];
    const ix = (a.x / linkDist) | 0;
    const iy = (a.y / linkDist) | 0;

    for (let gx = -1; gx <= 1; gx++) {
      for (let gy = -1; gy <= 1; gy++) {
        const key = (ix + gx) + ',' + (iy + gy);
        const bucket = grid.get(key);
        if (!bucket) continue;

        for (let k = 0; k < bucket.length; k++) {
          const j = bucket[k];
          if (j <= i) continue;
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > maxD2) continue;

          const dist = Math.sqrt(d2);
          const alpha = maxA * (1 - dist / linkDist);
          ctx.strokeStyle = `rgba(${rC},${gC},${bC},${alpha})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
  }
}
