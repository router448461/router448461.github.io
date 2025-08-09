export class ACLParticle {
  constructor(W, H, color) {
    this.W = W;
    this.H = H;
    this.color = color;
    this.x = Math.random() * W;
    this.y = Math.random() * H;

    const angle = Math.random() * Math.PI * 2;
    const speed = 0.3 + (Math.random() - 0.5) * 0.3;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.radius = 2.2;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > this.W) this.vx *= -1;
    if (this.y < 0 || this.y > this.H) this.vy *= -1;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}
