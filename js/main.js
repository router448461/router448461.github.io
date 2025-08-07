import { ctx, width, height } from './canvas.js';
import { CONFIG } from './config.js';
import { Particle } from './particle.js';

CONFIG.centerX = width / 2;
CONFIG.centerY = height / 2;

const particles = Array.from({ length: CONFIG.particleCount }, () => new Particle());
let lastTime = performance.now();

function animate(time) {
  const delta = (time - lastTime) / 1000;
  lastTime = time;

  // Fade canvas for trail effect
  ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.fillRect(0, 0, width, height);

  // Sink ring
  ctx.beginPath();
  ctx.arc(CONFIG.centerX, CONFIG.centerY, CONFIG.sinkRadius, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(0, 255, 0, 0.2)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Center glow
  const gradient = ctx.createRadialGradient(CONFIG.centerX, CONFIG.centerY, 0, CONFIG.centerX, CONFIG.centerY, CONFIG.gradientRadius);
  gradient.addColorStop(0, 'rgba(0, 255, 0, 0.25)');
  gradient.addColorStop(1, 'rgba(0, 255, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(CONFIG.centerX, CONFIG.centerY, CONFIG.gradientRadius, 0, Math.PI * 2);
  ctx.fill();

  // Update and draw particles
  for (const p of particles) {
    p.update(delta);
    p.drawLine();
    p.drawDot();
  }

  requestAnimationFrame(animate);
}

animate(lastTime);
