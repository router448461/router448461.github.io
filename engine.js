// engine.js
import { CONFIG, THEME, clamp, rBaseScale, computeBias } from './settings.js';
import { initParticles, updateParticles } from './particles.js';

let canvas, ctx;
let W = 0, H = 0, dpr = 1;
let particles = [];
let lastT = 0;
let biasVx = 0, biasVy = 0;

// Links module loaded on demand
let linksMod = null;

function setCanvasSize() {
  dpr = window.devicePixelRatio || 1;
  W = Math.max(1, Math.floor(window.innerWidth));
  H = Math.max(1, Math.floor(window.innerHeight));
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  canvas.width = Math.floor(W * dpr);
  canvas.height = Math.floor(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function bootParticles() {
  const baseScale = rBaseScale(dpr, W, H);
  particles = initParticles(W, H, baseScale, CONFIG);
}

function frame(tNow) {
  const t = tNow || performance.now();
  const dt = lastT ? (t - lastT) / 16.6667 : 1;
  lastT = t;

  ctx.clearRect(0, 0, W, H);

  const time = t / 1000;
  const w1 = CONFIG.pulse1Hz * Math.PI * 2;
  const w2 = CONFIG.pulse2Hz * Math.PI * 2;
  const lineLfo = 0.6 + 0.4 * Math.sin(time * CONFIG.lineLfoHz * Math.PI * 2);

  // Draw particles
  ctx.fillStyle = THEME.particleRGBA(0.9);
  for (const p of particles) {
    const pulse =
      Math.sin(w1 * time + p.phase1) * (1 - CONFIG.pulse2Mix) +
      Math.sin(w2 * time + p.phase2) * CONFIG.pulse2Mix;
    const r = CONFIG.enablePulse ? p.rBase + p.rMod * pulse : p.rBase;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Lines (load module on first use)
  if (CONFIG.enableLines) {
    (linksMod
      ? Promise.resolve(linksMod)
      : import('./links.js').then(m => (linksMod = m))
    ).then(m => {
      const cellSize = CONFIG.linkDistance;
      const grid = m.buildGrid(particles, cellSize);
      m.drawLinks(ctx, particles, grid, THEME, CONFIG.linkDistance, lineLfo);
    });
  }

  // Update physics
  updateParticles(particles, dt, { W, H }, { biasVx, biasVy }, CONFIG);

  requestAnimationFrame(frame);
}

function handleResize() {
  setCanvasSize();
  const bias = computeBias(W, H, CONFIG.maxSpeed);
  biasVx = bias.vx;
  biasVy = bias.vy;
  bootParticles();
  lastT = 0;
}

export function start() {
  canvas = document.getElementById('bgCanvas');
  ctx = canvas.getContext('2d', { alpha: true });

  handleResize();
  window.addEventListener('resize', (() => {
    let timer = null;
    return () => {
      clearTimeout(timer);
      timer = setTimeout(handleResize, 120);
    };
  })(), { passive: true });

  requestAnimationFrame(frame);
}
