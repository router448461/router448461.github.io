import { config } from './config.js';
import { Particle } from './particle.js';

export class Network {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.W = canvas.width;
    this.H = canvas.height;

    this.particles = Array.from({ length: config.particleCount }, () => new Particle(this.W, this.H, config));
  }

  updateDimensions(width, height) {
    this.W = width;
    this.H = height;
    this.particles.forEach(p => {
      p.W = width;
      p.H = height;
    });
  }

  updateAndDraw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);

    for (const p of this.particles) {
      p.update();
      p.draw(ctx);
    }

    for (let i = 0; i < this.particles.length; i++) {
      const a = this.particles[i];
      for (let j = i + 1; j < this.particles.length; j++) {
        const b = this.particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < config.maxLinkDistance) {
          const flicker = Math.random() < config.lineFlickerFreq;
          ctx.strokeStyle = flicker ? config.glowColor : config.lineColor;
          ctx.lineWidth = config.lineThickness;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
  }
}
