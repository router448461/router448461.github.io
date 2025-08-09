import { config } from './config.js';
import { Particle } from './particle.js';

export class Network {
  constructor(canvas, cfg = config) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.cfg = cfg;

    this.W = 0;
    this.H = 0;
    this.dpr = this.cfg.pixelRatio;

    this.particles = [];
  }

  // Backward-compatible alias for your previous callsite
  updateDimensions(width, height) {
    this.resize(width, height, this.dpr);
  }

  // DPR-aware resize for crisp rendering
  resize(width, height, dpr = this.cfg.pixelRatio) {
    this.W = Math.max(1, Math.floor(width));
    this.H = Math.max(1, Math.floor(height));
    this.dpr = dpr;

    // Set actual pixel buffer size
    this.canvas.width = Math.floor(this.W * this.dpr);
    this.canvas.height = Math.floor(this.H * this.dpr);

    // Ensure CSS size matches logical pixels
    this.canvas.style.width = `${this.W}px`;
    this.canvas.style.height = `${this.H}px`;

    // Scale drawing operations into CSS pixel space
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    // Initialize or update particles
    if (this.particles.length === 0) {
      this.particles = Array.from({ length: this.cfg.particleCount }, () =>
        new Particle(this.W, this.H, this.cfg)
      );
    } else {
      this.particles.forEach(p => p.setBounds(this.W, this.H));
    }
  }

  updateAndDraw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);

    // Update/draw particles
    for (const p of this.particles) {
      p.update();
      p.draw(ctx);
    }

    // Draw links
    const { maxLinkDistance, lineFlickerFreq, lineThickness, lineColor, glowColor } = this.cfg;
    ctx.lineWidth = lineThickness;

    for (let i = 0; i < this.particles.length; i++) {
      const a = this.particles[i];
      for (let j = i + 1; j < this.particles.length; j++) {
        const b = this.particles[j];

        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);

        if (dist < maxLinkDistance) {
          ctx.strokeStyle = (Math.random() < lineFlickerFreq) ? glowColor : lineColor;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
  }
}
