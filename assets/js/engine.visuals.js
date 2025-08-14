(() => {
  const engine = window.engine;
  const { util } = engine;

  // Lightweight Perlin-style noise (2D)
  const Noise = (() => {
    const p = new Uint8Array(512);
    const base = new Uint8Array(256);
    for (let i = 0; i < 256; i++) base[i] = i;
    for (let i = 255; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [base[i], base[j]] = [base[j], base[i]];
    }
    for (let i = 0; i < 512; i++) p[i] = base[i & 255];

    function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
    function lerp(a, b, t) { return a + (b - a) * t; }
    function grad(h, x, y) {
      const u = (h & 2) ? x : -x;
      const v = (h & 1) ? y : -y;
      return u + v;
    }

    function noise2(x, y) {
      const X = Math.floor(x) & 255;
      const Y = Math.floor(y) & 255;
      const xf = x - Math.floor(x);
      const yf = y - Math.floor(y);
      const tl = p[X + p[Y]];
      const tr = p[X + 1 + p[Y]];
      const bl = p[X + p[Y + 1]];
      const br = p[X + 1 + p[Y + 1]];
      const u = fade(xf);
      const v = fade(yf);
      const x1 = lerp(grad(tl, xf, yf), grad(tr, xf - 1, yf), u);
      const x2 = lerp(grad(bl, xf, yf - 1), grad(br, xf - 1, yf - 1), u);
      return (lerp(x1, x2, v) + 1) * 0.5; // 0..1
    }

    return { noise2 };
  })();

  function rand(min, max) { return Math.random() * (max - min) + min; }

  class Particle {
    constructor(w, h, cfg, idx) {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      const s = rand(cfg.speed[0], cfg.speed[1]) * (Math.random() < 0.5 ? -1 : 1);
      const t = rand(cfg.speed[0], cfg.speed[1]) * (Math.random() < 0.5 ? -1 : 1);
      this.vx = s;
      this.vy = t;
      // Base (preferred) vector for inertia ripple
      this.bvx = this.vx;
      this.bvy = this.vy;
      this.size = rand(cfg.particleSize[0], cfg.particleSize[1]);
      this.idx = idx || (Math.random() * 10000) | 0;
    }

    step(dt, bounds, mouse, cfg, time, noiseScale, settleFactor) {
      const t = dt / 16.6667; // normalize to ~60fps units

      // Smooth ambient drift via 2D noise field
      const ns = noiseScale;
      const nx = Noise.noise2((this.x * ns) + time * 0.0008, (this.y * ns) + 13.37);
      const ny = Noise.noise2((this.y * ns) + time * 0.0008, (this.x * ns) + 42.42);
      const drift = 0.06; // how strongly noise steers base vector
      this.bvx = util.lerp(this.bvx, (nx - 0.5) * 2 * cfg.speed[1], drift * t);
      this.bvy = util.lerp(this.bvy, (ny - 0.5) * 2 * cfg.speed[1], drift * t);

      // Gently move current velocity toward base velocity (inertia ripple)
      this.vx = util.lerp(this.vx, this.bvx, settleFactor * t);
      this.vy = util.lerp(this.vy, this.bvy, settleFactor * t);

      // Mouse repel with eased falloff
      if (mouse.x != null && mouse.y != null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const d2 = dx*dx + dy*dy;
        const r = cfg.repelRadius;
        if (d2 < r*r) {
          const d = Math.sqrt(d2) || 0.0001;
          const normX = dx / d, normY = dy / d;
          const f = Math.max(0, 1 - (d / r)); // linear falloff 1..0
          const eased = f * f; // quadratic ease-out for softness
          const push = (0.5 + 0.5 * eased) * cfg.repelStrength; // softened
          this.vx += (normX * push);
          this.vy += (normY * push);
        }
      }

      // Integrate
      this.x += this.vx * t * 1.0;
      this.y += this.vy * t * 1.0;

      // Soft bounds bounce
      if (this.x < 0) { this.x = 0; this.vx *= -0.9; }
      if (this.x > bounds.w) { this.x = bounds.w; this.vx *= -0.9; }
      if (this.y < 0) { this.y = 0; this.vy *= -0.9; }
      if (this.y > bounds.h) { this.y = bounds.h; this.vy *= -0.9; }

      // Damp
      this.vx *= 0.995;
      this.vy *= 0.995;
    }

    draw(ctx, colorRGB, shadowBlur) {
      const { r, g, b } = colorRGB;
      const grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 1.6);
      grd.addColorStop(0.0, `rgba(${r},${g},${b},0.95)`);
      grd.addColorStop(0.5, `rgba(${r},${g},${b},0.35)`);
      grd.addColorStop(1.0, `rgba(${r},${g},${b},0.0)`);
      ctx.fillStyle = grd;

      // Soft glow
      const prevBlur = ctx.shadowBlur;
      const prevColor = ctx.shadowColor;
      ctx.shadowBlur = shadowBlur;
      ctx.shadowColor = `rgba(${r},${g},${b},0.6)`;

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();

      // restore
      ctx.shadowBlur = prevBlur;
      ctx.shadowColor = prevColor;
    }
  }

  const mod = (engine.modules.visuals = {
    particles: [],
    pool: [],
    bounds: { w: 0, h: 0 },
    targetCount: 0,
    currentLinkDistance: 0,

    init() {
      this.onResize(engine.modules.base.width, engine.modules.base.height, engine.modules.base.dpr);
      this.spawnToTarget(true);
      this.currentLinkDistance = engine.config.linkDistance;
    },

    onResize(w, h) {
      this.bounds.w = w;
      this.bounds.h = h;
      const area = w * h;
      const target = Math.min(engine.config.maxParticles, Math.ceil(area * engine.config.baseParticleDensity));
      this.targetCount = target;
    },

    spawnOne(i) {
      const cfg = engine.config;
      const p = this.pool.pop() || new Particle(this.bounds.w, this.bounds.h, cfg, i);
      // reset basic props if reused
      if (p) {
        p.x = Math.random() * this.bounds.w;
        p.y = Math.random() * this.bounds.h;
        p.vx = rand(cfg.speed[0], cfg.speed[1]) * (Math.random() < 0.5 ? -1 : 1);
        p.vy = rand(cfg.speed[0], cfg.speed[1]) * (Math.random() < 0.5 ? -1 : 1);
        p.bvx = p.vx; p.bvy = p.vy;
        p.size = rand(cfg.particleSize[0], cfg.particleSize[1]);
      }
      this.particles.push(p);
    },

    spawnToTarget(initial = false) {
      const need = this.targetCount | 0;
      const current = this.particles.length;
      if (current < need) {
        for (let i = current; i < need; i++) this.spawnOne(i);
      } else if (current > need) {
        // move extras to pool for reuse
        for (let i = current; i > need; i--) {
          const p = this.particles.pop();
          if (p) this.pool.push(p);
        }
      }
    },

    adaptWithFps(dt) {
      const fps = engine.state.fps | 0;
      const cfg = engine.config;
      const a = cfg.fpsAdaptive;
      const stepP = (a.particleStep * dt) / 1000;
      const stepL = (a.linkStep * dt) / 1000;

      if (fps && fps < a.low) {
        // nudge targets down
        const minP = a.minParticles | 0;
        this.targetCount = Math.max(minP, this.targetCount - stepP);
        this.currentLinkDistance = Math.max(a.minLinkDistance, this.currentLinkDistance - stepL);
      } else if (fps && fps > a.high) {
        // recover toward config targets
        const area = this.bounds.w * this.bounds.h;
        const target = Math.min(cfg.maxParticles, Math.ceil(area * cfg.baseParticleDensity));
        this.targetCount = Math.min(target, this.targetCount + stepP);
        this.currentLinkDistance = Math.min(cfg.linkDistance, this.currentLinkDistance + stepL);
      }

      // Reconcile particle count gradually
      const diff = (this.targetCount | 0) - this.particles.length;
      if (diff > 0) {
        for (let i = 0; i < diff; i++) this.spawnOne();
      } else if (diff < 0) {
        for (let i = 0; i < -diff; i++) {
          const p = this.particles.pop();
          if (p) this.pool.push(p);
        }
      }
    },

    tick(dt) {
      if (!this._inited) { this.init(); this._inited = true; }

      // Adaptive performance
      this.adaptWithFps(dt);

      const ctx = engine.state.ctx;
      const cfg = engine.config;
      const colorRGB = window.engine._colorRGB || (window.engine._colorRGB = engine.util.hexToRgb(cfg.color));
      const linkRGB = window.engine._linkRGB || (window.engine._linkRGB = engine.util.hexToRgb(cfg.linkColor));
      const linkDist = this.currentLinkDistance;
      const linkDist2 = linkDist * linkDist;

      // Update particles
      const noiseScale = 0.002; // spatial frequency for noise
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        p.step(dt, this.bounds, engine.state.mouse, cfg, engine.state.time, noiseScale, cfg.settleFactor);
      }

      // Draw particles
      for (let i = 0; i < this.particles.length; i++) {
        this.particles[i].draw(ctx, colorRGB, cfg.glow.particleShadowBlur);
      }

      // Draw links with slight glow (naive O(n^2))
      const prevWidth = ctx.lineWidth;
      const prevBlur = ctx.shadowBlur;
      const prevColor = ctx.shadowColor;
      ctx.lineWidth = 1;
      for (let i = 0; i < this.particles.length; i++) {
        const a = this.particles[i];
        for (let j = i + 1; j < this.particles.length; j++) {
          const b = this.particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx*dx + dy*dy;
          if (d2 <= linkDist2) {
            const d = Math.sqrt(d2);
            const alpha = Math.max(0, cfg.linkOpacity * (1 - d / linkDist));
            if (alpha > 0.02) {
              const near = d < linkDist * 0.45;
              ctx.shadowBlur = near ? cfg.glow.linkShadowBlur : 0;
              ctx.shadowColor = `rgba(${linkRGB.r},${linkRGB.g},${linkRGB.b},${alpha * cfg.glow.strengthNear})`;
              ctx.strokeStyle = `rgba(${linkRGB.r},${linkRGB.g},${linkRGB.b},${alpha})`;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }
      }
      // restore
      ctx.lineWidth = prevWidth;
      ctx.shadowBlur = prevBlur;
      ctx.shadowColor = prevColor;
    }
  });

  engine.markReady("visuals");
})();
