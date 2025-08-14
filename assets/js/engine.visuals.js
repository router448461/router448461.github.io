(() => {
  const engine = window.engine;

  // --- Utility ---
  function rand(min, max) { return Math.random() * (max - min) + min; }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  // --- Configuration for layers, physics, radar ---
  const LAYERS = [
    { depth: 0.3, color: "#507fa6", linkColor: "rgba(80,127,166,0.09)", particleScale: 0.8 },
    { depth: 0.6, color: "#84c5ff", linkColor: "rgba(132,197,255,0.14)", particleScale: 1.0 },
    { depth: 1.0, color: "#fff7b7", linkColor: "rgba(255,247,183,0.06)", particleScale: 1.3 }
  ];
  const FORMATIONS = [
    "line", "column", "wedge", "grid"
  ];

  // --- Particle ---
  class Particle {
    constructor(w, h, cfg, layerIdx) {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.vx = rand(cfg.speed[0], cfg.speed[1]) * (Math.random() < 0.5 ? -1 : 1);
      this.vy = rand(cfg.speed[0], cfg.speed[1]) * (Math.random() < 0.5 ? -1 : 1);
      this.size = rand(cfg.particleSize[0], cfg.particleSize[1]) * (LAYERS[layerIdx].particleScale);
      this.layer = layerIdx;
      this.active = false;
      this.formation = null;
      this.fx = 0; this.fy = 0;
      this.opacity = 1;
    }
    step(dt, bounds, mouse, cfg, gravity) {
      const t = dt / 16.6667;
      // mild wander
      this.vx += rand(-0.02, 0.02) * (0.8 + 0.2 * LAYERS[this.layer].depth);

      this.vy += rand(-0.02, 0.02) * (0.8 + 0.2 * LAYERS[this.layer].depth);

      // gravity well
      if (gravity) {
        const dx = gravity.x - this.x, dy = gravity.y - this.y;
        const d2 = dx*dx + dy*dy;
        if (d2 > 4000) {
          this.vx += dx / 1800;
          this.vy += dy / 1800;
        }
      }

      // mouse repel
      if (mouse.x != null && mouse.y != null) {
        const dx = this.x - mouse.x, dy = this.y - mouse.y;
        const d2 = dx*dx + dy*dy;
        const r = cfg.repelRadius * (0.7 + 0.3 * LAYERS[this.layer].depth);
        if (d2 < r*r) {
          const d = Math.sqrt(d2) || 0.0001;
          const f = clamp(1 - d / r, 0, 1);
          this.vx += (dx / d) * (0.25 + 0.5 * f);
          this.vy += (dy / d) * (0.25 + 0.5 * f);
        }
      }

      // Formation force if active
      if (this.formation) {
        this.vx += (this.fx - this.x) * 0.05;
        this.vy += (this.fy - this.y) * 0.05;
      }

      this.x += this.vx * t;
      this.y += this.vy * t;

      // Soft bounds bounce
      if (this.x < 0) { this.x = 0; this.vx *= -0.9; }
      if (this.x > bounds.w) { this.x = bounds.w; this.vx *= -0.9; }
      if (this.y < 0) { this.y = 0; this.vy *= -0.9; }
      if (this.y > bounds.h) { this.y = bounds.h; this.vy *= -0.9; }

      // Damp
      this.vx *= 0.993;
      this.vy *= 0.993;
    }
    draw(ctx, color) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = color;
      if (this.active) {
        ctx.shadowColor = "#ffffbb";
        ctx.shadowBlur = 18;
      }
      ctx.fill();
      ctx.restore();
    }
  }

  // --- Signal packet ---
  class Signal {
    constructor(a, b, color, duration, isTrail) {
      this.a = a;
      this.b = b;
      this.color = color;
      this.t = 0;
      this.duration = duration || rand(1200, 2200);
      this.dir = Math.random() < 0.5 ? 1 : -1;
      this.alive = true;
      this.isTrail = isTrail;
      this.trail = [];
    }
    step(dt) {
      this.t += (dt / this.duration) * this.dir;
      if (this.t > 1 || this.t < 0) { this.alive = false; }
      if (this.isTrail) {
        const x = lerp(this.a.x, this.b.x, clamp(this.t, 0, 1));
        const y = lerp(this.a.y, this.b.y, clamp(this.t, 0, 1));
        this.trail.push({ x, y, life: 1 });
        if (this.trail.length > 20) this.trail.shift();
      }
      for (const p of this.trail) p.life -= 0.04;
    }
    draw(ctx) {
      const x = lerp(this.a.x, this.b.x, clamp(this.t, 0, 1));
      const y = lerp(this.a.y, this.b.y, clamp(this.t, 0, 1));
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = 0.9;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 16;
      ctx.fill();
      if (this.isTrail) {
        for (const p of this.trail) {
          ctx.globalAlpha = p.life * 0.5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = "#ffdc7d";
          ctx.fill();
        }
      }
      ctx.restore();
    }
  }

  // --- Visuals module ---
  const mod = (engine.modules.visuals = {
    layers: [],
    signals: [],
    backboneLinks: [],
    radar: { angle: 0, speed: 0.012, radius: 0 },
    jamming: { active: false, alpha: 0 },
    formations: [],
    colorModes: ["ops", "ambient", "stealth"],

    bounds: { w: 0, h: 0 },
    gravity: { x: 0, y: 0 },

    init() {
      this.onResize(engine.modules.base.width, engine.modules.base.height, engine.modules.base.dpr);
      this.spawn();
      this.radar.radius = Math.min(this.bounds.w, this.bounds.h) * 0.45;
      setInterval(() => this.toggleJamming(), rand(7000, 13000));
      setInterval(() => this.cycleColorMode(), 6000);

      setInterval(() => this.triggerFormation(), rand(9000, 20000));
    },

    onResize(w, h) {
      this.bounds.w = w;
      this.bounds.h = h;
      this.gravity.x = w * 0.52 + rand(-60, 60);
      this.gravity.y = h * 0.52 + rand(-60, 60);
      this.spawn();
      this.radar.radius = Math.min(w, h) * 0.45;
    },

    spawn() {
      this.layers = [];
      for (let l = 0; l < LAYERS.length; l++) {
        this.layers[l] = [];
        const area = this.bounds.w * this.bounds.h;
        const target = Math.min(engine.config.maxParticles, Math.ceil(area * engine.config.baseParticleDensity * (0.5 + LAYERS[l].depth)));
        for (let i = 0; i < target; i++) {
          this.layers[l].push(new Particle(this.bounds.w, this.bounds.h, engine.config, l));
        }
      }
      this.buildBackbones();
    },

    buildBackbones() {
      // Pick random backbone connections on the deepest layer
      const arr = [];
      const layer = this.layers[LAYERS.length-1];
      const count = Math.max(2, Math.floor(layer.length / 18));
      for (let i = 0; i < count; i++) {
        let a = layer[Math.floor(rand(0, layer.length))];
        let bestB = null, farthest = 0;
        for (let j = 0; j < layer.length; j++) {
          let b = layer[j];
          if (a === b) continue;
          let d2 = ((a.x-b.x)**2 + (a.y-b.y)**2);
          if (d2 > farthest) { farthest = d2; bestB = b; }
        }
        if (bestB) arr.push([a, bestB]);
      }
      this.backboneLinks = arr;
    },

    triggerFormation() {
      // Pick a random formation type and a random layer
      const ftype = FORMATIONS[Math.floor(rand(0, FORMATIONS.length))];
      const layerIdx = Math.floor(rand(0, this.layers.length));
      const group = [];
      const layer = this.layers[layerIdx];
      const n = Math.max(7, Math.floor(layer.length / 4));
      for (let i = 0; i < n; i++) {
        group.push(layer[Math.floor(rand(0, layer.length))]);
      }
      // Assign formation positions
      for (let i = 0; i < group.length; i++) {
        let p = group[i];
        p.formation = ftype;
        p.active = true;
        if (ftype === "line") {
          p.fx = this.bounds.w * 0.4 + i * (this.bounds.w * 0.2 / group.length);
          p.fy = this.bounds.h * 0.5 + rand(-30, 30);
        } else if (ftype === "column") {
          p.fx = this.bounds.w * 0.5 + rand(-30, 30);
          p.fy = this.bounds.h * 0.3 + i * (this.bounds.h * 0.5 / group.length);
        } else if (ftype === "wedge") {
          const angle = Math.PI * 0.5 + (i - group.length/2) * (Math.PI/32);
          p.fx = this.bounds.w * 0.5 + Math.cos(angle) * 120 + rand(-12, 12);
          p.fy = this.bounds.h * 0.6 + Math.sin(angle) * 120 + rand(-12, 12);
        } else if (ftype === "grid") {
          const cols = Math.ceil(Math.sqrt(group.length));
          p.fx = this.bounds.w * 0.33 + (i % cols) * 32;
          p.fy = this.bounds.h * 0.33 + Math.floor(i / cols) * 32;
        }
      }
      setTimeout(() => {
        for (const p of group) { p.formation = null; p.active = false; }
      }, rand(1800, 3400));
    },

    toggleJamming() {
      this.jamming.active = !this.jamming.active;
      if (this.jamming.active) {
        this.jamming.alpha = rand(0.07, 0.15);
        setTimeout(() => { this.jamming.active = false; }, rand(1800, 3500));
      }
    },

    cycleColorMode() {
      const idx = this.colorModes.indexOf(document.documentElement.dataset.mode || "ops");
      const next = this.colorModes[(idx+1) % this.colorModes.length];
      document.documentElement.dataset.mode = next;
    },

    tick(dt) {
      // Radar sweep animation
      this.radar.angle += this.radar.speed * dt;
      if (this.radar.angle > Math.PI * 2) this.radar.angle -= Math.PI * 2;

      // Update layers of particles
      for (let l = 0; l < this.layers.length; l++) {
        for (let i = 0; i < this.layers[l].length; i++) {
          this.layers[l][i].step(dt, this.bounds, engine.state.mouse, engine.config, this.gravity);
        }
      }

      // Draw: motion blur trail
      const ctx = engine.state.ctx;
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = `rgba(10,13,20,${engine.config.backgroundFade})`;
      ctx.fillRect(0, 0, this.bounds.w, this.bounds.h);
      ctx.restore();

      // Draw: jamming/fog
      if (this.jamming.active) {
        ctx.save();
        ctx.globalAlpha = this.jamming.alpha;
        for (let i=0; i<9; i++) {
          ctx.fillStyle = `rgba(${rand(180,250)},${rand(180,250)},${rand(180,250)},${rand(0.07,0.18)})`;
          ctx.beginPath();
          ctx.ellipse(rand(0, this.bounds.w), rand(0, this.bounds.h), rand(60,280), rand(23,80), rand(0,Math.PI*2), 0, Math.PI*2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Draw: radar sweep
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.beginPath();
      ctx.arc(this.bounds.w/2, this.bounds.h/2, this.radar.radius, this.radar.angle, this.radar.angle+Math.PI/7);
      ctx.lineTo(this.bounds.w/2, this.bounds.h/2);
      ctx.closePath();
      ctx.fillStyle = "#4ebcff";
      ctx.fill();
      ctx.restore();

      // Draw: backbone links
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

      // Draw: all layers
      for (let l = 0; l < this.layers.length; l++) {
        const particles = this.layers[l];
        // Links
        ctx.save();
        ctx.lineWidth = 1;
        for (let i = 0; i < particles.length; i++) {
          const a = particles[i];
          for (let j = i + 1; j < particles.length; j++) {
            const b = particles[j];
            const dx = a.x - b.x, dy = a.y - b.y;
            const d2 = dx*dx + dy*dy;
            const linkDist = engine.config.linkDistance * (0.7 + 0.5 * LAYERS[l].depth);
            const linkDist2 = linkDist * linkDist;
            if (d2 <= linkDist2) {
              const d = Math.sqrt(d2);
              const alpha = Math.max(0, engine.config.linkOpacity * (1 - d / linkDist));
              if (alpha > 0.01) {
                ctx.strokeStyle = LAYERS[l].linkColor;
                ctx.globalAlpha = alpha * (0.78 + 0.22 * LAYERS[l].depth);
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();

                // Occasionally spawn signal packets
                if (Math.random() < 0.0007 * (1 + LAYERS[l].depth)) {
                  const color = l === 2 ? "#ffdc7d" : "#5fb3ff";
                  this.signals.push(new Signal(a, b, color, rand(900, 1500), true));
                }
              }
            }
          }
        }
        ctx.restore();

        // Particles
        for (let i = 0; i < particles.length; i++) {
          // Radar sweep highlight
          const dx = particles[i].x - this.bounds.w/2;
          const dy = particles[i].y - this.bounds.h/2;
          const dist = Math.sqrt(dx*dx + dy*dy);
          const angle = Math.atan2(dy, dx);
          const radarHighlight =
            dist < this.radar.radius+40 && dist > this.radar.radius-60 &&
            Math.abs(((this.radar.angle+Math.PI/14)% (Math.PI*2)) - (angle % (Math.PI*2))) < Math.PI/10;
          particles[i].opacity = radarHighlight ? 1 : 0.78 + 0.22 * LAYERS[l].depth;
          particles[i].draw(ctx, LAYERS[l].color);
        }
      }

      // Draw: signals
      for (let i = this.signals.length - 1; i >= 0; i--) {
        const s = this.signals[i];
        s.step(dt);
        s.draw(ctx);
        if (!s.alive) this.signals.splice(i, 1);
      }
    }
  });

  engine.markReady("visuals");
})();
