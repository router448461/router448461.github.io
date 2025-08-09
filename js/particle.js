export class Particle {
  constructor(width, height, cfg) {
    this.W = width;
    this.H = height;
    this.cfg = cfg;

    // Randomized start position
    this.x = Math.random() * this.W;
    this.y = Math.random() * this.H;

    // Velocity vector with bounded variance
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.max(0.05, cfg.baseSpeed + (Math.random() - 0.5) * cfg.speedVariance);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    this.radius = cfg.particleRadius;
  }

  setBounds(width, height) {
    this.W = width;
    this.H = height;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    // Bounce and clamp to avoid particles escaping bounds
    if (this.x < 0) { this.x = 0; this.vx *= -1; }
    if (this.x > this.W) { this.x = this.W; this.vx *= -1; }
    if (this.y < 0) { this.y = 0; this.vy *= -1; }
    if (this.y > this.H) { this.y = this.H; this.vy *= -1; }
  }

  draw(ctx) {
    ctx.shadowBlur = this.cfg.glowBlur;
    ctx.shadowColor = this.cfg.glowColor;
    ctx.fillStyle = this.cfg.particleColor;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0; // reset for subsequent strokes
  }
}
