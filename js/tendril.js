export class Tendril {
  constructor(origin, options = {}) {
    this.origin = origin;
    this.points = [];
    this.length = options.length || 20;
    this.spacing = options.spacing || 10;
    this.damping = options.damping || 0.15;
    this.attraction = options.attraction || 0.2;

    for (let i = 0; i < this.length; i++) {
      this.points.push({
        x: origin.x,
        y: origin.y,
        vx: 0,
        vy: 0
      });
    }
  }

  update(target) {
    const head = this.points[0];
    const dx = target.x - head.x;
    const dy = target.y - head.y;
    head.vx += dx * this.attraction;
    head.vy += dy * this.attraction;

    for (let i = 0; i < this.points.length; i++) {
      const p = this.points[i];
      p.vx *= 1 - this.damping;
      p.vy *= 1 - this.damping;
      p.x += p.vx;
      p.y += p.vy;

      if (i > 0) {
        const prev = this.points[i - 1];
        const dx = prev.x - p.x;
        const dy = prev.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const diff = this.spacing - dist;
        const angle = Math.atan2(dy, dx);
        p.x -= Math.cos(angle) * diff * 0.5;
        p.y -= Math.sin(angle) * diff * 0.5;
        prev.x += Math.cos(angle) * diff * 0.5;
        prev.y += Math.sin(angle) * diff * 0.5;
      }
    }
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 1; i < this.points.length; i++) {
      ctx.lineTo(this.points[i].x, this.points[i].y);
    }
    ctx.strokeStyle = 'rgba(0, 255, 128, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}
