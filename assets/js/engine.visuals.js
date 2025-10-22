(() => {
  const engine = window.engine;

  function rand(min, max) { return Math.random() * (max - min) + min; }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a,b,t){return a + (b-a)*t;}

  class Particle {
    constructor(w, h, cfg) {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.z = rand(0.6, 1.6);
      const speedBase = rand(cfg.speed[0], cfg.speed[1]);
      // additional slow-down multiplier for a pronounced slow feel
      const slowFactor = 0.48;
      this.vx = speedBase * slowFactor * (Math.random() < 0.5 ? -1 : 1) * (0.6 + (this.z - 0.6));
      this.vy = speedBase * slowFactor * (Math.random() < 0.5 ? -1 : 1) * (0.6 + (this.z - 0.6));
      this.size = rand(cfg.particleSize[0], cfg.particleSize[1]) * this.z;

      this.twinklePhase = Math.random() * Math.PI * 2;
      this.twinkleSpeed = rand(0.6, 1.2); // slower twinkle (lower multiplier)
      this.seed = Math.random() * 1000;
      this.tempBias = (Math.random() * 2 - 1) * 0.4; // color temperature bias
    }

    step(dt, bounds, mouse, cfg, now) {
      const t = dt / 16.6667;
      const wander = 0.008 * (1 / this.z); // gentler wander
      this.vx += rand(-wander, wander);
      this.vy += rand(-wander, wander);

      const sway = Math.sin((now * 0.0006) + this.seed) * 0.01; // slower sway
      this.vx += sway * (1 / this.z);
      this.vy += sway * (1 / this.z);

      if (mouse.x != null && mouse.y != null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const d2 = dx*dx + dy*dy;
        const r = cfg.repelRadius * (1 + (1.2 - this.z));
        if (d2 < r*r) {
          const d = Math.sqrt(d2) || 0.0001;
          const f = clamp(1 - d / r, 0, 1);
          const mode = mouse.down ? -1 : 1;
          const strength = (0.18 + 0.62 * f) * (mode) * (0.6 + (1.6 - this.z) * 0.18);
          this.vx += (dx / d) * strength;
          this.vy += (dy / d) * strength;
        }
      }

      this.x += this.vx * t;
      this.y += this.vy * t;

      if (this.x < -20) { this.x = -20; this.vx *= -0.78; }
      if (this.x > bounds.w + 20) { this.x = bounds.w + 20; this.vx *= -0.78; }
      if (this.y < -20) { this.y = -20; this.vy *= -0.78; }
      if (this.y > bounds.h + 20) { this.y = bounds.h + 20; this.vy *= -0.78; }

      const damp = 0.994 + (0.0015 * (1.6 - this.z)); // smoother damping
      this.vx *= damp;
      this.vy *= damp;
    }

    drawCore(ctx, now) {
      const tw = 1 + 0.16 * Math.sin((now * 0.00065 * this.twinkleSpeed) + this.twinklePhase);
      const alpha = 0.6 * (this.z / 1.2) * tw;
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.beginPath();
      ctx.fillStyle = `rgba(220,235,255,${alpha})`;
      ctx.arc(this.x, this.y, this.size * (0.75 + 0.18 * this.z) * tw, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    drawGlowTo(ctx, now, glowColor) {
      const tw = 1 + 0.16 * Math.sin((now * 0.00065 * this.twinkleSpeed) + this.twinklePhase);
      const galpha = 0.18 * (this.z) * tw;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = `rgba(${glowColor[0]},${glowColor[1]},${glowColor[2]},${galpha})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, Math.max(4, this.size * 2.4), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  const mod = (engine.modules.visuals = {
    particles: [],
    bounds: { w: 0, h: 0 },
    grid: null,
    cellSize: 120,
    targetCount: 120,
    bloom: null,
    anomalyTimer: 0,

    init() {
      this.onResize(engine.modules.base.width, engine.modules.base.height, engine.modules.base.dpr);
      this.spawn();

      // prepare bloom offscreen if enabled
      if (engine.config.bloomEnabled) {
        this.bloom = {
          canvas: document.createElement('canvas'),
          ctx: null,
          down: engine.config.bloomDownscale || 0.5,
          blurPx: engine.config.bloomBlurPx || 8,
          frameSkip: engine.config.bloomFrameSkip || 3,
          frameCounter: 0
        };
        this.bloom.ctx = this.bloom.canvas.getContext('2d');
      }
    },

    onResize(w, h, dpr) {
      this.bounds.w = w;
      this.bounds.h = h;
      const area = w * h;
      const target = Math.min(engine.config.maxParticles, Math.ceil(area * engine.config.baseParticleDensity));
      this.targetCount = target || 60;
      this.cellSize = Math.max(64, Math.floor(engine.config.linkDistance * 0.9));
      this.grid = null;

      // resize bloom canvas if present
      if (this.bloom) {
        const bw = Math.max(1, Math.floor(w * this.bloom.down));
        const bh = Math.max(1, Math.floor(h * this.bloom.down));
        const pdpr = Math.max(1, Math.floor(dpr));
        this.bloom.canvas.width = Math.floor(bw * pdpr);
        this.bloom.canvas.height = Math.floor(bh * pdpr);
        this.bloom.canvas.style.width = bw + 'px';
        this.bloom.canvas.style.height = bh + 'px';
        this.bloom.ctx.setTransform(pdpr,0,0,pdpr,0,0);
      }
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
      if ((this.particles.length | 0) !== (this.targetCount | 0)) this.spawn();

      const ctx = engine.state.ctx;
      const cfg = engine.config;
      const now = performance.now();
      const fps = engine.state.fps || 60;
      const linkEnabled = fps > 20; // allow links even on somewhat slower devices

      // update anomaly timer (random occasional flash)
      this.anomalyTimer -= dt;
      if (this.anomalyTimer <= 0) {
        // schedule next in 6-22s
        this.anomalyTimer = 6000 + Math.random() * 16000;
        this._triggerAnomaly = now; // mark anomaly time
      }

      // Update particle positions
      for (let i = 0; i < this.particles.length; i++) {
        this.particles[i].step(dt, this.bounds, engine.state.mouse, cfg, now);
      }

      // Draw background trail (fade)
      // base.tick already applies a fade; visuals draws on top

      // Build spatial grid for links
      if (linkEnabled) this.buildGrid();

      // Offscreen bloom: draw glows into bloom canvas (sparser, cheaper)
      if (this.bloom) {
        const b = this.bloom;
        b.frameCounter++;
        // only update bloom texture every N frames to save perf
        if (b.frameCounter % b.frameSkip === 0) {
          const boc = b.ctx;
          boc.clearRect(0,0, boc.canvas.width / (b.ctx.getTransform()?.a || 1), boc.canvas.height / (b.ctx.getTransform()?.d || 1));
          boc.save();
          boc.scale(b.down, b.down);
          // subtle glows only (no core)
          for (let i=0;i<this.particles.length;i++){
            const p = this.particles[i];
            // color temp mix between warm and cool
            const warm = [255,200,140], cool = [120,170,255];
            const depth = clamp((p.z - 0.6) / (1.6 - 0.6), 0, 1);
            const mix = clamp(0.5 + p.tempBias * 0.35 + (depth * 0.25), 0, 1);
            const r = Math.round(lerp(warm[0], cool[0], mix));
            const g = Math.round(lerp(warm[1], cool[1], mix));
            const bcol = Math.round(lerp(warm[2], cool[2], mix));
            boc.fillStyle = `rgba(${r},${g},${bcol},${0.12 * p.z})`;
            boc.beginPath();
            boc.arc(p.x, p.y, Math.max(5, p.size * 3.0), 0, Math.PI*2);
            boc.fill();
          }
          boc.restore();
        }
      }

      // Draw main particle cores and local glow (sharp)
      for (let i = 0; i < this.particles.length; i++) {
        this.particles[i].drawCore(ctx, now);
      }

      // Draw links: more lines, slightly thicker, and depth-based strength
      if (linkEnabled) {
        ctx.save();
        ctx.lineCap = 'round';
        for (let i = 0; i < this.particles.length; i++) {
          const a = this.particles[i];
          const neighbors = this.neighborsFor(a);
          for (let j = 0; j < neighbors.length; j++) {
            const b = neighbors[j];
            if (a === b) continue;
            const dx = a.x - b.x, dy = a.y - b.y;
            const d2 = dx*dx + dy*dy;
            const maxD = cfg.linkDistance;
            if (d2 <= maxD * maxD) {
              const d = Math.sqrt(d2);
              const depthFactor = (a.z + b.z) * 0.5;
              // make links more visible: increase base by small factor, but keep falloff
              const alpha = Math.max(0, cfg.linkOpacity * 1.25 * (1 - d / maxD) * depthFactor);
              if (alpha > 0.02) {
                // color varies slightly with depth; cold-blue core with faint purple tint for scariness
                const r = Math.round(120 + 40 * (1 - depthFactor));
                const g = Math.round(150 + 30 * depthFactor);
                const bl = Math.round(200 + 55 * depthFactor);
                ctx.strokeStyle = `rgba(${r},${g},${bl},${alpha})`;
                ctx.lineWidth = 0.8 + (0.9 * depthFactor);
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();

                // Occasional secondary faint "webbing" (short perpendicular flick) to add creepiness
                if (Math.random() < 0.002) {
                  ctx.globalAlpha = Math.min(0.08, alpha * 0.45);
                  ctx.beginPath();
                  const mx = (a.x + b.x)*0.5 + (Math.random()-0.5) * 8;
                  const my = (a.y + b.y)*0.5 + (Math.random()-0.5) * 8;
                  ctx.moveTo(mx, my);
                  ctx.lineTo(mx + (Math.random()-0.5)*18, my + (Math.random()-0.5)*18);
                  ctx.stroke();
                  ctx.globalAlpha = 1;
                }
              }
            }
          }
        }
        ctx.restore();
      }

      // Composite bloom onto main canvas (blur when compositing)
      if (this.bloom && this.bloom.canvas) {
        ctx.save();
        if (ctx.filter !== undefined) {
          ctx.filter = `blur(${this.bloom.blurPx}px)`;
        }
        ctx.globalCompositeOperation = 'lighter';
        // draw scaled bloom canvas to main canvas area
        ctx.drawImage(this.bloom.canvas, 0, 0, this.bounds.w, this.bounds.h);
        ctx.globalCompositeOperation = 'source-over';
        ctx.filter = 'none';
        ctx.restore();
      }

      // Draw per-particle sharper glows on top of core for contrast
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        const cool = [120,170,255], warm = [255,200,140];
        const depth = clamp((p.z - 0.6) / (1.6 - 0.6), 0, 1);
        const mix = clamp(0.5 + p.tempBias * 0.35 + (depth * 0.25), 0, 1);
        const glowColor = [Math.round(lerp(warm[0], cool[0], mix)), Math.round(lerp(warm[1], cool[1], mix)), Math.round(lerp(warm[2], cool[2], mix))];
        p.drawGlowTo(ctx, now, glowColor);
      }

      // Occasional anomaly flash (a sudden, ominous brightening that ripples)
      if (this._triggerAnomaly && (now - this._triggerAnomaly) < 900) {
        const t = (now - this._triggerAnomaly) / 900;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = `rgba(100,120,200,${0.08 * (1 - t)})`;
        const cx = Math.random() * this.bounds.w;
        const cy = Math.random() * this.bounds.h;
        ctx.beginPath();
        ctx.arc(cx, cy, (this.bounds.w + this.bounds.h) * (0.02 + 0.06 * (1 - t)), 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
        // expire anomaly after short window
        if ((now - this._triggerAnomaly) > 800) this._triggerAnomaly = null;
      }

      // subtle click spark visual feedback
      if (engine.state.mouse.down && engine.state.mouse.x != null) {
        const m = engine.state.mouse;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = 'rgba(180,210,255,0.04)';
        ctx.beginPath();
        ctx.arc(m.x, m.y, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  });

  engine.markReady("visuals");
})();
