import { ctx, width, height } from './canvas.js';
import { CONFIG } from './config.js';

export class Particle {
  constructor(index) {
    const cols = Math.floor(width / CONFIG.formationSpacing);
    const row = Math.floor(index / cols);
    const col = index % cols;

    this.x = col * CONFIG.formationSpacing + CONFIG.formationSpacing / 2;
    this.y = row * CONFIG.formationSpacing + CONFIG.formationSpacing / 2;

    const isRogue = Math.random() < CONFIG.rogueRatio;
    this.vx = isRogue ? (Math.random() - 0.5) * CONFIG.maxVelocity : 0;
    this.vy = isRogue ? (Math.random() - 0.5) * CONFIG.maxVelocity : 0;
    this.radius = 1 + Math.random() * 2;
    this.isRogue = isRogue;
  }

  update(delta) {
    this.x += this.vx * delta;
    this.y += this.vy * delta;

    if (this.x < 0 || this.x > width)  this.vx *= -1;
    if (this.y < 0 || this.y > height) this.vy *= -1;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.isRogue ? '#f00' : CONFIG.dotColor;
    ctx.fill();
  }
}
