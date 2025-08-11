/*! Constellation background (no dependencies) */
(function () {
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  class Constellation {
    constructor(canvas, opts = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d', { alpha: true });
      this.dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

      // Options with sane defaults
      this.opts = Object.assign({
        // Visuals
        dotColor: '#8fb3ff',
        lineColor: '#6aa7ff',
        backgroundAlpha: 0.0, // no fill to keep CSS bg visible
        dotRadius: [1.0, 2.0], // [min, max] in CSS pixels
        lineWidth: 1.0,
        lineMaxDistance: 140, // CSS px
        // Motion
        speed: 0.35,          // px/frame at 60fps
        drift: 0.12,          // random jitter added to velocity
        // Density
        density: 18000,       // 1 particle per N px^2
        minParticles: 60,
        maxParticles: 220,
        // Interaction
        hoverLinkDistance: 180,
        repelRadius: 90,
        repelForce: 0.012,
        // Behavior
        wrap: true,           // wrap around edges
        fpsCap: 60
      }, opts);

      // Internal state
      this.particles = [];
      this.mouse = { x: null, y: null, active: false };
      this.running = false;
      this.lastFrame = 0;
      this.frameInterval = 1000 / this.opts.fpsCap;

      // Bindings
      this._onResize = this.resize.bind(this);
      this._onMouseMove = this.mouseMove.bind(this);
      this._onMouseLeave = this.mouseLeave.bind(this);
      this._onClick = this.mouseClick.bind(this);

      // Init
      this.resize();
      this.attach();
      this.start();
    }

    attach() {
      window.addEventListener('resize', this._onResize, { passive: true });
      window.addEventListener('mousemove', this._onMouseMove, { passive: true });
      window.addEventListener('mouseleave', this._onMouseLeave, { passive: true });
      window.addEventListener('click', this._onClick, { passive: true });
    }

    detach() {
      window.removeEventListener('resize', this._onResize);
      window.removeEventListener('mousemove', this._onMouseMove);
      window.removeEventListener('mouseleave', this._onMouseLeave);
      window.removeEventListener('click', this._onClick);
    }

    resize() {
      const { canvas, dpr } = this;
      const cssW = canvas.clientWidth || window.innerWidth;
      const cssH = canvas.clientHeight || window.innerHeight;

      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // draw in CSS pixels

      // Recompute particle count based on area
      const area = cssW * cssH;
      const targetCount = clamp(
        Math.round(area / this.opts.density),
        this.opts.minParticles,
        this.opts.maxParticles
      );

      // Grow/shrink pool
      const diff = targetCount - this.particles.length;
      if (diff > 0) this._addParticles(diff, cssW, cssH);
      else if (diff < 0) this.particles.splice(targetCount);

      // Keep inside bounds after resize
      for (const p of this.particles) {
        p.x = clamp(p.x, 0, cssW);
        p.y = clamp(p.y, 0, cssH);
      }
    }

    _addParticles(n, w, h) {
      for (let i = 0; i < n; i++) {
        this.particles.push(this._makeParticle(w, h));
      }
    }

    _makeParticle(w, h) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 0.7 + 0.3) * this.opts.speed;
      const r = this.opts.dotRadius[0] + Math.random() * (this.opts.dotRadius[1] - this.opts.dotRadius[0]);

      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r
      };
    }

    mouseMove(e) {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.mouse.active = true;
    }

    mouseLeave() {
      this.mouse.active = false;
      this.mouse.x = null;
      this.mouse.y = null;
    }

    mouseClick() {
      // Briefly inject a small burst near cursor
      if (!this.mouse.active) return;
      for (let i = 0; i < 6; i++) {
        const p = this._makeParticle(this.canvas.clientWidth, this.canvas.clientHeight);
        p.x = this.mouse.x + (Math.random() - 0.5) * 30;
        p.y = this.mouse.y + (Math.random() - 0.5) * 30;
        this.particles.push(p);
        if (this.particles.length > this.opts.maxParticles) this.particles.shift();
      }
    }

    start() {
      if (!this.running) {
        this.running = true;
        this.lastFrame = performance.now();
        this._raf = requestAnimationFrame(this.tick.bind(this));
      }
    }

    stop() {
      this.running = false;
      cancelAnimationFrame(this._raf);
    }

    tick(now) {
      if (!this.running) return;
      const elapsed = now - this.lastFrame;

      if (elapsed >= this.frameInterval) {
        this.lastFrame = now - (elapsed % this.frameInterval);
        this.update();
        this.render();
      }

      this._raf = requestAnimationFrame(this.tick.bind(this));
    }

    update() {
      const w = this.canvas.clientWidth;
      const h = this.canvas.clientHeight;

      for (const p of this.particles) {
        // Mild random drift to avoid uniform motion
        p.vx += (Math.random() - 0.5) * this.opts.drift * 0.02;
        p.vy += (Math.random() - 0.5) * this.opts.drift * 0.02;

        // Mouse repel
        if (this.mouse.active) {
          const dx = p.x - this.mouse.x;
          const dy = p.y - this.mouse.y;
          const d2 = dx * dx + dy * dy;
          const rr = this.opts.repelRadius * this.opts.repelRadius;
          if (d2 < rr && d2 > 0.001) {
            const d = Math.sqrt(d2);
            const f = this.opts.repelForce * (1 - d / this.opts.repelRadius);
            p.vx += (dx / d) * f;
            p.vy += (dy / d) * f;
          }
        }

        // Integrate
        p.x += p.vx;
        p.y += p.vy;

        // Bounds
        if (this.opts.wrap) {
          if (p.x < -5) p.x = w + 5;
          if (p.x > w + 5) p.x = -5;
          if (p.y < -5) p.y = h + 5;
          if (p.y > h + 5) p.y = -5;
        } else {
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
          p.x = clamp(p.x, 0, w);
          p.y = clamp(p.y, 0, h);
        }
      }
    }

    render() {
      const ctx = this.ctx;
      const w = this.canvas.clientWidth;
      const h = this.canvas.clientHeight;

      // Clear
      if (this.opts.backgroundAlpha > 0) {
        ctx.globalAlpha = this.opts.backgroundAlpha;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, w, h);
      } else {
        ctx.clearRect(0, 0, w, h);
      }

      // Draw connections
      ctx.save();
      ctx.lineWidth = this.opts.lineWidth;
      ctx.strokeStyle = this.opts.lineColor;

      const maxDist = this.opts.lineMaxDistance;
      const md = this.mouse.active ? this.opts.hoverLinkDistance : 0;

      for (let i = 0; i < this.particles.length; i++) {
        const a = this.particles[i];

        // Dot
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = this.opts.dotColor;
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fill();

        // Lines to neighbors
        for (let j = i + 1; j < this.particles.length; j++) {
          const b = this.particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);

          let effective = maxDist;
          // Extend link reach near the mouse for a subtle highlight
          if (md && this.mouse.active) {
            const cmx = (a.x + b.x) * 0.5 - this.mouse.x;
            const cmy = (a.y + b.y) * 0.5 - this.mouse.y;
            const centerDist = Math.hypot(cmx, cmy);
            if (centerDist < md) effective = maxDist * 1.25;
          }

          if (dist < effective) {
            const alpha = 1 - dist / effective;
            ctx.globalAlpha = alpha * 0.7;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      ctx.restore();
    }
  }

  // Expose globally
  window.Constellation = Constellation;
})();
