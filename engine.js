// engine.js
(function () {
  const BG = (window.BG = window.BG || {});

  let canvas, ctx;
  let W = 0, H = 0, dpr = 1;
  let particles = [];
  let lastT = 0;
  let biasVx = 0, biasVy = 0;
  let fps = 60;

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
    const baseScale = BG.rBaseScale(dpr, W, H);
    particles = BG.initParticles(W, H, baseScale, BG.CONFIG);
  }

  function frame(tNow) {
    const t = tNow || performance.now();
    const dtMs = lastT ? (t - lastT) : 16.6667;
    const dt = dtMs / 16.6667;
    lastT = t;
    fps = 1000 / Math.max(1e-3, dtMs);

    ctx.clearRect(0, 0, W, H);

    const time = t / 1000;
    const w1 = BG.CONFIG.pulse1Hz * Math.PI * 2;
    const w2 = BG.CONFIG.pulse2Hz * Math.PI * 2;
    const lineLfo = 0.6 + 0.4 * Math.sin(time * BG.CONFIG.lineLfoHz * Math.PI * 2);

    // HUD update (before draws)
    if (BG.hud && BG.CONFIG.enableHUD) {
      BG.hud.update(dt, time, BG.theme, BG.CONFIG);
    }

    // HUD: grid (underlay)
    if (BG.hud && BG.CONFIG.enableHUD && BG.CONFIG.hud.grid) {
      // Draw in BG.hud.draw to control ordering; we’ll call once later
      // but grid should be beneath—so we draw all via one call below.
    }

    // Particles
    ctx.fillStyle = BG.theme.particleRGBA(0.9);
    for (const p of particles) {
      const pulse =
        Math.sin(w1 * time + p.phase1) * (1 - BG.CONFIG.pulse2Mix) +
        Math.sin(w2 * time + p.phase2) * BG.CONFIG.pulse2Mix;
      const r = BG.CONFIG.enablePulse ? p.rBase + p.rMod * pulse : p.rBase;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Lines
    if (BG.CONFIG.enableLines) {
      const cellSize = BG.CONFIG.linkDistance;
      const grid = BG.buildGrid(particles, cellSize);
      BG.drawLinks(ctx, particles, grid, BG.theme, BG.CONFIG.linkDistance, lineLfo);
    }

    // Core/pulses/ambient/debug + grid all drawn in one controlled pass
    if (BG.hud && BG.CONFIG.enableHUD) {
      BG.hud.draw(ctx, BG.theme, BG.CONFIG, W, H, time, fps, particles.length);
    }

    // Physics
    BG.updateParticles(particles, dt, { W, H }, { biasVx, biasVy }, BG.CONFIG);

    requestAnimationFrame(frame);
  }

  function handleResize() {
    setCanvasSize();
    const bias = BG.computeBias(W, H, BG.CONFIG.maxSpeed);
    biasVx = bias.vx;
    biasVy = bias.vy;
    bootParticles();
    if (BG.hud && BG.hud.init) BG.hud.init(W, H);
    lastT = 0;
  }

  BG.start = function () {
    canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Ensure theme reflects current CSS at start
    BG.refreshTheme();

    handleResize();
    window.addEventListener(
      'resize',
      (() => {
        let timer = null;
        return () => {
          clearTimeout(timer);
          timer = setTimeout(handleResize, 120);
        };
      })(),
      { passive: true }
    );

    // Mouse tracking for HUD (window-level, canvas is pointer-events: none)
    window.addEventListener('pointermove', (e) => {
      const x = BG.clamp(e.clientX / Math.max(1, window.innerWidth), 0, 1);
      const y = BG.clamp(e.clientY / Math.max(1, window.innerHeight), 0, 1);
      if (BG.hud && BG.hud.mouseMove) BG.hud.mouseMove(x, y);
    }, { passive: true });

    // Update theme if system theme changes
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    if (mql && 'addEventListener' in mql) {
      mql.addEventListener('change', () => BG.refreshTheme());
    }

    requestAnimationFrame(frame);
  };
})();
