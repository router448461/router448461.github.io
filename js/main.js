import { ctx, width, height } from './canvas.js';
import { CONFIG } from './config.js';
import { Particle } from './particle.js';

const centerX = width / 2;
const centerY = height / 2;
const particles = Array.from({ length: CONFIG.particleCount }, () => new Particle());

let lastTime = performance.now();

function animate(time) {
  const delta = (time - lastTime) / 1000;
  lastTime = time;

  // Semi-transparent clear for motion trails
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, width, height);

  // Draw sink ring
  ctx.beginPath();
  ctx.arc(centerX, centerY, CONFIG.sinkRadius, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(0, 255, 0, 0.2)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Draw center gradient
  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, CONFIG.gradientRadius);
  gradient.addColorStop(0, 'rgba(0, 255, 0, 0.2)');
  gradient.addColorStop(1, 'rgba(0, 255, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, CONFIG.gradientRadius, 0, Math.PI * 2);
  ctx.fill();

  // Update particles
  for (let i = 0; i < particles.length; i++) {
    particles[i].update(delta);
  }

  // Draw radial lines from center to particles
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    const dx = p.x - centerX;
    const dy = p.y - centerY;
    const dist = Math.hypot(dx, dy);

    if (dist < CONFIG.tetherDistance) {
      const opacity = 1 - dist / CONFIG.tetherDistance;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = `rgba(0, 255, 0, ${opacity})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }

  // Draw particles last (dots at ends of lines)
  for (let i = 0; i < particles.length; i++) {
    particles[i].draw();
  }

  requestAnimationFrame(animate);
}

animate(lastTime);
