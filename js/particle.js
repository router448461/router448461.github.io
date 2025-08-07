import { ctx, width, height } from './canvas.js';
import { CONFIG } from './config.js';

const centerX = width / 2;
const centerY = height / 2;

export class Particle {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;

    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * CONFIG.initialSpeed;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    this.baseRadius = 1 + Math.random() * 2;
    this.radius = this.baseRadius;
  }

  update(delta) {
    const dx = centerX - this.x;
    const dy = centerY - this.y;
    const dist = Math.hypot(dx, dy);

    // Normalize direction
    const dirX = dx / dist;
    const dirY = dy / dist;

    // Magnetic pull toward center
    const force = CONFIG.magneticStrength * (1 - Math.min(dist / CONFIG.magneticFalloff, 1));
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

    // Update position
    this.x += this.vx * delta;
    this.y += this.vy * delta;

    // Soft bounce
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

    // Shrink near center
    const scale = 1 - Math.min(dist / CONFIG.sinkRadius, 1);
    this.radius = this.baseRadius * scale;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = CONFIG.dotColor;
    ctx.fill();
  }
}
