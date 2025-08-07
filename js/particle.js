class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = (Math.random() - 0.5) * 2;
    this.radius = 2;
    this.damping = 0.05;
    this.attraction = 0.001;
  }

  update(target) {
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    this.vx += dx * this.attraction;
    this.vy += dy * this.attraction;

    this.vx *= 1 - this.damping;
    this.vy *= 1 - this.damping;

    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#00ff80';
    ctx.fill();
  }
}

window.Particle = Particle;
