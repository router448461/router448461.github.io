import { canvas, ctx, width, height } from './canvas.js';
import { CONFIG } from './config.js';
import { Particle } from './particle.js';

const particles = [];
const mouse = { x: null, y: null };
let lastTime = performance.now();
const centerX = width / 2;
const centerY = height / 2;

canvas.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});
canvas.addEventListener('mouseleave', () => {
  mouse.x = null;
  mouse.y = null;
});

function initParticles() {
  for (let i = 0; i < CONFIG.particleCount; i++) {
    particles.push(new Particle());
  }
}

function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.hypot(dx, dy);

      if (dist < CONFIG.connectionDistance) {
        // Fade lines near center
        const centerDist = (Math.hypot(particles[i].x - centerX, particles[i].y - centerY) +
                            Math.hypot(particles[j].x - centerX, particles[j].y - centerY)) / 2;
        const fadeFactor = 1 - Math.min(centerDist / (width / 2), 1);

        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(255,255,255,${fadeFactor * CONFIG.lineBaseAlpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    if (mouse.x !== null && mouse.y !== null) {
      const dx = particles[i].x - mouse.x;
      const dy = particles[i].y - mouse.y;
      const dist = Math.hypot(dx, dy);

      if (dist < CONFIG.connectionDistance) {
        const alpha = 1 - dist / CONFIG.connectionDistance;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = `rgba(0,255,0,${alpha * CONFIG.lineBaseAlpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }
}

function drawCenterGradient() {
  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, CONFIG.gradientRadius);
  gradient.addColorStop(0, 'rgba(0,0,0,0.8)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function animate(now) {
  const delta = (now - lastTime) / 16.67;
  lastTime = now;

  ctx.clearRect(0, 0, width, height);
  drawCenterGradient();

  for (const p of particles) {
    p.update(delta);
    p.draw();
  }

  drawConnections();
  requestAnimationFrame(animate);
}

if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    initParticles();
    animate(performance.now());
  });
} else {
  requestAnimationFrame(() => {
    initParticles();
    animate(performance.now());
  });
}
