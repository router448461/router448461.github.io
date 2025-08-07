import config from './config.js';
import { noise } from './noise.js';

export class Particle {
  constructor(width, height, layer) {
    this.layer = layer;
    this.reset(width, height);
  }

  reset(width, height) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    // initial velocity
    this.vx = (Math.random() - 0.5) * 2 * this.layer.speedMult;
    this.vy = (Math.random() - 0.5) * 2 * this.layer.speedMult;
    this.mass = 1 + Math.random();     // vary mass [1,2]
    this.drag = 0.005;                  // velocity² drag
  }

  update(width, height) {
    // central pull
    const cx = width / 2;
    const cy = height / 2;
    this.vx += (cx - this.x) * config.centralPull;
    this.vy += (cy - this.y) * config.centralPull;

    // turbulence
    const t = performance.now() * 0.0001;
    const angle = noise.perlin2(this.x * 0.005, this.y * 0.005 + t) * Math.PI * 2;
    this.vx += Math.cos(angle) * config.turbulenceStrength;
    this.vy += Math.sin(angle) * config.turbulenceStrength;

    // Brownian jitter
    this.vx += (Math.random() - 0.5) * config.jitterStrength;
    this.vy += (Math.random() - 0.5) * config.jitterStrength;

    // drag (proportional to speed²)
    const speed = Math.hypot(this.vx, this.vy);
    const dragForce = this.drag * speed * speed;
    this.vx -= (this.vx / speed) * dragForce;
    this.vy -= (this.vy / speed) * dragForce;

    // update position & boundary bounce
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > width) this.vx *= -1;
    if (this.y < 0 || this.y > height) this.vy *= -1;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.layer.size, 0, Math.PI * 2);
    ctx.fillStyle = this.layer.color;
    ctx.fill();
  }
}
