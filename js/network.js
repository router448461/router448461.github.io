// js/network.js
import { Particle } from './particle.js';
import { config }   from './config.js';

export class Network {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.cfg    = config;
    this.particles = [];
    this._angle    = 0;              // for scan line

    this._onResize();
    window.addEventListener('resize', () => this._onResize());
    this._spawnParticles();
  }

  _onResize() {
    const pr = this.cfg.pixelRatio;
    this.ctx.setTransform(1,0,0,1,0,0);

    this.W = this.canvas.width  = Math.floor(window.innerWidth  * pr);
    this.H = this.canvas.height = Math.floor(window.innerHeight * pr);

    this.cols = Math.ceil((this.W/pr) / this.cfg.cellSize);
    this.rows = Math.ceil((this.H/pr) / this.cfg.cellSize);

    this.ctx.scale(pr, pr);

    // Pre-draw static grid + crosshair on an offscreen buffer
    this._buildHUDBuffer();
  }

  _buildHUDBuffer() {
    const pr = this.cfg.pixelRatio;
    const w  = this.W / pr;
    const h  = this.H / pr;

    this.hudBuffer = document.createElement('canvas');
    this.hudBuffer.width  = this.W;
    this.hudBuffer.height = this.H;
    const bctx = this.hudBuffer.getContext('2d');
    bctx.scale(pr, pr);

    // Grid
    bctx.strokeStyle = this.cfg.gridColor;
    bctx.lineWidth   = 1;
    for (let x = 0; x <= w; x += this.cfg.gridSize) {
      bctx.beginPath();
      bctx.moveTo(x, 0);
      bctx.lineTo(x, h);
      bctx.stroke();
    }
    for (let y = 0; y <= h; y += this.cfg.gridSize) {
      bctx.beginPath();
      bctx.moveTo(0, y);
      bctx.lineTo(w, y);
      bctx.stroke();
    }

    // Crosshair
    bctx.strokeStyle = this.cfg.crosshairColor;
    bctx.lineWidth   = 2;
    bctx.beginPath();
    bctx.moveTo(w/2, 0);
    bctx.lineTo(w/2, h);
    bctx.moveTo(0, h/2);
    bctx.lineTo(w, h/2);
    bctx.stroke();
  }

  _spawnParticles() {
    this.particles = [];
    const w = this.W / this.cfg.pixelRatio;
    const h = this.H / this.cfg.pixelRatio;
    for (let i = 0; i < this.cfg.particleCount; i++) {
      this.particles.push(new Particle(
        Math.random()*w,
        Math.random()*h,
        w, h,
        this.cfg
      ));
    }
  }

  _buildGrid() {
    this.grid = Object.create(null);
    const cs = this.cfg.cellSize;
    this.particles.forEach(p => {
      const ci = Math.floor(p.x / cs);
      const ri = Math.floor(p.y / cs);
      const key = `${ci},${ri}`;
      (this.grid[key] || (this.grid[key] = [])).push(p);
    });
  }

  _drawLinks() {
    const { ctx, cfg, grid } = this;
    const maxD2 = cfg.maxLinkDistance * cfg.maxLinkDistance;
    ctx.strokeStyle = cfg.lineColor;
    ctx.lineWidth   = cfg.lineThickness;

    for (let key in grid) {
      const [ci, ri] = key.split(',').map(Number);
      const bucket   = grid[key];
      for (let di=-1; di<=1; di++) {
        for (let dr=-1; dr<=1; dr++) {
          const neighbor = grid[`${ci+di},${ri+dr}`];
          if (!neighbor) continue;
          bucket.forEach(a => {
            neighbor.forEach(b => {
              if (a===b || a._linked?.has(b)) return;
              const dx = a.x - b.x, dy = a.y - b.y;
              if (dx*dx + dy*dy < maxD2) {
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
                a._linked = a._linked || new Set();
                b._linked = b._linked || new Set();
                a._linked.add(b);
                b._linked.add(a);
              }
            });
          });
        }
      }
    }
    // cleanup
    this.particles.forEach(p => p._linked = null);
  }

  _drawNoise() {
    const { ctx, cfg, W, H } = this;
    const w = W/cfg.pixelRatio, h = H/cfg.pixelRatio;
    const total = Math.floor(w * h * cfg.noiseDensity);
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    for (let i=0; i<total; i++) {
      ctx.fillRect(Math.random()*w, Math.random()*h, 1, 1);
    }
  }

  _drawScanLine() {
    const { ctx, cfg, W, H } = this;
    const w = W/cfg.pixelRatio, h = H/cfg.pixelRatio;
    const r = Math.hypot(w/2, h/2);

    ctx.save();
    ctx.translate(w/2, h/2);
    ctx.rotate(this._angle);
    ctx.strokeStyle = cfg.scanLineColor;
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(r, 0);
    ctx.stroke();
    ctx.restore();

    this._angle = (this._angle + cfg.scanSpeed) % (Math.PI*2);
  }

  updateAndDraw() {
    // clear
    this.ctx.clearRect(0, 0, this.W, this.H);

    // particles
    this.particles.forEach(p => {
      p.update();
      p.draw(this.ctx);
    });

    // links
    this._buildGrid();
    this._drawLinks();

    // HUD overlay on same canvas
    this.ctx.drawImage(this.hudBuffer, 0, 0, this.W, this.H);
    this._drawNoise();
    this._drawScanLine();
  }
}
