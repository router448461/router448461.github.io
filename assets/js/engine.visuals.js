(() => {
  const engine = window.engine;

  function rand(min, max) { return Math.random() * (max - min) + min; }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function hexToRgb(hex) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || "");
    return m ? { r: parseInt(m[1],16), g: parseInt(m[2],16), b: parseInt(m[3],16) } : { r: 132, g: 197, b: 255 };
  }

  const Noise = (() => {
    function hash(x, y, z) {
      let n = (x * 73856093) ^ (y * 19349663) ^ (z * 83492791);
      n = (n << 13) ^ n;
      return (1 - ((n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824) * 0.5 + 0.5;
    }
    function smooth(t) { return t * t * (3 - 2 * t); }
    function vnoise(x, y, z) {
      const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
      const xf = x - xi, yf = y - yi, zf = z - zi;
      const u = smooth(xf), v = smooth(yf), w = smooth(zf);
      function h(ix, iy, iz) { return hash(ix, iy, iz); }
      const c000 = h(xi, yi, zi), c100 = h(xi+1, yi, zi);
      const c010 = h(xi, yi+1, zi), c110 = h(xi+1, yi+1, zi);
      const c001 = h(xi, yi, zi+1), c101 = h(xi+1, yi, zi+1);
      const c011 = h(xi, yi+1, zi+1), c111 = h(xi+1, yi+1, zi+1);
      const x00 = lerp(c000, c100, u), x10 = lerp(c010, c110, u);
      const x01 = lerp(c001, c101, u), x11 = lerp(c011, c111, u);
      const y0 = lerp(x00, x10, v), y1 = lerp(x01, x11, v);
      return lerp(y0, y1, w);
    }
    function angle(x, y, t, scale) {
      const n = vnoise(x * scale, y * scale, t);
      return n * Math.PI * 2;
    }
    return { angle };
  })();

  function mixRGB(a, b, t) {
    return {
      r: Math.round(lerp(a.r, b.r, t)),
      g: Math.round(lerp(a.g, b.g, t)),
      b: Math.round(lerp(a.b, b.b, t))
    };
  }

  class Particle {
    constructor(w, h, cfg, palette) {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.z = rand(cfg.depth.min, cfg.depth.max);
      const sp = rand(cfg.speed[0], cfg.speed[1]) * (1.0 + (1.0 / this.z - 1.0) * 0.25);
      const dir = Math.random() * Math.PI * 2;
      this.vx = Math.cos(dir) * sp;
      this.vy = Math.sin(dir) * sp;
      this.size = rand(cfg.particleSize[0], cfg.particleSize[1]) * (0.75 + 0.25 / this.z);
      this.phase = Math.random() * Math.PI * 2;
      this.tintT = Math.random() * 0.7 + 0.15;
      this.tintDrift = rand(-0.025, 0.025);
      this.baseAlpha = clamp(1.15 - this.z * 0.5, 0.3, 0.95);
      this.color = mixRGB(palette.primary, palette.secondary, this.tintT);
    }

    step(dt, bounds, mouse, cfg, time) {
      const t = dt / 16.6667;
      const ang = Noise.angle(this.x, this.y, time.noiseT, cfg.noise.scale);
      const flow = cfg.noise.strength * (0.6 + 0.4 / this.z);
      this.vx += Math.cos(ang) * flow;
      this.vy += Math.sin(ang) * flow;
      this.vx += rand(-0.01, 0.01);
      this.vy += rand(-0.01, 0.01);

      if (mouse.x != null && mouse.y != null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const d2 = dx*dx + dy*dy;
        const r = cfg.repelRadius;
        if (d2 < r*r) {
          const d = Math.sqrt(d2) || 0.0001;
          const f = clamp(1 - d / r, 0, 1);
          const scale = 0.35 + 0.65 * f;
          const depthScale = 0.9 + 0.2 / this.z;
          this.vx += (dx / d) * scale * depthScale;
          this.vy += (dy / d) * scale * depthScale;
        }
      }

      this.x += this.vx * t;
      this.y += this.vy * t;

      if (this.x < 0) { this.x = 0; this.vx *= -0.9; }
      if (this.x > bounds.w) { this.x = bounds.w; this.vx *= -0.9; }
      if (this.y < 0) { this.y = 0; this.vy *= -0.9; }
      if (this.y > bounds.h) { this.y = bounds.h; this.vy *= -0.9; }

      this.vx *= 0.995;
      this.vy *= 0.995;
      this.tintT = clamp(this.tintT + this.tintDrift * t * 0.05, 0.1, 0.9);
    }

    flicker(now, speed) { return 0.85 + 0.15 * Math.sin(this.phase + now * speed); }
    currentAlpha(now, speed) { return clamp(this.baseAlpha * this.flicker(now, speed), 0.15, 1); }
  }

  class MicroParticle {
    constructor(w, h, cfg, palette) {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.life = rand(cfg.micro.life[0], cfg.micro.life[1]);
      this.t = this.life;
      this.size = rand(cfg.micro.size[0], cfg.micro.size[1]);
      this.color = palette.secondary;
      this.alpha = cfg.micro.alpha;
    }
    step(dt) { this.t -= dt; }
    get dead() { return this.t <= 0; }
    draw(ctx) {
      const a = this.alpha * (this.t / this.life);
      ctx.beginPath();
      ctx.fillStyle = `rgba(${this.color.r},${this.color.g},${this.color.b},${a})`;
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const mod = (engine.modules.visuals = {
    particles: [],
    micro: [],
    bounds: { w: 0, h: 0 },
    targetCount: 0,
    colorPrimary: null,
    colorSecondary: null,
    timeNow: 0,
    baseFade: null,
    pulse: { nextAt: 0, until: 0, active: false },

    init() {
      const cfg = engine.config;
      this.colorPrimary = hexToRgb(cfg.color);
      this.colorSecondary = hexToRgb(cfg.secondaryColor || cfg.color);
      this.baseFade = cfg.backgroundFade;
      this.onResize(engine.modules.base.width, engine.modules.base.height, engine.modules.base.dpr);
      this.spawn();
      this._schedulePulse();
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
      const need = (this.targetCount ?? 120);
      const current = this.particles.length;
      for (let i = current; i < need; i++) {
        this.particles.push(new Particle(this.bounds.w, this.bounds.h, cfg, {
          primary: this.colorPrimary,
          secondary: this.colorSecondary
        }));
      }
      if (this.particles.length > need) this.particles.length = need;
    },

    _schedulePulse() {
      const p = engine.config.pulse;
      const now = performance.now();
      this.pulse.nextAt = now + Math.round(rand(p.minInterval, p.maxInterval));
      this.pulse.until = 0;
      this.pulse.active = false;
    },

    _updatePulse() {
      const p = engine.config.pulse;
      const now = performance.now();
      if (!this.pulse.active && now >= this.pulse.nextAt) {
        this.pulse.active = true;
        this.pulse.until = now + p.duration;
      }
      if (this.pulse.active) {
        const remain = this.pulse.until - now;
        if (remain <= 0) {
          engine.config.backgroundFade = this.baseFade;
          this.pulse.active = false;
          this._schedulePulse();
        } else {
          const phase = 1 - remain / p.duration;
          const ease = phase < 0.5 ? 2 * phase * phase : -1 + (4 - 2 * phase) * phase;
          const scale = clamp(1 - p.intensity * ease, 0.5, 1.0);
          engine.config.backgroundFade = this.baseFade * scale;
        }
      }
    },

    _spawnMicro(dt) {
      const cfg = engine.config;
      const expected = this.particles.length * cfg.micro.spawnRate * (dt / 1000);
      let count = 0;
      let acc = expected;
      while (acc > 0) { if (Math.random() < acc) count++; acc -= 1; }
      for (let i = 0; i < count; i++) {
        this.micro.push(new MicroParticle(this.bounds.w, this.bounds.h, cfg, { secondary: this.colorSecondary }));
      }
      if (this.micro.length > 300) this.micro.splice(0, this.micro.length - 300);
    },

    tick(dt) {
      if ((this.particles.length | 0) !== (this.targetCount | 0)) this.spawn();

      const ctx = engine.state.ctx;
      const cfg = engine.config;
      const linkDist = cfg.linkDistance;
      const linkDist2 = linkDist * linkDist;
      const zTol = cfg.depth.linkTolerance;

      this.timeNow += dt;
      const time = { t: this.timeNow, noiseT: this.timeNow * cfg.noise.speed };

      this._updatePulse();

      for (let i = 0; i < this.particles.length; i++) {
        this.particles[i].step(dt, this.bounds, engine.state.mouse, cfg, time);
      }

      this._spawnMicro(dt);
      for (let i = 0; i < this.micro.length; i++) this.micro[i].step(dt);
      if (this.micro.length) {
        for (let i = this.micro.length - 1; i >= 0; i--) if (this.micro[i].dead) this.micro.splice(i, 1);
      }

      ctx.save();
      const gs = clamp(cfg.glowStrength, 0, 2);
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        const a = p.currentAlpha(this.timeNow / 1000, cfg.flickerSpeed);
        ctx.shadowColor = `rgba(${p.color.r},${p.color.g},${p.color.b},${Math.min(0.8, a)})`;
        ctx.shadowBlur = 2 + gs * 4;
        ctx.shadowOffsetX = p.vx * 0.15;
        ctx.shadowOffsetY = p.vy * 0.15;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.color.r},${p.color.g},${p.color.b},${a})`;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = gs * 8;
        ctx.shadowColor = `rgba(${p.color.r},${p.color.g},${p.color.b},${a * 0.35})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.9, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      for (let i = 0; i < this.micro.length; i++) this.micro[i].draw(ctx);

      ctx.lineWidth = 1;
      for (let i = 0; i < this.particles.length; i++) {
        const a = this.particles[i];
        const aAlpha = a.currentAlpha(this.timeNow / 1000, cfg.flickerSpeed);
        for (let j = i + 1; j < this.particles.length; j++) {
          const b = this.particles[j];
          if (Math.abs(a.z - b.z) > zTol) continue;
          const dx = a.x - b.x;
          if (dx*dx > linkDist2) continue;
          const dy = a.y - b.y;
          const d2 = dx*dx + dy*dy;
          if (d2 > linkDist2) continue;
          const d = Math.sqrt(d2);
          const baseAlpha = cfg.linkOpacity * (1 - d / linkDist);
          const bAlpha = b.currentAlpha(this.timeNow / 1000, cfg.flickerSpeed);
          const brightness = (aAlpha + bAlpha) * 0.5;
          const alpha = baseAlpha * brightness;
          if (alpha <= 0.01) continue;
          const mixR = Math.round((a.color.r + b.color.r) * 0.5);
          const mixG = Math.round((a.color.g + b.color.g) * 0.5);
          const mixB = Math.round((a.color.b + b.color.b) * 0.5);
          ctx.strokeStyle = `rgba(${mixR},${mixG},${mixB},${alpha})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
  });

  engine.markReady("visuals");
})();
