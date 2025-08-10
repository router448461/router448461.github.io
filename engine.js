// engine.js
import { CONFIG, clamp, rBaseScale, computeBias, resolveTheme } from './settings.js';
import { initParticles, updateParticles } from './particles.js';

let canvas, ctx;
let W = 0, H = 0, dpr = 1;
let particles = [];
let lastT = 0;
let biasVx = 0, biasVy = 0;
let THEME = resolveTheme();     // resolve from CSS at runtime
let linksMod = null;            // will be set after preload
let linksReady = false;

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

  // Draw links (if module preloaded)
  if (CONFIG.enableLines && linksReady && linksMod) {
    const cellSize = CONFIG.linkDistance;
    const grid = linksMod.buildGrid(particles, cellSize);
    linksMod.drawLinks(ctx, particles, grid, THEME, CONFIG.linkDistance, lineLfo);
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

export async function start() {
  canvas = document.getElementById('bgCanvas');
  if (!canvas) {
    console.error('Canvas #bgCanvas not found');
    return;
  }
  ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) {
    console.error('2D context not available');
    return;
  }

  // Resolve theme now and on color-scheme changes
  THEME = resolveTheme();
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  if (mql && 'addEventListener' in mql) {
    mql.addEventListener('change', () => { THEME = resolveTheme(); });
  }

  handleResize();
  window.addEventListener('resize', (() => {
    let timer = null;
    return () => {
      clearTimeout(timer);
      timer = setTimeout(handleResize, 120);
    };
  })(), { passive: true });

  // Preload links module once (no per-frame import)
  if (CONFIG.enableLines) {
    try {
      linksMod = await import('./links.js');
      linksReady = true;
    } catch (e) {
      linksReady = false;
      console.warn('Links module failed to load. Lines disabled.', e);
    }
  }

  requestAnimationFrame(frame);
}
