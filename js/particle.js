export class Particle {
  constructor(width, height, cfg) {
    this.W = width;
    this.H = height;
    this.cfg = cfg;

    this.x = Math.random() * this.W;
    this.y = Math.random() * this.H;

    const angle = Math.random() * 2 * Math.PI;
    const speed = cfg.baseSpeed + (Math.random() - 0.5) * cfg.speedVariance;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    this.radius = cfg.particleRadius;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x <= 0 || this.x >= this.W) this.vx *= -1;
    if (this.y <= 0 || this.y >= this.H) this.vy *= -1;
  }

  draw(ctx) {
    ctx.shadowBlur = this.cfg.glowBlur;
    ctx.shadowColor = this.cfg.glowColor;
    ctx.fillStyle = this.cfg.particleColor;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}
