export class ACLParticle {
  constructor(W, H, color) {
    this.W = W;
    this.H = H;
    this.baseColor = color;
    this.x = Math.random() * W;
    this.y = Math.random() * H;

    const angle = Math.random() * Math.PI * 2;
    const speed = 0.3 + (Math.random() - 0.5) * 0.3;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.radius = 2.2;

    this.lastActive = performance.now();
    this.state = 'normal'; // 'elevated', 'idle', 'quarantine'
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    // Bounce off bounds
    if (this.x < 0 || this.x > this.W) this.vx *= -1;
    if (this.y < 0 || this.y > this.H) this.vy *= -1;

    // State logic (simulate posture based on lastActive)
    const now = performance.now();
    const idleThreshold = 6000; // ms

    if (now - this.lastActive > idleThreshold && this.state !== 'quarantine') {
      this.state = 'idle';
    }
  }

  pingActivity() {
    this.lastActive = performance.now();
    if (this.state !== 'quarantine') {
      this.state = 'elevated';
      setTimeout(() => {
        if (this.state === 'elevated') this.state = 'normal';
      }, 5000);
    }
  }

  quarantine() {
    this.state = 'quarantine';
  }

  draw(ctx) {
    let fill = this.baseColor;
    let radius = this.radius;

    switch (this.state) {
      case 'idle':
        fill = 'rgba(60,60,60,0.5)';
        break;
      case 'elevated':
        radius *= 1.6;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(255, 0, 0, 0.4)';
        break;
      case 'quarantine':
        fill = 'rgba(100, 0, 0, 0.3)';
        break;
    }

    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
  }
}
