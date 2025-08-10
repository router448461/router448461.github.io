// particles.js
import { clamp } from './settings.js';

export function initParticles(W, H, rScale, CONFIG) {
  const area = W * H;
  const target = clamp(Math.round(area / CONFIG.areaPerParticle), CONFIG.minCount, CONFIG.maxCount);
  const particles = Array.from({ length: target }, () => {
    const speed = CONFIG.maxSpeed * (0.5 + Math.random());
    const angle = Math.random() * Math.PI * 2;
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rBase: (1.6 + Math.random() * 1.4) * rScale,
      rMod: CONFIG.pulseAmplitude * (0.6 + Math.random() * 0.4),
      phase1: Math.random() * Math.PI * 2,
      phase2: Math.random() * Math.PI * 2
    };
  });
  return particles;
}

export function updateParticles(particles, dt, bounds, bias, CONFIG) {
  const { W, H } = bounds;
  const { biasVx, biasVy } = bias;

  for (const p of particles) {
    p.x += (p.vx + biasVx) * dt;
    p.y += (p.vy + biasVy) * dt;

    if (p.x < 0) { p.x = 0; p.vx *= -1; }
    else if (p.x > W) { p.x = W; p.vx *= -1; }

    if (p.y < 0) { p.y = 0; p.vy *= -1; }
    else if (p.y > H) { p.y = H; p.vy *= -1; }
  }
}
