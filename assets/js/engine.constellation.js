;(() => {
  'use strict';

  // Utility helpers
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const rand = (min, max) => Math.random() * (max - min) + min;

  const DEFAULTS = {
    dotColor: '#ffffff',
    lineColor: '#9bb8ff',
    dotRadius: [1.2, 2.2],
    lineWidth: 1.1,
    lineMaxDistance: 160,
    hoverLinkDistance: 190,
    density: 15000,       // area/density ≈ particle count
    minParticles: 80,
    maxParticles: 220,
    speed: 0.4,           // px per frame @60fps baseline
    drift: 0.1,           // small random perturbation
    repelRadius: 110,
    repelForce: 0.014,
    wrap: true,
    fpsCap: 60,
    tacticalMode: true
  };

  class Constellation {
    constructor(canvas, opts = {}) {
      if (!canvas || !canvas.getContext) {
        throw new Error('Constellation: canvas not available');
      }

      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.opts = { ...DEFAULTS, ...opts };

      this.dpr = Math.max(1, window.devicePixelRatio || 1);
      this.w = 0;
      this.h = 0;

      this.particles = [];
      this.trails = [];
      this.mouse = { x: null, y: null, inside: false };
      this.clickFlash = null;
      this.edgePing = null;

      this._running = false;
      this._rafId = null;
      this._last = 0;
      this._frameInterval = this.opts.fpsCap > 0 ? 1000 / this.opts.fpsCap : 0;

      // Bind handlers
      this._onResize = this._onResize.bind(this);
      this._onMouseMove = this._onMouseMove.bind(this);
      this._onMouseLeave = this._onMouseLeave.bind(this);
      this._onClick = this._onClick.bind(this);
      this._tick = this._tick.bind(this);

      // Init
      this._onResize();
      this._reseedParticles(this._targetCount());

      window.addEventListener('resize', this._onResize, { passive: true });
      window.addEventListener('mousemove', this._onMouseMove, { passive: true });
      window.addEventListener('mouseleave', this._onMouseLeave, { passive: true });
      window.addEventListener('click', this._onClick, { passive: true });
    }

    destroy() {
      this.stop();
      window.removeEventListener('resize', this._onResize);
      window.removeEventListener('mousemove', this._onMouseMove);
      window.removeEventListener('mouseleave', this._onMouseLeave);
      window.removeEventListener('click', this._onClick);
    }

    start() {
      if (this._running) return;
      this._running = true;
      this._last = performance.now();
      this._rafId = requestAnimationFrame(this._tick);
    }

    stop() {
      this._running = false;
      if (this._rafId) cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }

    // --- Internal: sizing and particles ---

    _onResize() {
      const cssW = this.canvas.clientWidth || window.innerWidth;
      const cssH = this.canvas.clientHeight || window.innerHeight;

      this.w = cssW;
      this.h = cssH;

      // Scale canvas to DPR while keeping drawing units in CSS pixels
      this.canvas.width = Math.round(cssW * this.dpr);
      this.canvas.height = Math.round(cssH * this.dpr);
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

      // Adjust particle count smoothly
      this._adjustParticleCount(this._targetCount());
    }

    _targetCount() {
      const { density, minParticles, maxParticles } = this.opts;
      const area = Math.max(1, this.w * this.h);
      const estimate = Math.round(area / density);
      return clamp(estimate, minParticles, maxParticles);
    }

    _reseedParticles(n) {
      this.particles = [];
      for (let i = 0; i < n; i++) this.particles.push(this._makeParticle());
    }

    _adjustParticleCount(target) {
      const cur = this.particles.length;
      if (cur === target) return;
      if (cur < target) {
        const add = target - cur;
        for (let i = 0; i < add; i++) this.particles.push(this._makeParticle());
      } else {
        this.particles.length = target;
      }
    }

    _makeParticle() {
      const [rMin, rMax] = this.opts.dotRadius;
      const s = this.opts.speed;
      return {
        x: rand(0, this.w),
        y: rand(0, this.h),
        vx: rand(-s, s),
        vy: rand(-s, s),
        r: rand(rMin, rMax)
      };
    }

    // --- Input handlers ---

    _onMouseMove(e) {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
      this.mouse.inside = true;

      // Edge pings
      const m = 8;
      const now = performance.now();
      if (this.mouse.x <= m) this.edgePing = { side: 'L', t: now };
      else if (this.mouse.x >= this.w - m) this.edgePing = { side: 'R', t: now };
      else if (this.mouse.y <= m) this.edgePing = { side: 'T', t: now };
      else if (this.mouse.y >= this.h - m) this.edgePing = { side: 'B', t: now };
    }

    _onMouseLeave() {
      this.mouse.x = null;
      this.mouse.y = null;
      this.mouse.inside = false;
    }

    _onClick(e) {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const t = performance.now();
      this.clickFlash = { x, y, t };
      this.trails.push({ x, y, t });
    }

    // --- Loop ---

    _tick(now) {
      if (!this._running) return;

      const elapsed = now - this._last;
      if (this._frameInterval && elapsed < this._frameInterval) {
        this._rafId = requestAnimationFrame(this._tick);
        return;
      }
      this._last = now;

      this.update(elapsed);
      this.draw();

      this._rafId = requestAnimationFrame(this._tick);
    }

    // --- Simulation ---

    update(dtMs) {
      const dt = dtMs / 1000;            // seconds
      const frameScale = dt * 60;        // scale relative to 60fps
      const { drift, speed, wrap, repelRadius, repelForce } = this.opts;

      const mouseActive = this.mouse.inside && this.mouse.x !== null && this.mouse.y !== null;

      for (const p of this.particles) {
        // Random drift (small perturbation)
        p.vx += (Math.random() - 0.5) * drift * frameScale;
        p.vy += (Math.random() - 0.5) * drift * frameScale;

        // Mouse repel
        if (mouseActive) {
          const dx = p.x - this.mouse.x;
          const dy = p.y - this.mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 0 && dist < repelRadius) {
            const strength = repelForce * (1 - dist / repelRadius) * frameScale;
            p.vx += (dx / dist) * strength;
            p.vy += (dy / dist) * strength;
          }
        }

        // Limit speed
        const vmag = Math.hypot(p.vx, p.vy);
        if (vmag > speed) {
          const scale = speed / (vmag || 1);
          p.vx *= scale;
          p.vy *= scale;
        }

        // Integrate
        p.x += p.vx * frameScale;
        p.y += p.vy * frameScale;

        // Bounds
        if (wrap) {
          if (p.x < -2) p.x = this.w + 2;
          else if (p.x > this.w + 2) p.x = -2;
          if (p.y < -2) p.y = this.h + 2;
          else if (p.y > this.h + 2) p.y = -2;
        } else {
          if (p.x < 0) { p.x = 0; p.vx *= -1; }
          if (p.x > this.w) { p.x = this.w; p.vx *= -1; }
          if (p.y < 0) { p.y = 0; p.vy *= -1; }
          if (p.y > this.h) { p.y = this.h; p.vy *= -1; }
        }
      }
    }

    // --- Rendering ---

    draw() {
      const { ctx, particles, opts, mouse } = this;

      // Clear frame
      ctx.clearRect(0, 0, this.w, this.h);

      // Particles
      ctx.fillStyle = opts.dotColor;
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Lines between particles
      ctx.strokeStyle = opts.lineColor;
      ctx.lineWidth = opts.lineWidth;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < opts.lineMaxDistance) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Hover links to mouse
      if (mouse.x !== null && opts.hoverLinkDistance) {
        for (const p of particles) {
          const dx = p.x - mouse.x, dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < opts.hoverLinkDistance) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      // Click flash
      if (this.clickFlash && performance.now() - this.clickFlash.t < 340) {
        const alpha = 1 - (performance.now() - this.clickFlash.t) / 340;
        ctx.beginPath();
        ctx.arc(this.clickFlash.x, this.clickFlash.y, 48 * alpha, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.12 * alpha})`;
        ctx.fill();
      }

      // Edge ping
      if (this.edgePing && performance.now() - this.edgePing.t < 800) {
        const alpha = 1 - (performance.now() - this.edgePing.t) / 800;
        const s = this.edgePing.side;
        ctx.fillStyle = `rgba(255,255,255,${0.08 * alpha})`;
        if (s === 'L') ctx.fillRect(0, 0, 8, this.h);
        else if (s === 'R') ctx.fillRect(this.w - 8, 0, 8, this.h);
        else if (s === 'T') ctx.fillRect(0, 0, this.w, 8);
        else if (s === 'B') ctx.fillRect(0, this.h - 8, this.w, 8);
      }

      // Trail pulses
      const now = performance.now();
      this.trails = this.trails.filter(t => now - t.t < 600);
      for (const t of this.trails) {
        const age = now - t.t;
        const alpha = 1 - age / 600;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 4 + alpha * 6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.05 * alpha})`;
        ctx.fill();
      }
    }
  }

  window.Constellation = Constellation;
})();
