(function () {
  class Constellation {
    constructor(canvas, opts = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');

      this.opts = Object.assign({
        dotColor: '#ffffff',
        lineColor: '#ffffff',
        dotRadius: [1.2, 2.4],
        lineWidth: 1.1,
        lineMaxDistance: 160,
        hoverLinkDistance: 200,
        density: 16000,       // pixels per particle (lower = more particles)
        minParticles: 80,
        maxParticles: 260,
        speed: 0.4,
        drift: 0.12,
        repelRadius: 110,
        repelForce: 0.013,
        wrap: true,
        fpsCap: 60
      }, opts);

      this.particles = [];
      this.mouse = { x: null, y: null };
      this.running = false;
      this.lastFrame = 0;

      // Bindings
      this._onResize = this.resize.bind(this);
      this._onMouseMove = this._mouseMove.bind(this);
      this._onMouseLeave = this._mouseLeave.bind(this);
      this._frame = this.frame.bind(this);

      // Setup
      this.resize();
      window.addEventListener('resize', this._onResize, { passive: true });
      canvas.addEventListener('mousemove', this._onMouseMove, { passive: true });
      canvas.addEventListener('mouseleave', this._onMouseLeave, { passive: true });

      this.initParticles();
    }

    // Handle devicePixelRatio for crisp rendering
    resize() {
      const rectW = window.innerWidth;
      const rectH = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      this.canvas.style.width = rectW + 'px';
      this.canvas.style.height = rectH + 'px';
      this.canvas.width = Math.max(1, Math.floor(rectW * dpr));
      this.canvas.height = Math.max(1, Math.floor(rectH * dpr));

      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cssPixels = rectW * rectH;
      const target = Math.floor(cssPixels / this.opts.density);
      this.particleCount = Math.min(this.opts.maxParticles, Math.max(this.opts.minParticles, target));

      // Re-initialize on resize for consistent density
      this.initParticles();
    }

    _mouseMove(e) {
      // Coordinates in CSS pixels (since we scale context)
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    }

    _mouseLeave() {
      this.mouse.x = null;
      this.mouse.y = null;
    }

    initParticles() {
      this.particles = [];
      for (let i = 0; i < this.particleCount; i++) {
        this.particles.push(this.makeParticle());
      }
    }

    makeParticle() {
      const angle = Math.random() * Math.PI * 2;
      const speed = this.opts.speed * (0.6 + Math.random() * 0.8);
      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: Math.random() * (this.opts.dotRadius[1] - this.opts.dotRadius[0]) + this.opts.dotRadius[0]
      };
    }

    start() {
      if (this.running) return;
      this.running = true;
      this.lastFrame = performance.now();
      requestAnimationFrame(this._frame);
    }

    stop() {
      this.running = false;
    }

    frame(now) {
      if (!this.running) return;

      const delta = now - this.lastFrame;
      const minDelta = 1000 / this.opts.fpsCap;
      if (delta < minDelta) {
        requestAnimationFrame(this._frame);
        return;
      }
      this.lastFrame = now;

      this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      this.update(delta);
      this.draw();
      requestAnimationFrame(this._frame);
    }

    update() {
      const W = window.innerWidth;
      const H = window.innerHeight;

      for (const p of this.particles) {
        p.x += p.vx + (Math.random() - 0.5) * this.opts.drift;
        p.y += p.vy + (Math.random() - 0.5) * this.opts.drift;

        if (this.opts.wrap) {
          if (p.x < 0) p.x += W; else if (p.x > W) p.x -= W;
          if (p.y < 0) p.y += H; else if (p.y > H) p.y -= H;
        } else {
          if (p.x < 0 || p.x > W) p.vx *= -1;
          if (p.y < 0 || p.y > H) p.vy *= -1;
        }

        // Mouse repel
        if (this.mouse.x !== null) {
          const dx = p.x - this.mouse.x;
          const dy = p.y - this.mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < this.opts.repelRadius && dist > 0.0001) {
            const force = (this.opts.repelRadius - dist) / this.opts.repelRadius * this.opts.repelForce;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }
      }
    }

    draw() {
      const { ctx, particles, opts } = this;

      // Draw dots
      ctx.fillStyle = opts.dotColor;
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw inter-particle lines
      ctx.strokeStyle = opts.lineColor;
      ctx.lineWidth = opts.lineWidth;

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.hypot(dx, dy);
          if (dist < opts.lineMaxDistance) {
            ctx.globalAlpha = 1 - (dist / opts.lineMaxDistance);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        // Mouse link
        if (this.mouse.x !== null) {
          const dx = p1.x - this.mouse.x;
          const dy = p1.y - this.mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < opts.hoverLinkDistance) {
            ctx.globalAlpha = 1 - (dist / opts.hoverLinkDistance);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(this.mouse.x, this.mouse.y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1.0; // reset
    }
  }

  // Expose globally
  window.Constellation = Constellation;
})();
