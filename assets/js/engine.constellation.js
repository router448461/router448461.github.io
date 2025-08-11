class Constellation {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.opts = Object.assign({
      dotColor: '#ffffff',
      lineColor: '#ffffff',
      dotRadius: [1, 2],
      lineWidth: 1,
      lineMaxDistance: 100,
      density: 18000,
      minParticles: 60,
      maxParticles: 200,
      speed: 0.3,
      drift: 0.1,
      repelRadius: 80,
      repelForce: 0.01,
      hoverLinkDistance: 160,
      wrap: true,
      fpsCap: 60
    }, opts);

    this.particles = [];
    this.mouse = { x: null, y: null };
    this.running = false;
    this.lastFrame = 0;

    this.resize();
    window.addEventListener('resize', () => this.resize());
    canvas.addEventListener('mousemove', e => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
    canvas.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });

    this.initParticles();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.particleCount = Math.min(this.opts.maxParticles, Math.max(this.opts.minParticles, Math.floor((this.canvas.width * this.canvas.height) / this.opts.density)));
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push(this.makeParticle());
    }
  }

  makeParticle() {
    return {
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      vx: (Math.random() - 0.5) * this.opts.speed,
      vy: (Math.random() - 0.5) * this.opts.speed,
      r: Math.random() * (this.opts.dotRadius[1] - this.opts.dotRadius[0]) + this.opts.dotRadius[0]
    };
  }

  start() {
    if (!this.running) {
      this.running = true;
      this.lastFrame = performance.now();
      requestAnimationFrame(this.frame.bind(this));
    }
  }

  stop() {
    this.running = false;
  }

  frame(now) {
    if (!this.running) return;

    const delta = now - this.lastFrame;
    if (delta < 1000 / this.opts.fpsCap) {
      requestAnimationFrame(this.frame.bind(this));
      return;
    }

    this.lastFrame = now;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.update();
    this.draw();
    requestAnimationFrame(this.frame.bind(this));
  }

  update() {
    for (const p of this.particles) {
      p.x += p.vx + (Math.random() - 0.5) * this.opts.drift;
      p.y += p.vy + (Math.random() - 0.5) * this.opts.drift;

      if (this.opts.wrap) {
        p.x = (p.x + this.canvas.width) % this.canvas.width;
        p.y = (p.y + this.canvas.height) % this.canvas.height;
      } else {
        if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;
      }
    }
  }

  draw() {
    const { ctx, particles, opts } = this;

    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = opts.dotColor;
      ctx.fill();
    }

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < opts.lineMaxDistance) {
          ctx.beginPath();
          ctx.strokeStyle = opts.lineColor;
          ctx.lineWidth = opts.lineWidth;
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }

      if (this.mouse.x !== null && this.mouse.y !== null) {
        const p = particles[i];
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < opts.repelRadius) {
          p.vx += dx * opts.repelForce;
          p.vy += dy * opts.repelForce;
        }
        if (dist < opts.hoverLinkDistance) {
          ctx.beginPath();
          ctx.strokeStyle = opts.lineColor;
          ctx.lineWidth = opts.lineWidth;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(this.mouse.x, this.mouse.y);
          ctx.stroke();
        }
      }
    }
  }
}
