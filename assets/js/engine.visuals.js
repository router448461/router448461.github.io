(() => {
  const engine = window.engine;

  function rand(min, max) { return Math.random() * (max - min) + min; }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  class Particle {
    constructor(w, h, cfg) {
      // Position
      this.x = Math.random() * w;
      this.y = Math.random() * h;

      // Depth (z) controls size, speed, link visibility
      this.z = rand(0.6, 1.6); // 0.6 (far) .. 1.6 (near)
      const speedBase = rand(cfg.speed[0], cfg.speed[1]);
      this.vx = speedBase * (Math.random() < 0.5 ? -1 : 1) * (0.6 + (this.z - 0.6)); // faster when near
      this.vy = speedBase * (Math.random() < 0.5 ? -1 : 1) * (0.6 + (this.z - 0.6));
      this.size = rand(cfg.particleSize[0], cfg.particleSize[1]) * this.z;

      // Twinkle phase & color shift
      this.twinklePhase = Math.random() * Math.PI * 2;
      this.colorShift = rand(-10, 10); // small blue/white variation
      this.seed = Math.random() * 1000;
    }

    step(dt, bounds, mouse, cfg, now) {
      const t = dt / 16.6667; // normalize to ~60fps units

      // gentle wander, scaled by depth (farther stars wander less)
      const wander = 0.012 * (1 / this.z);
      this.vx += rand(-wander, wander);
      this.vy += rand(-wander, wander);

      // subtle per-particle oscillator (gives "breathing" movement)
      const sway = Math.sin((now * 0.001) + this.seed) * 0.02;
      this.vx += sway * (1 / this.z);
      this.vy += sway * (1 / this.z);

      // mouse repel/attract: repel by default, attract when mouse.down
      if (mouse.x != null && mouse.y != null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const d2 = dx*dx + dy*dy;
        const r = cfg.repelRadius * (1 + (1.2 - this.z)); // nearer scaled radius
        if (d2 < r*r) {
          const d = Math.sqrt(d2) || 0.0001;
          const f = clamp(1 - d / r, 0, 1);
          // if pointer is down, slightly attract (pull) otherwise repel
          const mode = mouse.down ? -1 : 1;
          const strength = (0.25 + 0.75 * f) * (mode) * (0.6 + (1.6 - this.z) * 0.2);
          this.vx += (dx / d) * strength;
          this.vy += (dy / d) * strength;
        }
      }

      this.x += this.vx * t;
      this.y += this.vy * t;

      // Soft bounds bounce
      if (this.x < 0) { this.x = 0; this.vx *= -0.8; }
      if (this.x > bounds.w) { this.x = bounds.w; this.vx *= -0.8; }
      if (this.y < 0) { this.y = 0; this.vy *= -0.8; }
      if (this.y > bounds.h) { this.y = bounds.h; this.vy *= -0.8; }

      // Damp velocities a bit more for farther stars
      const damp = 0.992 + (0.002 * (1.6 - this.z));
      this.vx *= damp;
      this.vy *= damp;
    }

    // draw with glow + core
    draw(ctx, baseColor, now) {
      // twinkle factor: slow sinusoidal brightness change
      const tw = 1 + 0.28 * Math.sin((now * 0.001) + this.twinklePhase);

      // color with small shift, baseColor expected as hex like "#84c5ff"
      // Convert baseColor to rgba components quickly (assume it's the default blue-ish)
      // We'll simply use rgba with alpha modulation
      const alpha = 0.65 * (this.z / 1.2) * tw;

      // Glow pass (soft, additive)
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = `rgba(132,197,255,${0.18 * (this.z) * tw})`;
      ctx.shadowColor = `rgba(132,197,255,${0.22 * (this.z) * tw})`;
      ctx.shadowBlur = Math.max(6, this.size * 6 * this.z);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Core pass
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.beginPath();
      ctx.fillStyle = `rgba(212,238,255,${alpha})`; // near-white core
      ctx.arc(this.x, this.y, this.size * (0.8 + 0.2 * this.z) * tw, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  const mod = (engine.modules.visuals = {
    particles: [],
    bounds: { w: 0, h: 0 },
    // spatial hash
    grid: null,
    cellSize: 120,
    targetCount: 120,

    init() {
      this.onResize(engine.modules.base.width, engine.modules.base.height, engine.modules.base.dpr);
      this.spawn();
    },

    onResize(w, h, dpr) {
      this.bounds.w = w;
      this.bounds.h = h;
      // choose population based on area
      const area = w * h;
      const target = Math.min(engine.config.maxParticles, Math.ceil(area * engine.config.baseParticleDensity));
      this.targetCount = target || 60;
      // adapt cell size to link distance (grid for neighbor lookups)
      this.cellSize = Math.max(64, Math.floor(engine.config.linkDistance * 0.9));
      this.grid = null; // will be rebuilt in tick
    },

    spawn() {
      const cfg = engine.config;
      const need = (this.targetCount ?? 120);
      const current = this.particles.length;
      for (let i = current; i < need; i++) {
        this.particles.push(new Particle(this.bounds.w, this.bounds.h, cfg));
      }
      if (this.particles.length > need) this.particles.length = need;
    },

    // build a simple spatial hash grid each frame (cheap for moderate n)
    buildGrid() {
      const grid = new Map();
      const cs = this.cellSize;
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        const ix = Math.floor(p.x / cs);
        const iy = Math.floor(p.y / cs);
        const key = ix + ',' + iy;
        let bucket = grid.get(key);
        if (!bucket) { bucket = []; grid.set(key, bucket); }
        bucket.push(p);
      }
      this.grid = grid;
    },

    neighborsFor(p) {
      const cs = this.cellSize;
      const ix = Math.floor(p.x / cs);
      const iy = Math.floor(p.y / cs);
      const list = [];
      for (let ox = -1; ox <= 1; ox++) {
        for (let oy = -1; oy <= 1; oy++) {
          const key = (ix + ox) + ',' + (iy + oy);
          const bucket = this.grid.get(key);
          if (bucket) list.push(...bucket);
        }
      }
      return list;
    },

    tick(dt) {
      // Ensure population
      if ((this.particles.length | 0) !== (this.targetCount | 0)) this.spawn();

      const ctx = engine.state.ctx;
      const cfg = engine.config;
      const color = cfg.color;
      const linkDist = cfg.linkDistance;
      const linkDist2 = linkDist * linkDist;
      const now = performance.now();

      // Adaptive skipping of heavy passes when FPS low
      const fps = engine.state.fps || 60;
      const linkEnabled = fps > 30;

      // Update positions
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        p.step(dt, this.bounds, engine.state.mouse, cfg, now);
      }

      // Draw particles with glow/core
      for (let i = 0; i < this.particles.length; i++) {
        this.particles[i].draw(ctx, color, now);
      }

      // Build spatial grid for neighbor queries (only when links are enabled)
      if (linkEnabled) {
        this.buildGrid();

        ctx.lineWidth = 1;
        // Link drawing: iterate particles and only compare to nearby bucket entries
        for (let i = 0; i < this.particles.length; i++) {
          const a = this.particles[i];
          const neighbors = this.neighborsFor(a);
          for (let j = 0; j < neighbors.length; j++) {
            const b = neighbors[j];
            if (a === b) continue;
            // avoid double-draw by simple index/proxy check (we don't have index in neighbors)
            if (b.x < a.x - linkDist || b.y < a.y - linkDist) {
              // cheap skip: heuristic to roughly avoid duplicate half pairs
            }
            const dx = a.x - b.x, dy = a.y - b.y;
            const d2 = dx*dx + dy*dy;
            if (d2 <= linkDist2) {
              const d = Math.sqrt(d2);
              // alpha and stroke scale by distance and average depth (nearer => stronger)
              const depthFactor = (a.z + b.z) * 0.5;
              const alpha = Math.max(0, cfg.linkOpacity * (1 - d / linkDist) * depthFactor);
              if (alpha > 0.02) {
                ctx.strokeStyle = `rgba(132,197,255,${alpha})`;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
              }
            }
          }
        }
      }

      // occasional tiny "spark" when mouse clicks (visual feedback)
      if (engine.state.mouse.down) {
        // draw a faint pulse at pointer
        const m = engine.state.mouse;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.beginPath();
        ctx.fillStyle = 'rgba(132,197,255,0.06)';
        ctx.arc(m.x, m.y, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  });

  engine.markReady("visuals");
})();
