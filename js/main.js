import { ctx, width, height } from './canvas.js';
import { CONFIG } from './config.js';
import { Particle } from './particle.js';

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
  ctx.arc(width / 2, height / 2, CONFIG.sinkRadius, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(0, 255, 0, 0.2)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Draw center gradient
  const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, CONFIG.gradientRadius);
  gradient.addColorStop(0, 'rgba(0, 255, 0, 0.2)');
  gradient.addColorStop(1, 'rgba(0, 255, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, CONFIG.gradientRadius, 0, Math.PI * 2);
  ctx.fill();

  // Update and draw particles
  for (let i = 0; i < particles.length; i++) {
    const p1 = particles[i];
    p1.update(delta);
    p1.draw();

    for (let j = i + 1; j < particles.length; j++) {
      const p2 = particles[j];
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      const dist = Math.hypot(dx, dy);

      // Only draw lines within linkDistance and sinkRadius
      const centerDist1 = Math.hypot(p1.x - width / 2, p1.y - height / 2);
      const centerDist2 = Math.hypot(p2.x - width / 2, p2.y - height / 2);
      const withinSink = centerDist1 < CONFIG.sinkRadius && centerDist2 < CONFIG.sinkRadius;

      if (dist < CONFIG.linkDistance && withinSink) {
        const opacity = 1 - dist / CONFIG.linkDistance;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(0, 255, 0, ${opacity})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(animate);
}

animate(lastTime);
