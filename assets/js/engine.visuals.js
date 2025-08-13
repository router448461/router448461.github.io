(() => {
  const engine = window.engine;

  // Utilities
  function rand(min, max) { return Math.random() * (max - min) + min; }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function hexToRgb(hex) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return m ? { r: parseInt(m[1],16), g: parseInt(m[2],16), b: parseInt(m[3],16) } : { r: 255, g: 107, b: 107 };
  }

  function mixRGB(a, b, t) {
    return {
      r: Math.round(lerp(a.r, b.r, t)),
      g: Math.round(lerp(a.g, b.g, t)),
      b: Math.round(lerp(a.b, b.b, t))
    };
  }

  // Lightweight value-noise flow field (tileable enough, animated in time)
  const Noise = (() => {
    function hash(x, y, z) {
      // Integer hash -> [0,1)
      let n = (x * 73856093) ^ (y * 19349663) ^ (z * 83492791);
      n = (n << 13) ^ n;
      return (1.0 - ((n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824.0) * 0.5 + 0.5;
    }
    function smoothstep(t) { return t * t * (3 - 2 * t); }
    function valueNoise(x, y, z) {
      const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
      const xf = x - xi, yf = y - yi, zf = z - zi;
      const u = smoothstep(xf), v = smoothstep(yf), w = smoothstep(zf);
      function h(ix, iy, iz) { return hash(ix, iy, iz); }
      const c000 = h(xi, yi, zi);
      const c100 = h(xi+1, yi, zi);
      const c010 = h(xi, yi+1, zi);
      const c110 = h(xi+1, yi+1, zi);
      const c001 = h(xi, yi, zi+1);
      const c101 = h(xi+1, yi, zi+1);
      const c011 = h(xi, yi+1, zi+1);
      const c111 = h(xi+1, yi+1, zi+1);
      const x00 = lerp(c000, c100, u);
      const x10 = lerp(c010, c110, u);
      const x01 = lerp(c001, c101, u);
      const x11 = lerp(c011, c111, u);
      const y0 = lerp(x00, x10, v);
      const y1 = lerp(x01, x11, v);
      return lerp(y0, y1, w);
    }
    // Returns an angle (in radians) derived from 3D noise
    function angle(x, y, t, scale) {
      const n = valueNoise(x * scale, y * scale, t);
      return n * Math.PI * 2;
    }
    return { angle };
  })();

  class Particle {
    constructor(w, h, cfg, palette) {
      this.x = Math.random() * w;
      this.y = Math.random() * h;

      // Depth defines parallax, size, opacity
      this.z = rand(cfg.depth.min, cfg.depth.max);
      const sp = rand(cfg.speed[0], cfg.speed[1]);
      const dir = Math.random() * Math.PI * 2;
      this.vx = Math.cos(dir) * sp * (0.4 + 0.6 / this.z);
      this.vy = Math.sin(dir) * sp * (0.4 + 0.6 / this.z);

      this.baseSize = lerp(cfg.particleSize[0], cfg.particleSize[1], Math.random()) * (0.6 + 0.4 / this.z);
      this.phase = Math.random() * Math.PI * 2; // twinkle
      this.tintT = Math.random() * 0.8 + 0.2;   // mix ratio toward secondary
      this.color = mixRGB(palette.primary, palette.secondary, this.tintT);
    }

    step(dt, bounds, cfg, timeScalar) {
      const t = dt / 16.6667; // normalize to ~60fps units

      // Flow field drift (adds organic motion)
      const ang = Noise.angle(this.x, this.y, timeScalar.t, cfg.noise.scale);
      const flow = cfg.noise.strength * (0.5 + 0.5 / this.z);
      this.vx += Math.cos(ang) * flow;
      this.vy += Math.sin(ang) * flow;

      // Mild wander/damping
      this.vx += rand(-0.015, 0.015);
      this.vy += rand(-0.015, 0.015);
      this.vx *= 0.994;
      this.vy *= 0.994;

      // Integrate
      this.x += this.vx * t;
      this.y += this.vy * t;

      // Soft bounds with energy loss
      if (this.x < 0) { this.x = 0; this.vx *= -0.92; }
      if (this.x > bounds.w) { this.x = bounds.w; this.vx *= -0.92; }
      if (this.y < 0) { this.y = 0; this.vy *= -0.92; }
      if (this.y > bounds.h) { this.y = bounds.h; this.vy *= -0.92; }
    }

    sizeAt(timeScalar) {
      // Subtle twinkle by depth
      const tw = 0.18 + 0.12 / this.z;
      return this.baseSize * (1.0 + tw * Math.sin(this.phase + timeScalar.t * 1.8));
    }

    alpha() {
      // Depth-aware alpha: farther is dimmer
      return clamp(1.35 - this.z * 0.6, 0.25, 0.95);
    }

    draw(ctx) {
      const { r, g, b } = this.color;
      ctx.beginPath();
      ctx.fillStyle = `rgba(${r},${g},${b},${this.alpha()})`;
      ctx.arc(this.x, this.y, this.drawSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const mod = (engine.modules.visuals = {
    particles: [],
    bounds: { w: 0, h: 0 },
    targetCount: 0,
    colorPrimary: null,
    colorSecondary: null,
    now: 0,

    init() {
      const cfg = engine.config;
      this.colorPrimary = hexToRgb(cfg.color);
      this.colorSecondary = hexToRgb(cfg.colorSecondary || cfg.color);
      this.onResize(engine.modules.base.width, engine.modules.base.height, engine.modules.base.dpr);
      this.spawn();
    },

    onResize(w, h) {
      this.bounds.w = w;
      this.bounds.h = h;
      const area = w * h;
      const target = Math.min(engine.config.maxParticles, Math.ceil(area * engine.config.baseParticleDensity));
      this.targetCount = target;
    },

    spawn() {
      const cfg = engine.config;
      const need = (this.targetCount ?? 140);
      const current = this.particles.length;
      for (let i = current; i < need; i++) {
        this.particles.push(new Particle(this.bounds.w, this.bounds.h, cfg, {
          primary: this.colorPrimary,
          secondary: this.colorSecondary
        }));
      }
      if (this.particles.length > need) this.particles.length = need;
    },

    // Spatial grid for neighbor queries
    _buildGrid(cell) {
      const grid = new Map();
      const ps = this.particles;
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        const cx = (p.x / cell) | 0;
        const cy = (p.y / cell) | 0;
        const key = cx + "," + cy;
        let arr = grid.get(key);
        if (!arr) { arr = []; grid.set(key, arr); }
        arr.push(i);
      }
      this.grid = grid;
    },

    _neighbors(p, cell) {
      const cx = (p.x / cell) | 0, cy = (p.y / cell) | 0;
      const res = [];
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const arr = this.grid.get((cx+dx)+","+(cy+dy));
          if (arr) res.push(arr);
        }
      }
      return res;
    },

    tick(dt) {
      // Ensure population
      if ((this.particles.length | 0) !== (this.targetCount | 0)) this.spawn();

      const ctx = engine.state.ctx;
      const cfg = engine.config;
      const ps = this.particles;
      const linkDist = cfg.linkDistance;
      const linkDist2 = linkDist * linkDist;
      const zTol = cfg.depth.linkZTolerance;

      // Time scalar for noise animation
      this.now += dt;
      const timeScalar = { t: this.now * cfg.noise.speed };

      // Update particles
      for (let i = 0; i < ps.length; i++) {
        ps[i].step(dt, this.bounds, cfg, timeScalar);
        ps[i].drawSize = ps[i].sizeAt(timeScalar);
      }

      // Draw points with additive glow
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.shadowColor = `rgba(${this.colorPrimary.r},${this.colorPrimary.g},${this.colorPrimary.b},0.6)`;
      ctx.shadowBlur = engine.config.glow.blur;

      for (let i = 0; i < ps.length; i++) {
        ps[i].draw(ctx);
      }

      ctx.restore();

      // Build spatial grid for links
      this._buildGrid(linkDist);

      // Draw links (depth-aware, color-unified)
      ctx.lineWidth = 1;
      ctx.globalCompositeOperation = "source-over";

      for (let i = 0; i < ps.length; i++) {
        const a = ps[i];
        const buckets = this._neighbors(a, linkDist);
        for (const bucket of buckets) {
          for (let k = 0; k < bucket.length; k++) {
            const j = bucket[k];
            if (j <= i) continue; // avoid double-work/self
            const b = ps[j];

            const dz = Math.abs(a.z - b.z);
            if (dz > zTol) continue;

            const dx = a.x - b.x, dy = a.y - b.y;
            const d2 = dx*dx + dy*dy;
            if (d2 > linkDist2) continue;

            const d = Math.sqrt(d2);
            const baseAlpha = cfg.linkOpacity * (1 - d / linkDist);
            // Combine with depth alpha (dim distant layers)
            const depthAlpha = Math.min(a.alpha(), b.alpha());
            const alpha = baseAlpha * depthAlpha;
            if (alpha <= 0.01) continue;

            // Color: blend between primary/secondary using endpoints average tint
            const mixT = (a.tintT + b.tintT) * 0.5 * 0.85;
            const c = mixRGB(this.colorPrimary, this.colorSecondary, mixT);
            ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},${alpha})`;

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Adaptive load-shedding based on measured FPS
      const fps = engine.state.fps || 60;
      if (fps < 50 && this.targetCount > 70) {
        this.targetCount = Math.max(70, Math.round(this.targetCount * 0.95));
      } else if (fps > 58 && this.targetCount < engine.config.maxParticles) {
        this.targetCount = Math.min(engine.config.maxParticles, Math.round(this.targetCount * 1.025));
      }
    }
  });

  engine.markReady("visuals");
})();
