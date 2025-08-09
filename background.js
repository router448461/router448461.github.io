// Tactical particle background with DPI scaling, spatial partitioning, and pulse modulation

(() => {
  const canvas = document.getElementById('bgCanvas');
  const ctx = canvas.getContext('2d', { alpha: true });

  // Theme pack
  const THEMES = {
    ember: {
      particleFill: 'rgba(255,140,30,0.9)',
      lineRGB: [255, 140, 30],
      lineMaxAlpha: 0.85,
      lineWidth: 0.8
    },
    intrusion: {
      particleFill: 'rgba(120,30,255,0.75)',
      lineRGB: [120, 30, 255],
      lineMaxAlpha: 0.7,
      lineWidth: 0.9
    },
    cipher: {
      particleFill: 'rgba(60,200,255,0.7)',
      lineRGB: [60, 200, 255],
      lineMaxAlpha: 0.65,
      lineWidth: 0.8
    }
  };

  const THEME = THEMES.ember;

  const CONFIG = {
    areaPerParticle: 9000,     // lower = denser
    minCount: 90,
    maxCount: 700,
    maxSpeed: 0.35,            // px/sec baseline (scaled by dT)
    linkDistance: 120,         // px
    enableLines: true,
    enablePulse: true,
    pulseAmplitude: 0.35,      // px added to base radius at peak
    pulseSpeed: 1.0,           // Hz-ish feel
    // Diagnostics
    showGrid: false
  };

  // State
  let W = 0, H = 0, dpr = 1;
  let particles = [];
  let lastT = 0;

  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

  function setCanvasSize() {
    dpr = window.devicePixelRatio || 1;
    W = Math.max(1, Math.floor(window.innerWidth));
    H = Math.max(1, Math.floor(window.innerHeight));

    // Size backing store for crisp rendering
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);

    // Draw in CSS pixels
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function initParticles() {
    const area = W * H;
    const target = clamp(Math.round(area / CONFIG.areaPerParticle), CONFIG.minCount, CONFIG.maxCount);

    particles = Array.from({ length: target }, () => {
      const speed = CONFIG.maxSpeed * (0.5 + Math.random()); // 0.5–1.5x
      const angle = Math.random() * Math.PI * 2;
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rBase: 1.6 + Math.random() * 1.4,
        rMod: CONFIG.pulseAmplitude * Math.random(),
        phase: Math.random() * Math.PI * 2
      };
    });
  }

  // Spatial grid for neighbor search
  function buildGrid(cellSize) {
    const grid = new Map();
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const ix = (p.x / cellSize) | 0;
      const iy = (p.y / cellSize) | 0;
      const key = ix + ',' + iy;
      let bucket = grid.get(key);
      if (!bucket) {
        bucket = [];
        grid.set(key, bucket);
      }
      bucket.push(i);
    }
    return grid;
  }

  function drawGridOverlay(cellSize) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += cellSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y <= H; y += cellSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    ctx.restore();
  }

  function update(dt) {
    // Move and bounce
    for (const p of particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.x < 0) { p.x = 0; p.vx *= -1; }
      else if (p.x > W) { p.x = W; p.vx *= -1; }

      if (p.y < 0) { p.y = 0; p.vy *= -1; }
      else if (p.y > H) { p.y = H; p.vy *= -1; }
    }
  }

  function draw(tNow) {
    const t = tNow || performance.now();
    const dt = lastT ? (t - lastT) / 16.6667 : 1; // normalize to ~60fps units
    lastT = t;

    ctx.clearRect(0, 0, W, H);

    // Pre-calc pulse time
    const time = t / 1000;
    const pulseFreq = CONFIG.pulseSpeed * Math.PI * 2;

    // Lines via spatial grid
    const linkDist = CONFIG.linkDistance;
    const cellSize = linkDist;
    let grid = null;
    if (CONFIG.enableLines) {
      grid = buildGrid(cellSize);
      ctx.lineWidth = THEME.lineWidth;
      if (CONFIG.showGrid) drawGridOverlay(cellSize);
    }

    // Draw particles
    ctx.fillStyle = THEME.particleFill;
    for (const p of particles) {
      const r = CONFIG.enablePulse
        ? p.rBase + p.rMod * Math.sin(pulseFreq * time + p.phase)
        : p.rBase;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw connective lines
    if (CONFIG.enableLines && grid) {
      const [r, g, b] = THEME.lineRGB;
      const maxA = THEME.lineMaxAlpha;
      const maxD2 = linkDist * linkDist;

      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        const ix = (a.x / cellSize) | 0;
        const iy = (a.y / cellSize) | 0;

        // check current + 8 neighbors
        for (let gx = -1; gx <= 1; gx++) {
          for (let gy = -1; gy <= 1; gy++) {
            const key = (ix + gx) + ',' + (iy + gy);
            const bucket = grid.get(key);
            if (!bucket) continue;

            for (let k = 0; k < bucket.length; k++) {
              const j = bucket[k];
              if (j <= i) continue; // avoid double-draw/self

              const bP = particles[j];
              const dx = a.x - bP.x;
              const dy = a.y - bP.y;
              const d2 = dx * dx + dy * dy;
              if (d2 > maxD2) continue;

              const dist = Math.sqrt(d2);
              const alpha = maxA * (1 - dist / linkDist);
              ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(bP.x, bP.y);
              ctx.stroke();
            }
          }
        }
      }
    }

    update(dt);
    requestAnimationFrame(draw);
  }

  // Init + resize handling (debounced)
  function boot() {
    setCanvasSize();
    initParticles();
    lastT = 0;
    requestAnimationFrame(draw);
  }

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const prevCount = particles.length;
      setCanvasSize();
      // Recalc target count; preserve feel by reinitializing
      initParticles();
      lastT = 0;
    }, 120);
  }, { passive: true });

  // Start
  boot();
})();
