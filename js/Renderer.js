// js/Renderer.js

export class Renderer {
  constructor(canvas, config, particles) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.config = config;
    this.particles = particles;
  }

  resize(width, height) {
    this.canvas.width  = width;
    this.canvas.height = height;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  draw(time) {
    const { ctx, config, particles } = this;

    // 1) draw faint connecting lines
    ctx.strokeStyle = 'rgba(0,255,0,0.05)';
    ctx.lineWidth = 0.5;
    const thresh = config.grid.connectThreshold;
    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dx = b.position.x - a.position.x;
        const dy = b.position.y - a.position.y;
        if (Math.hypot(dx, dy) < thresh) {
          ctx.beginPath();
          ctx.moveTo(a.position.x, a.position.y);
          ctx.lineTo(b.position.x, b.position.y);
          ctx.stroke();
        }
      }
    }

    // 2) draw pulsing nodes
    ctx.fillStyle = config.particle.color;
    const baseR = config.particle.radius;
    const amp   = config.particle.pulseAmplitude;
    const spd   = config.particle.pulseSpeed;
    for (const p of particles) {
      const phase = time * spd + p.pulseOffset;
      const r     = baseR + Math.sin(phase) * amp;
      ctx.beginPath();
      ctx.arc(p.position.x, p.position.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
