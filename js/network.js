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
    const pr = this.cfg.pixelRatio;
    this.W = this.canvas.width  = Math.floor(window.innerWidth  * pr);
    this.H = this.canvas.height = Math.floor(window.innerHeight * pr);
    this.ctx.scale(pr, pr);
  }

  _spawnParticles() {
    this.particles = [];
    for (let i = 0; i < this.cfg.particleCount; i++) {
      const x = Math.random() * this.W / this.cfg.pixelRatio;
      const y = Math.random() * this.H / this.cfg.pixelRatio;
      this.particles.push(new Particle(x, y, this.W / this.cfg.pixelRatio, this.H / this.cfg.pixelRatio, this.cfg));
    }
  }

  _drawLinks() {
    const { ctx, particles, cfg } = this;
    const maxD2 = cfg.maxLinkDistance * cfg.maxLinkDistance;

    ctx.strokeStyle = cfg.lineColor;
    ctx.lineWidth   = 1;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        if (dx*dx + dy*dy < maxD2) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
  }

  updateAndDraw() {
    // clear full viewport
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // update & draw points
    this.particles.forEach(p => {
      p.update();
      p.draw(this.ctx);
    });

    // draw connecting lines
    this._drawLinks();
  }
}
