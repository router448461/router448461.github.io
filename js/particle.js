// js/particle.js
export class Particle {
  constructor(x, y, w, h, cfg) {
    this.x   = x;
    this.y   = y;
    this.w   = w;
    this.h   = h;
    this.cfg = cfg;

    // random unit direction
    const theta = Math.random() * Math.PI * 2;
    this.vx     = Math.cos(theta) * cfg.baseSpeed;
    this.vy     = Math.sin(theta) * cfg.baseSpeed;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    // bounce at edges
    if (this.x <= 0 || this.x >= this.w) this.vx *= -1;
    if (this.y <= 0 || this.y >= this.h) this.vy *= -1;
  }

  draw(ctx) {
    ctx.fillStyle = this.cfg.particleColor;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}
