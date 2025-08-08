import { config as cfg } from './config.js';
import { Particle } from './particle.js';

export class Network {
  constructor(canvas) {
    this.canvas    = canvas;
    this.ctx       = canvas.getContext('2d');
    this.cfg       = cfg;
    this.W         = canvas.width;
    this.H         = canvas.height;
    this.particles = this._createParticles();
    this._time     = 0;
  }

  updateAndDraw() {
    const { ctx, cfg, W, H } = this;

    // clear canvas
    ctx.clearRect(0, 0, W, H);

    // compute pulsing alpha
    const pulse = 0.5 + Math.sin(this._time * cfg.pulseSpeed) * 0.5;
    this._time++;

    // DRAW PARTICLES WITH GLOW
    ctx.save();
    ctx.shadowBlur   = cfg.glowBlur;
    ctx.shadowColor  = cfg.glowColor;
    ctx.globalAlpha  = pulse;

    this.particles.forEach(p => {
      p.update();
      p.draw(ctx);
    });

    ctx.restore();

    // LINKS WITH OCCASIONAL FLICKER
    this._buildGrid();
    this._drawLinks();
  }

  _drawLinks() {
    const { ctx, particles, cfg } = this;
    const maxD2 = cfg.maxLinkDistance * cfg.maxLinkDistance;

    ctx.strokeStyle = cfg.lineColor;
    ctx.lineWidth   = cfg.lineThickness;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;

        if (dx * dx + dy * dy < maxD2) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
  }

  _createParticles() {
    return Array.from({ length: this.cfg.particleCount }, () =>
      new Particle(this.W, this.H, this.cfg)
    );
  }

  _buildGrid() {
    // optional spatial partitioning stub
  }
}
