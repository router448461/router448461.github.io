export class ACLParticle {
  constructor(W, H, cfg, center) {
    this.cfg = cfg;

    const theta = Math.random() * Math.PI * 2;
    const radius = Math.sqrt(Math.random()) * center.r * 0.95;
    this.x = center.cx + Math.cos(theta) * radius;
    this.y = center.cy + Math.sin(theta) * radius;

    const ang = Math.random() * Math.PI * 2;
    const spd = Math.max(0.05, cfg.speed.base + (Math.random() - 0.5) * cfg.speed.var);
    this.vx = Math.cos(ang) * spd;
    this.vy = Math.sin(ang) * spd;

    this.cx = center.cx;
    this.cy = center.cy;
    this.rConfine = center.r;

    this.radius = cfg.radius;
    this.color = cfg.color;
  }

  setCenter(center) {
    this.cx = center.cx;
    this.cy = center.cy;
    this.rConfine = center.r;
  }

  update() {
    let ax = 0, ay = 0;

    const dx = this.cx - this.x;
    const dy = this.cy - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist > this.rConfine) {
      ax += (dx / dist) * 0.12;
      ay += (dy / dist) * 0.12;
    } else {
      ax += (dx / (this.rConfine || 1)) * 0.02;
      ay += (dy / (this.rConfine || 1)) * 0.02;
    }

    this.vx = (this.vx + ax) * 0.995;
    this.vy = (this.vy + ay) * 0.995;

    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}
