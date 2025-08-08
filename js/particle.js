export class Particle {
  constructor(width, height, cfg) {
    this.W   = width;
    this.H   = height;
    this.cfg = cfg;

    // start at random position
    this.x = Math.random() * this.W;
    this.y = Math.random() * this.H;

    // velocity vector
    const angle = Math.random() * Math.PI * 2;
    const speed = cfg.baseSpeed + (Math.random() - 0.5) * cfg.speedVariance;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    this.radius = cfg.particleRadius;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    // bounce off edges
    if (this.x < 0 || this.x > this.W) this.vx *= -1;
    if (this.y < 0 || this.y > this.H) this.vy *= -1;
  }

  draw(ctx) {
    ctx.fillStyle = this.cfg.particleColor;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}
