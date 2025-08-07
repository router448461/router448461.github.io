import { ctx, width, height } from './canvas.js';
import { CONFIG } from './config.js';

export class Particle {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;

    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * CONFIG.initialSpeed;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    this.radius = 2 + Math.random() * 2;
  }

  update(delta) {
    const dx = CONFIG.centerX - this.x;
    const dy = CONFIG.centerY - this.y;
    const dist = Math.hypot(dx, dy);

    const dirX = dx / dist;
    const dirY = dy / dist;

    // Nonlinear magnetic pull with easing
    const force = CONFIG.magneticStrength * Math.pow(1 - Math.min(dist / CONFIG.magneticFalloff, 1), 2);
    this.vx += dirX * force;
    this.vy += dirY * force;

    // Damping
    this.vx *= CONFIG.damping;
    this.vy *= CONFIG.damping;

    // Clamp velocity
    const velocity = Math.hypot(this.vx, this.vy);
    if (velocity > CONFIG.maxVelocity) {
      this.vx *= CONFIG.maxVelocity / velocity;
      this.vy *= CONFIG.maxVelocity / velocity;
    }

    this.x += this.vx * delta;
    this.y += this.vy * delta;

    // Edge wrapping
    const margin = CONFIG.edgeWrapMargin;
    if (this.x < -margin) this.x = width + margin;
    if (this.x > width + margin) this.x = -margin;
    if (this.y < -margin) this.y = height + margin;
    if (this.y > height + margin) this.y = -margin;
  }

  drawLine() {
    const dx = this.x - CONFIG.centerX;
    const dy = this.y - CONFIG.centerY;
    const dist = Math.hypot(dx, dy);
    const opacity = 1 - dist / CONFIG.magneticFalloff;
    const color = CONFIG.lineColor.replace('OPACITY', opacity.toFixed(2));

    ctx.beginPath();
    ctx.moveTo(CONFIG.centerX, CONFIG.centerY);
    ctx.lineTo(this.x, this.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.6;
    ctx.stroke();
  }

  drawDot() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = CONFIG.dotColor;
    ctx.fill();
  }
}
