// js/particle.js
export class Particle {
  constructor(x, y, w, h, cfg) {
    this.x   = x;
    this.y   = y;
    this.w   = w;
    this.h   = h;
    this.cfg = cfg;

    const θ         = Math.random() * Math.PI * 2;
    const variance  = 1 + (Math.random()-0.5) * cfg.speedVariance;
    this.vx         = Math.cos(θ) * cfg.baseSpeed * variance;
    this.vy         = Math.sin(θ) * cfg.baseSpeed * variance;
  }

  update() {
    // slight pull toward center for disciplined formation
    const cx = this.w/2, cy = this.h/2;
    this.vx += (cx - this.x) * 0.0005;
    this.vy += (cy - this.y) * 0.0005;

    this.x += this.vx;
    this.y += this.vy;

    // bounce
    if (this.x <= 0 || this.x >= this.w) this.vx *= -1;
    if (this.y <= 0 || this.y >= this.h) this.vy *= -1;
  }

  draw(ctx) {
    ctx.fillStyle = this.cfg.particleColor;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.cfg.particleRadius, 0, Math.PI*2);
    ctx.fill();
  }
}
