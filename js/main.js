import { canvas, ctx, width, height } from './canvas.js';
import { CONFIG } from './config.js';
import { Particle } from './particle.js';

const particles = [];
const mouse = { x: null, y: null };
let lastTime = performance.now();
let lastPulse = performance.now();
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

function drawGrid() {
  ctx.strokeStyle = 'rgba(255,255,255,0.02)';
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += CONFIG.gridSpacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += CONFIG.gridSpacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.hypot(dx, dy);

      if (dist < CONFIG.connectionDistance) {
        const dist1 = Math.hypot(particles[i].x - centerX, particles[i].y - centerY);
        const dist2 = Math.hypot(particles[j].x - centerX, particles[j].y - centerY);
        const bothInSink = dist1 < CONFIG.sinkRadius && dist2 < CONFIG.sinkRadius;

        const alpha = bothInSink
          ? 1 - Math.max(dist1, dist2) / CONFIG.sinkRadius
          : 1;

        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(255,255,255,${alpha * CONFIG.lineBaseAlpha})`;
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

function drawSinkRing() {
  ctx.beginPath();
  ctx.arc(centerX, centerY, CONFIG.sinkRadius, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 4]);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawSensorPulse(now) {
  const elapsed = now - lastPulse;
  if (elapsed > CONFIG.pulseInterval) {
    lastPulse = now;
  }
  const progress = elapsed / CONFIG.pulseInterval;
  const radius = progress * width;

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(255,255,255,${1 - progress})`;
  ctx.lineWidth = 1;
  ctx.stroke();
}

function animate(now) {
  const delta = (now - lastTime) / 16.67;
  lastTime = now;

  ctx.clearRect(0, 0, width, height);
  drawGrid();
  drawCenterGradient();
  drawSinkRing();
  drawSensorPulse(now);

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
