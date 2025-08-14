(() => {
  const engine = window.engine;

  function rand(min, max) { return Math.random() * (max - min) + min; }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  class Particle {
    constructor(w, h, cfg) {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.vx = rand(cfg.speed[0], cfg.speed[1]) * (Math.random() < 0.5 ? -1 : 1);
      this.vy = rand(cfg.speed[0], cfg.speed[1]) * (Math.random() < 0.5 ? -1 : 1);
      this.size = rand(cfg.particleSize[0], cfg.particleSize[1]);
    }
    step(dt, bounds, mouse, cfg) {
      const t = dt / 16.6667; // normalize to ~60fps units

      // mild wander
      this.vx += rand(-0.02, 0.02);
      this.vy += rand(-0.02, 0.02);

      // mouse repel
      if (mouse.x != null && mouse.y != null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const d2 = dx*dx + dy*dy;
        const r = cfg.repelRadius;
        if (d2 < r*r) {
          const d = Math.sqrt(d2) || 0.0001;
          const f = clamp(1 - d / r, 0, 1);
          this.vx += (dx / d) * (0.35 + 0.65 * f);
          this.vy += (dy / d) * (0.35 + 0.65 * f);
        }
      }

      this.x += this.vx * t;
      this.y += this.vy * t;

      // Soft bounds bounce
      if (this.x < 0) { this.x = 0; this.vx *= -0.9; }
      if (this.x > bounds.w) { this.x = bounds.w; this.vx *= -0.9; }
      if (this.y < 0) { this.y = 0; this.vy *= -0.9; }
      if (this.y > bounds.h) { this.y = bounds.h; this.vy *= -0.9; }

      // Damp
      this.vx *= 0.995;
      this.vy *= 0.995;
    }
    draw(ctx, color) {
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Signal dots that travel along links between two particles
  class Signal {
    constructor(a, b, color, duration) {
      this.a = a;
      this.b = b;
      this.color = color;
      this.t = 0; // progress 0-1
      this.duration = duration || rand(1200, 2200); // ms
      this.dir = Math.random() < 0.5 ? 1 : -1; // direction
      this.alive = true;
    }
    step(dt) {
      this.t += (dt / this.duration) * this.dir;
      if (this.t > 1 || this.t < 0) { this.alive = false; }
    }
    draw(ctx) {
      const x = lerp(this.a.x, this.b.x, clamp(this.t, 0, 1));
      const y = lerp(this.a.y, this.b.y, clamp(this.t, 0, 1));
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, 2.4, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = 0.85;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();
    }
  }

  const mod = (engine.modules.visuals = {
    particles: [],
    bounds: { w: 0, h: 0 },
    signals: [],
    backboneLinks: [],

    init() {
      this.onResize(engine.modules.base.width, engine.modules.base.height, engine.modules.base.dpr);
      this.spawn();
      this.backboneLinks = [];
    },

    onResize(w, h) {
      this.bounds.w = w;
      this.bounds.h = h;
      // Adjust population target based on area
      const area = w * h;
      const target = Math.min(engine.config.maxParticles, Math.ceil(area * engine.config.baseParticleDensity));
      this.targetCount = target;
      // Rebuild backbone links
      this.buildBackbones();
    },

    spawn() {
      const cfg = engine.config;
      const need = (this.targetCount ?? 120);
      const current = this.particles.length;
      for (let i = current; i < need; i++) {
        this.particles.push(new Particle(this.bounds.w, this.bounds.h, cfg));
      }
      if (this.particles.length > need) this.particles.length = need;
      this.buildBackbones();
    },

    buildBackbones() {
      // Pick several random backbone connections between spread-out particles
      const arr = [];
      const count = Math.max(2, Math.floor(this.particles.length / 18));
      for (let i = 0; i < count; i++) {
        let a = this.particles[Math.floor(rand(0, this.particles.length))];
        let bestB = null; let farthest = 0;
        for (let j = 0; j < this.particles.length; j++) {
          let b = this.particles[j];
          if (a === b) continue;
          let d2 = ((a.x-b.x)**2 + (a.y-b.y)**2);
          if (d2 > farthest) { farthest = d2; bestB = b; }
        }
        if (bestB) arr.push([a, bestB]);
      }
      this.backboneLinks = arr;
    },

    tick(dt) {
      // Ensure population
      if ((this.particles.length | 0) !== (this.targetCount | 0)) this.spawn();

      const ctx = engine.state.ctx;
      const color = engine.config.color;
      const linkDist = engine.config.linkDistance;
      const linkDist2 = linkDist * linkDist;

      // Update particles
      for (let i = 0; i < this.particles.length; i++) {
        this.particles[i].step(dt, this.bounds, engine.state.mouse, engine.config);
      }

      // Draw backbone links (long lines)
      ctx.save();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "rgba(135,200,255,0.27)";
      for (const [a, b] of this.backboneLinks) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      ctx.restore();

      // Draw links (short lines)
      ctx.lineWidth = 1;
      for (let i = 0; i < this.particles.length; i++) {
        const a = this.particles[i];
        for (let j = i + 1; j < this.particles.length; j++) {
          const b = this.particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx*dx + dy*dy;
          if (d2 <= linkDist2) {
            const d = Math.sqrt(d2);
            const alpha = Math.max(0, engine.config.linkOpacity * (1 - d / linkDist));
            if (alpha > 0.01) {
              ctx.strokeStyle = `rgba(132,197,255,${alpha})`;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();

              // Occasionally spawn a signal dot on a link
              if (Math.random() < 0.0008) {
                this.signals.push(new Signal(a, b, "#ffdc7d", rand(900, 1500)));
              }
            }
          }
        }
      }

      // Occasionally spawn a signal dot along a backbone link
      if (this.backboneLinks.length && Math.random() < 0.05) {
        const [a, b] = this.backboneLinks[Math.floor(rand(0, this.backboneLinks.length))];
        this.signals.push(new Signal(a, b, "#5fb3ff", rand(1600, 2500)));
      }

      // Draw and update signals
      for (let i = this.signals.length - 1; i >= 0; i--) {
        const s = this.signals[i];
        s.step(dt);
        s.draw(ctx);
        if (!s.alive) this.signals.splice(i, 1);
      }

      // Draw particles
      for (let i = 0; i < this.particles.length; i++) {
        this.particles[i].draw(ctx, color);
      }
    }
  });

  engine.markReady("visuals");
})();
