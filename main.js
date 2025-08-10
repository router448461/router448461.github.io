(function () {
  const canvas = document.getElementById('grid');
  const ctx = canvas.getContext('2d');

  const cfg = window.Config;
  const pr = cfg.particles;

  // Seed the RNG so the start is identical every load
  const seeded = window.Particles.makeRNG(cfg.random?.seed || 'OPS-RED-DEFAULT');
  window.Particles.setRNG(seeded);

  const state = {
    w: 0,
    h: 0,
    dpr: Math.max(1, Math.min(window.devicePixelRatio || 1, 2)),
    margin: 0,
    particles: [],
    cfg
  };

  function resize() {
    const { innerWidth, innerHeight } = window;
    state.w = Math.floor(innerWidth * state.dpr);
    state.h = Math.floor(innerHeight * state.dpr);

    canvas.width = state.w;
    canvas.height = state.h;
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';

    // Margin computed from config (0 means true edge bounce)
    const minDimCSS = Math.min(innerWidth, innerHeight);
    const marginCSS = Math.max(0, Math.floor(minDimCSS * pr.interiorMarginPct));
    state.margin = marginCSS * state.dpr;

    // Particle count based on CSS-area (stable across DPR)
    const areaCSS = innerWidth * innerHeight;
    const targetCount = window.Particles.computeCounts(areaCSS, pr.densityPer100k);

    if (state.particles.length > targetCount) {
      state.particles.length = targetCount;
    } else {
      const needed = targetCount - state.particles.length;
      if (needed > 0) {
        const newPts = window.Particles.spawnParticles(
          needed, state.w, state.h, state.margin, pr, state.dpr, cfg.spawn
        );
        state.particles.push(...newPts);
      }
    }

    // Clamp all particles to the current perimeter
    for (const p of state.particles) {
      p.x = Math.max(state.margin, Math.min(p.x, state.w - state.margin));
      p.y = Math.max(state.margin, Math.min(p.y, state.h - state.margin));
    }
  }

  function step() {
    for (const p of state.particles) {
      p.step(state.w, state.h, state.margin, pr);
    }
    window.Renderer.drawFrame(ctx, state);
    requestAnimationFrame(step);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();
  requestAnimationFrame(step);
})();
