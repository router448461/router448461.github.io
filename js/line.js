import { ctx, width, height } from './canvas.js';
import { CONFIG } from './config.js';

export class LineEntity {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;

    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * CONFIG.initialSpeed;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    this.radius = 1 + Math.random() * 2;
  }

  update(delta) {
    const dx = CONFIG.centerX - this.x;
    const dy = CONFIG.centerY - this.y;
    const dist = Math.hypot(dx, dy);

    const dirX = dx / dist;
    const dirY = dy / dist;

    const force = CONFIG.magneticStrength * (1 - Math.min(dist / CONFIG.magneticFalloff, 1));
    this.vx += dirX * force;
    this.vy += dirY * force;

    this.vx *= CONFIG.damping;
    this.vy *= CONFIG.damping;

    const velocity = Math.hypot(this.vx, this.vy);
    if (velocity > CONFIG.maxVelocity) {
      this.vx *= CONFIG.maxVelocity / velocity;
      this.vy *= CONFIG.maxVelocity / velocity;
    }

    this.x += this.vx * delta;
    this.y += this.vy * delta;

    if (this.x < 0) {
      this.x = 0;
      this.vx *= -CONFIG.bounceLoss;
    } else if (this.x > width) {
      this.x = width;
      this.vx *= -CONFIG.bounceLoss;
    }

    if (this.y < 0) {
      this.y = 0;
      this.vy *= -CONFIG.bounceLoss;
    } else if (this.y > height) {
      this.y = height;
      this.vy *= -CONFIG.bounceLoss;
    }
  }

  drawLine() {
    const dx = this.x - CONFIG.centerX;
    const dy = this.y - CONFIG.centerY;
    const dist = Math.hypot(dx, dy);
    const opacity = 1 - dist / CONFIG.magneticFalloff;

    ctx.beginPath();
    ctx.moveTo(CONFIG.centerX, CONFIG.centerY);
    ctx.lineTo(this.x, this.y);
    ctx.strokeStyle = `rgba(0, 255, 0, ${opacity})`;
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  drawDot() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = CONFIG.dotColor;
    ctx.fill();
  }
}
