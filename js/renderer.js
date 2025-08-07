import config from './config.js';
import { SpatialGrid } from './spatialGrid.js';

export class Renderer {
  constructor(ctx, width, height) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.grid = new SpatialGrid(width, height, config.gridCellSize);
  }

  applyHiDPI() {
    const dpr = window.devicePixelRatio || 1;
    this.ctx.canvas.width  = this.width * dpr;
    this.ctx.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
  }

  clear() {
    this.ctx.fillStyle = `rgba(10,10,10,${config.trailAlpha})`;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawParticles(particles) {
    this.grid.clear();
    for (const p of particles) {
      p.draw(this.ctx);
      this.grid.insert(p);
    }
  }

  drawLines(particles) {
    for (const p of particles) {
      const neighbors = this.grid.query(p);
      for (const q of neighbors) {
        if (p === q) continue;
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.hypot(dx, dy);
        if (dist < config.lineMaxDist) {
          const alpha = 1 - dist / config.lineMaxDist;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(q.x, q.y);
          this.ctx.strokeStyle = p.layer.color.replace(/[\d\.]+\)$/,
            `${alpha})`);
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
        }
      }
    }
  }

  render(allParticles) {
    this.clear();
    for (const layerParticles of allParticles) {
      this.drawParticles(layerParticles);
      this.drawLines(layerParticles);
    }
  }
}
