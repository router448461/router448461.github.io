class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = (Math.random() - 0.5) * 2;
    this.radius = 2;
    this.damping = 0.01;
    this.attraction = 0.0002;
    this.maxSpeed = 2.5;
  }

  update(center, mouse) {
    // Gentle central attraction
    const dx = center.x - this.x;
    const dy = center.y - this.y;
    this.vx += dx * this.attraction;
    this.vy += dy * this.attraction;

    // Soft mouse repulsion
    const mx = this.x - mouse.x;
    const my = this.y - mouse.y;
    const dist = Math.sqrt(mx * mx + my * my);
    if (dist < 150) {
      const force = (150 - dist) / 3000;
      this.vx += mx * force;
      this.vy += my * force;
    }

    // Damping
    this.vx *= 1 - this.damping;
    this.vy *= 1 - this.damping;

    // Velocity clamping
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > this.maxSpeed) {
      const scale = this.maxSpeed / speed;
      this.vx *= scale;
      this.vy *= scale;
    }

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
