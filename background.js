// Canvas visualizer with DPR scaling, spatial partitioning, and “tempo-neutral” pulse layers.
// Accent color auto-syncs to CSS variable --accent (Apple system orange variants).

(() => {
  const canvas = document.getElementById('bgCanvas');
  const ctx = canvas.getContext('2d', { alpha: true });

  // Pull accent from CSS
  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }
  function hexToRgb(hex) {
    const m = hex.replace('#', '').match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (!m) return [255, 159, 10]; // fallback to orange
    return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
  }

  const ACCENT = hexToRgb(cssVar('--accent') || '#ff9f0a');

  const THEME = {
    particleRGBA: (alpha = 0.9) => `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},${alpha})`,
    lineRGB: ACCENT,
    lineMaxAlpha: 0.82,
    lineWidth: 0.9
  };

  const CONFIG = {
    areaPerParticle: 9000,    // lower = denser
    minCount: 90,
    maxCount: 700,
    maxSpeed: 0.35,           // base px/frame at 60fps units, scaled by dt
    linkDistance: 120,        // px
    enableLines: true,
    enablePulse: true,

    // Tempo-neutral motion: two gentle layers near 1 Hz and 0.67 Hz
    pulse1Hz: 1.0,
    pulse2Hz: 0.667,
    pulse2Mix: 0.35,          // how much of layer 2 to mix in
    pulseAmplitude: 0.35,     // px added to base radius at peak

    // Slow line shimmer to avoid static feel
    lineLfoHz: 0.2,
    // Hover boost (UI hover ramps perceived energy without breaking neutrality)
    boostMultiplier: 1.6
  };

  // State
  let W = 0, H = 0, dpr = 1;
  let particles = [];
  let lastT = 0;
  let speedBoost = 0; // 0..1 eased

  // HUD hover influences tempo (optional)
  const hud = document.querySelector('.hud');
  if (hud) {
    let hover = false;
    const setHover = (v) => { hover = v; };
    hud.addEventListener('mouseenter', () => setHover(true), { passive: true });
    hud.addEventListener('mouseleave', () => setHover(false), { passive: true });

    // Ease speedBoost for smoothness
    function animateBoost() {
      const target = hover ? 1 : 0;
      speedBoost += (target - speedBoost) * 0.08; // critically damped-ish
      requestAnimationFrame(animateBoost);
    }
    animateBoost();
  }

  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

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

  function initParticles() {
    const area = W * H;
    const target = clamp(Math.round(area / CONFIG.areaPerParticle), CONFIG.minCount, CONFIG.maxCount);

    particles = Array.from({ length: target }, () => {
      const speed = CONFIG.maxSpeed * (0.5 + Math.random()); // 0.5–1.5x base
      const angle = Math.random() * Math.PI * 2;
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rBase: 1.6 + Math.random() * 1.4,
        rMod: CONFIG.pulseAmplitude * (0.6 + Math.random() * 0.4), // vary per particle
        phase1: Math.random() * Math.PI * 2,
        phase2: Math.random() * Math.PI * 2
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

  function update(dt) {
    // Velocity scaling: base + a touch of boost on hover
    const vScale = 1 + speedBoost * (CONFIG.boostMultiplier - 1);
    for (const p of particles) {
      p.x += p.vx * dt * vScale;
      p.y += p.vy * dt * vScale;

      if (p.x < 0) { p.x = 0; p.vx *= -1; }
      else if (p.x > W) { p.x = W; p.vx *= -1; }

      if (p.y < 0) { p.y = 0; p.vy *= -1; }
      else if (p.y > H) { p.y = H; p.vy *= -1; }
    }
  }

  function draw(tNow) {
    const t = tNow || performance.now();
    const dt = lastT ? (t - lastT) / 16.6667 : 1; // normalize to ~60fps
    lastT = t;

    ctx.clearRect(0, 0, W, H);

    // Pulses: blend two nearby frequencies for tempo neutrality
    const time = t / 1000;
    const boost = 1 + speedBoost * (CONFIG.boostMultiplier - 1);
    const w1 = CONFIG.pulse1Hz * Math.PI * 2 * boost;
    const w2 = CONFIG.pulse2Hz * Math.PI * 2 * boost;
    const lineLfo = 0.6 + 0.4 * Math.sin(time * CONFIG.lineLfoHz * Math.PI * 2);

    // Build neighbor grid once
    const linkDist = CONFIG.linkDistance;
    const cellSize = linkDist;
    let grid = null;
    if (CONFIG.enableLines) {
      grid = buildGrid(cellSize);
      ctx.lineWidth = THEME.lineWidth;
    }

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

    // Draw lines
    if (CONFIG.enableLines && grid) {
      const [rC, gC, bC] = THEME.lineRGB;
      const maxA = THEME.lineMaxAlpha * lineLfo;
      const maxD2 = linkDist * linkDist;

      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        const ix = (a.x / cellSize) | 0;
        const iy = (a.y / cellSize) | 0;

        for (let gx = -1; gx <= 1; gx++) {
          for (let gy = -1; gy <= 1; gy++) {
            const key = (ix + gx) + ',' + (iy + gy);
            const bucket = grid.get(key);
            if (!bucket) continue;

            for (let k = 0; k < bucket.length; k++) {
              const j = bucket[k];
              if (j <= i) continue;

              const b = particles[j];
              const dx = a.x - b.x;
              const dy = a.y - b.y;
              const d2 = dx * dx + dy * dy;
              if (d2 > maxD2) continue;

              const dist = Math.sqrt(d2);
              const alpha = maxA * (1 - dist / linkDist);
              ctx.strokeStyle = `rgba(${rC},${gC},${bC},${alpha})`;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }
      }
    }

    update(dt);
    requestAnimationFrame(draw);
  }

  // Init + resize
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
      setCanvasSize();
      initParticles();
      lastT = 0;
    }, 120);
  }, { passive: true });

  boot();
})();
