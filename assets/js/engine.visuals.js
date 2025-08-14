(() => {
  const engine = window.engine;

  function rand(min, max) { return Math.random() * (max - min) + min; }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  class Particle {
    constructor(w, h, cfg) {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.vx = rand(cfg.speed[0], cfg.speed[1]) * (Math.random() < 0.5 ? -1 : 1);
      this.vy = rand(cfg.speed[0], cfg.speed[1]) * (Math.random() < 0.5 ? -1 : 1);
      this.size = rand(cfg.particleSize[0], cfg.particleSize[1]);
      this.baseColor = cfg.color;
    }
    step(dt, bounds, mouse, cfg) {
      const t = dt / 16.6667;

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
      ctx.shadowColor = color;
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  const mod = (engine.modules.visuals = {
    particles: [],
    bounds: { w: 0, h: 0 },

    init() {
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
      const need = (this.targetCount ?? 120);
      const current = this.particles.length;
      for (let i = current; i < need; i++) {
        this.particles.push(new Particle(this.bounds.w, this.bounds.h, cfg));
      }
      if (this.particles.length > need) this.particles.length = need;
    },

    tick(dt) {
      if ((this.particles.length | 0) !== (this.targetCount | 0)) this.spawn();

      const ctx = engine.state.ctx;
      const color = engine.config.color;
      const linkDist = engine.config.linkDistance;
      const linkDist2 = linkDist * linkDist;

      // Update + draw points
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        p.step(dt, this.bounds, engine.state.mouse, engine.config);
      }

      // Draw: points
      for (let i = 0; i < this.particles.length; i++) {
        this.particles[i].draw(ctx, color);
      }

      // Draw: links (O(n^2); capped for performance)
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
              engine.state.ctx.strokeStyle = `rgba(132,197,255,${alpha})`;
              engine.state.ctx.beginPath();
              engine.state.ctx.moveTo(a.x, a.y);
              engine.state.ctx.lineTo(b.x, b.y);
              engine.state.ctx.stroke();
            }
          }
        }
      }
    }
  });

  engine.markReady("visuals");
})();
