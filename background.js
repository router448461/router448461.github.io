/* global window, document, BG_CONFIG */
(function tacticalBackground() {
  'use strict';

  // ——————————————————————————————————————————————————————————
  // Utilities
  // ——————————————————————————————————————————————————————————
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  // Simple LCG for deterministic discipline (seeded)
  function makeRNG(seed) {
    let s = seed >>> 0;
    return function rand() {
      // Robert Jenkins' 32-bit integer hash -> normalized
      s = (s + 0x7ed55d16 + (s << 12)) >>> 0;
      s = (s ^ 0xc761c23c ^ (s >>> 19)) >>> 0;
      s = (s + 0x165667b1 + (s << 5)) >>> 0;
      s = (s + 0xd3a2646c ^ (s << 9)) >>> 0;
      s = (s + 0xfd7046c5 + (s << 3)) >>> 0;
      s = (s ^ 0xb55a4f09 ^ (s >>> 16)) >>> 0;
      return (s & 0xfffffff) / 0xfffffff;
    };
  }

  function chooseBiased(rng, options) {
    // options: [{value, weight}, ...]
    const total = options.reduce((a, o) => a + o.weight, 0);
    let t = rng() * total;
    for (let i = 0; i < options.length; i++) {
      t -= options[i].weight;
      if (t <= 0) return options[i].value;
    }
    return options[options.length - 1].value;
  }

  // ——————————————————————————————————————————————————————————
  // Canvas setup
  // ——————————————————————————————————————————————————————————
  const cfg = window.BG_CONFIG || {};
  const dprClamp = clamp(window.devicePixelRatio || 1, 1, cfg.maxDevicePixelRatio || 2);

  const canvas = document.getElementById('bg');
  const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });

  // Offscreen cache for grid (draw once per resize)
  const gridCanvas = document.createElement('canvas');
  const gridCtx = gridCanvas.getContext('2d', { alpha: true });

  let width = 0;
  let height = 0;
  let seed = 0xA51CE; // deterministic seed; tweak for different fields
  let rng = makeRNG(seed);

  // ——————————————————————————————————————————————————————————
  // Grid model
  // ——————————————————————————————————————————————————————————
  const grid = {
    minorStep: cfg.grid?.minorStep || 56,
    majorsEvery: cfg.grid?.majorsEvery || 4,
    lineWidthMinor: cfg.grid?.lineWidthMinor || 1,
    lineWidthMajor: cfg.grid?.lineWidthMajor || 1.5
  };

  const palette = cfg.colors || {
    background: '#0a0a0c',
    gridMinor: '#121216',
    gridMajor: '#1a1a1f',
    tracers: '#d21f1f',
    tracerSecondary: '#7a1919'
  };

  // Effective pixel scaling
  function resize() {
    const cssW = canvas.clientWidth || window.innerWidth;
    const cssH = canvas.clientHeight || window.innerHeight;

    width = Math.max(1, Math.floor(cssW * dprClamp));
    height = Math.max(1, Math.floor(cssH * dprClamp));

    canvas.width = width;
    canvas.height = height;

    gridCanvas.width = width;
    gridCanvas.height = height;

    drawGrid();
  }

  // Draws the static grid into gridCanvas
  function drawGrid() {
    const g = gridCtx;
    g.save();
    g.clearRect(0, 0, gridCanvas.width, gridCanvas.height);

    // Background fill (ensures exact tone)
    g.fillStyle = palette.background;
    g.fillRect(0, 0, gridCanvas.width, gridCanvas.height);

    // Compute spacing in device pixels
    const step = grid.minorStep * dprClamp;
    const majorEvery = Math.max(1, grid.majorsEvery);

    // Align to half-pixel for razor-sharp 1px strokes
    const align = (x) => Math.round(x) + 0.5;

    // Vertical lines
    for (let x = 0, i = 0; x <= gridCanvas.width; x += step, i++) {
      const isMajor = (i % majorEvery) === 0;
      g.beginPath();
      g.moveTo(align(x), 0);
      g.lineTo(align(x), gridCanvas.height);
      g.lineWidth = (isMajor ? grid.lineWidthMajor : grid.lineWidthMinor) * dprClamp;
      g.strokeStyle = isMajor ? palette.gridMajor : palette.gridMinor;
      g.stroke();
    }

    // Horizontal lines
    for (let y = 0, j = 0; y <= gridCanvas.height; y += step, j++) {
      const isMajor = (j % majorEvery) === 0;
      g.beginPath();
      g.moveTo(0, align(y));
      g.lineTo(gridCanvas.width, align(y));
      g.lineWidth = (isMajor ? grid.lineWidthMajor : grid.lineWidthMinor) * dprClamp;
      g.strokeStyle = isMajor ? palette.gridMajor : palette.gridMinor;
      g.stroke();
    }

    g.restore();
  }

  // ——————————————————————————————————————————————————————————
  // Tracer agents that move along the grid
  // ——————————————————————————————————————————————————————————
  const tracers = [];
  const tracerCfg = cfg.tracers || {};
  const tracerCount = tracerCfg.count || 26;
  const junctionBias = tracerCfg.junctionDecisionBias || {
    forward: 0.7,
    left: 0.15,
    right: 0.15
  };
  const allowBacktrack = !!tracerCfg.allowBacktrack;
  const speed = tracerCfg.speed || 140; // CSS px/s
  const lineWidth = (tracerCfg.lineWidth || 2) * dprClamp;
  const minTurnInterval = tracerCfg.minTurnInterval || 0.1;

  // Directions are aligned to grid: 0:+x, 1:+y, 2:-x, 3:-y
  const DIRS = [
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 0, y: -1 }
  ];

  function randomInt(n) {
    return Math.floor(rng() * n);
  }

  function snapToGrid(px) {
    const step = grid.minorStep * dprClamp;
    return Math.round(px / step) * step;
  }

  function spawnTracer() {
    // Spawn on a random grid intersection
    const step = grid.minorStep * dprClamp;

    const gx = snapToGrid(rng() * width);
    const gy = snapToGrid(rng() * height);
    const dir = randomInt(4); // 0..3

    return {
      x: gx,
      y: gy,
      dir,
      tSinceTurn: 1, // enable immediate decision
      color: palette.tracers,
      secondary: palette.tracerSecondary
    };
  }

  function resetTracers() {
    tracers.length = 0;
    for (let i = 0; i < tracerCount; i++) {
      tracers.push(spawnTracer());
    }
  }

  function atJunction(px, py) {
    // We consider junction when close to snapped intersection
    const step = grid.minorStep * dprClamp;
    const jx = Math.abs(px - snapToGrid(px));
    const jy = Math.abs(py - snapToGrid(py));
    const tol = 0.5; // device pixel tolerance
    return jx <= tol && jy <= tol;
  }

  function nextDirection(currentDir) {
    // Left/Right relative to currentDir
    const left = (currentDir + 3) & 3;
    const right = (currentDir + 1) & 3;
    const forward = currentDir;
    const back = (currentDir + 2) & 3;

    const options = [
      { value: forward, weight: junctionBias.forward ?? 0.7 },
      { value: left, weight: junctionBias.left ?? 0.15 },
      { value: right, weight: junctionBias.right ?? 0.15 }
    ];

    if (allowBacktrack) {
      // If allowed, add a small probability of reversing
      options.push({ value: back, weight: 0.05 });
    }

    return chooseBiased(rng, options);
  }

  // ——————————————————————————————————————————————————————————
  // Animation loop
  // ——————————————————————————————————————————————————————————
  let lastTime = undefined;
  let running = true;

  function stepFrame(ts) {
    if (!running) return;

    if (lastTime === undefined) {
      lastTime = ts;
      // Draw base grid
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(gridCanvas, 0, 0);
      requestAnimationFrame(stepFrame);
      return;
    }

    const targetFPS = clamp((window.BG_CONFIG && window.BG_CONFIG.targetFPS) || 60, 30, 120);
    const minFrame = 1000 / targetFPS;

    const dtMs = ts - lastTime;
    if (dtMs < minFrame) {
      requestAnimationFrame(stepFrame);
      return;
    }
    lastTime = ts;

    const dt = dtMs / 1000;

    // Redraw: grid first, then dynamic tracers
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(gridCanvas, 0, 0);

    // Draw tracers
    ctx.save();
    ctx.lineCap = 'square';
    ctx.lineJoin = 'miter';
    ctx.miterLimit = 2;

    for (let i = 0; i < tracers.length; i++) {
      const t = tracers[i];

      // Move along current direction
      const v = (speed * dprClamp) * dt;
      const d = DIRS[t.dir];

      let nx = t.x + d.x * v;
      let ny = t.y + d.y * v;

      // Keep within bounds; if out, respawn
      if (nx < 0 || nx > width || ny < 0 || ny > height) {
        tracers[i] = spawnTracer();
        continue;
      }

      // Draw segment from (t.x, t.y) to (nx, ny)
      // Primary stroke
      ctx.beginPath();
      ctx.moveTo(t.x + 0.5, t.y + 0.5);
      ctx.lineTo(nx + 0.5, ny + 0.5);
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = t.color;
      ctx.globalAlpha = 0.9;
      ctx.stroke();

      // Subtle secondary line to add menace without glow
      ctx.beginPath();
      ctx.moveTo(t.x + 0.5, t.y + 0.5);
      ctx.lineTo(nx + 0.5, ny + 0.5);
      ctx.lineWidth = Math.max(1, Math.floor(lineWidth / 2));
      ctx.strokeStyle = t.secondary;
      ctx.globalAlpha = 0.6;
      ctx.stroke();

      t.x = nx;
      t.y = ny;
      t.tSinceTurn += dt;

      // Decide when near a junction and allowed to turn
      if (t.tSinceTurn >= minTurnInterval && atJunction(t.x, t.y)) {
        // Snap to exact junction to keep orthogonality locked
        t.x = snapToGrid(t.x);
        t.y = snapToGrid(t.y);

        const ndir = nextDirection(t.dir);
        t.dir = ndir;
        t.tSinceTurn = 0;
      }
    }

    ctx.restore();

    requestAnimationFrame(stepFrame);
  }

  // ——————————————————————————————————————————————————————————
  // Lifecycle
  // ——————————————————————————————————————————————————————————
  function start() {
    running = true;
    lastTime = undefined;
    requestAnimationFrame(stepFrame);
  }
  function stop() {
    running = false;
  }

  function handleVisibility() {
    if (!cfg.pauseWhenHidden) return;
    if (document.hidden) stop();
    else start();
  }

  function init() {
    resize();
    resetTracers();
    start();
  }

  window.addEventListener('resize', () => {
    resize();
    // Re-snap tracers to the new grid to maintain discipline
    for (let i = 0; i < tracers.length; i++) {
      const t = tracers[i];
      t.x = snapToGrid(clamp(t.x, 0, width));
      t.y = snapToGrid(clamp(t.y, 0, height));
    }
  });

  document.addEventListener('visibilitychange', handleVisibility);

  // Kickoff after DOM is ready (defer ensures this runs after parse)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  // Optional API hooks if you need external control later
  window.TacticalBG = {
    start,
    stop,
    reseed(newSeed) {
      seed = (newSeed >>> 0);
      rng = makeRNG(seed);
      resetTracers();
    },
    setSpeed(pxPerSec) {
      const v = Number(pxPerSec);
      if (!Number.isNaN(v) && v > 0) {
        // eslint-disable-next-line no-param-reassign
        if (window.BG_CONFIG && window.BG_CONFIG.tracers) {
          window.BG_CONFIG.tracers.speed = v;
        }
      }
    }
  };
})();
