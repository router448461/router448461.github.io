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
    this.trail = [];
    this.type = this.assignType();
  }

  assignType() {
    const speed = Math.hypot(this.vx, this.vy);
    if (speed > CONFIG.maxVelocity * 0.75) return 'recon';
    if (speed < CONFIG.maxVelocity * 0.25) return 'comms';
    return 'rogue';
  }

  update(delta) {
    const dx = centerX - this.x;
    const dy = centerY - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist < CONFIG.sinkRadius) {
      // Curved pull: add perpendicular drift
      const angle = Math.atan2(dy, dx);
      const curve = 0.0003;
      this.vx += Math.cos(angle) * CONFIG.pullStrength - Math.sin(angle) * curve;
      this.vy += Math.sin(angle) * CONFIG.pullStrength + Math.cos(angle) * curve;

      const scale = 1 - Math.min(dist / CONFIG.sinkRadius, 1);
      this.radius = this.baseRadius * scale;
    } else {
      this.radius = this.baseRadius;
    }

    // Apply global drift
    this.vx += CONFIG.driftVector.x;
    this.vy += CONFIG.driftVector.y;

    this.x += this.vx * delta;
    this.y += this.vy * delta;

    if (this.x < 0 || this.x > width)  this.vx *= -1;
    if (this.y < 0 || this.y > height) this.vy *= -1;

    // Update trail
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 10) this.trail.shift();
  }

  drawTrail() {
    for (let i = 0; i < this.trail.length; i++) {
      const t = this.trail[i];
      const alpha = i / this.trail.length;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 1, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha * CONFIG.trailFade})`;
      ctx.fill();
    }
  }

  draw() {
    this.drawTrail();

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

    let color = CONFIG.dotColor;
    if (this.type === 'recon') color = '#ff0';
    if (this.type === 'comms') color = '#0ff';
    if (this.type === 'rogue') color = '#f00';

    ctx.fillStyle = color;
    ctx.fill();
  }
}
