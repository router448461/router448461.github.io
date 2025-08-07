import { ctx, width, height } from './canvas.js';
import { CONFIG } from './config.js';

const centerX = width / 2;
const centerY = height / 2;

export class Particle {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * CONFIG.maxVelocity;
    this.vy = (Math.random() - 0.5) * CONFIG.maxVelocity;
    this.baseRadius = 1 + Math.random() * 2;
    this.radius = this.baseRadius;
  }

  update(delta) {
    const dx = centerX - this.x;
    const dy = centerY - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist < CONFIG.sinkRadius) {
      // Apply central pull
      this.vx += dx * CONFIG.pullStrength;
      this.vy += dy * CONFIG.pullStrength;

      // Scale radius based on proximity to center
      const scale = 1 - Math.min(dist / CONFIG.sinkRadius, 1);
      this.radius = this.baseRadius * scale;
    } else {
      this.radius = this.baseRadius;
    }

    this.x += this.vx * delta;
    this.y += this.vy * delta;

    if (this.x < 0 || this.x > width)  this.vx *= -1;
    if (this.y < 0 || this.y > height) this.vy *= -1;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = CONFIG.dotColor;
    ctx.fill();
  }
}
