// js/network.js
import { Particle } from './particle.js';
import { config }   from './config.js';

export class Network {
  constructor(canvas) {
    this.canvas    = canvas;
    this.ctx       = canvas.getContext('2d');
    this.cfg       = config;
    this.particles = [];
    this._onResize();
    window.addEventListener('resize', () => this._onResize());
    this._spawnParticles();
  }

  _onResize() {
    // reset transform before resizing/scaling
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);

    const pr = this.cfg.pixelRatio;
    this.W = this.canvas.width  = Math.floor(window.innerWidth  * pr);
    this.H = this.canvas.height = Math.floor(window.innerHeight * pr);

    this.cols = Math.ceil((this.W/pr) / this.cfg.gridCellSize);
    this.rows = Math.ceil((this.H/pr) / this.cfg.gridCellSize);

    this.ctx.scale(pr, pr);
  }

  _spawnParticles() {
    this.particles = [];
    for (let i = 0; i < this.cfg.particleCount; i++) {
      const x = Math.random() * (this.W / this.cfg.pixelRatio);
      const y = Math.random() * (this.H / this.cfg.pixelRatio);
      this.particles.push(
        new Particle(
          x, y,
          this.W / this.cfg.pixelRatio,
          this.H / this.cfg.pixelRatio,
          this.cfg
        )
      );
    }
  }

  _buildGrid() {
    // spatial‐hash grid: map "col,row" → [particles]
    this.grid = Object.create(null);

    const cs = this.cfg.gridCellSize;
    this.particles.forEach(p => {
      const ci = Math.floor(p.x / cs);
      const ri = Math.floor(p.y / cs);
      const key = `${ci},${ri}`;
      (this.grid[key] || (this.grid[key] = [])).push(p);
    });
  }

  _drawLinks() {
    const { ctx, cfg } = this;
    const maxD2 = cfg.maxLinkDistance * cfg.maxLinkDistance;
    const cs    = cfg.gridCellSize;
    ctx.strokeStyle = cfg.lineColor;
    ctx.lineWidth   = cfg.lineThickness;

    for (const key in this.grid) {
      const [ci, ri] = key.split(',').map(Number);
      const bucket   = this.grid[key];

      // inspect this bucket + all 8 neighbors
      for (let di = -1; di <= 1; di++) {
        for (let dr = -1; dr <= 1; dr++) {
          const neighbor = this.grid[`${ci+di},${ri+dr}`];
          if (!neighbor) continue;

          // draw pairs (i in bucket, j in neighbor)
          bucket.forEach(a => {
            neighbor.forEach(b => {
              // avoid duplicate self or cross-pairing twice:
              if (a === b || a._linkedWith?.has(b)) return;

              const dx = a.x - b.x;
              const dy = a.y - b.y;
              if (dx*dx + dy*dy < maxD2) {
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
                // mark as linked this frame to skip reverse
                a._linkedWith = a._linkedWith || new Set();
                b._linkedWith = b._linkedWith || new Set();
                a._linkedWith.add(b);
                b._linkedWith.add(a);
              }
            });
          });
        }
      }
    }
    // cleanup link flags
    this.particles.forEach(p => p._linkedWith = null);
  }

  updateAndDraw() {
    // clear full viewport
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // update & draw particles
    this.particles.forEach(p => {
      p.update();
      p.draw(this.ctx);
    });

    // build spatial grid then draw links
    this._buildGrid();
    this._drawLinks();
  }
}
