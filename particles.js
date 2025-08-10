(function () {
  const rand = (min, max) => min + Math.random() * (max - min);

  class Particle {
    constructor(x, y, vx, vy, r, phase) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.r = r;
      this.phase = phase;
    }
    step(w, h, margin, cfg) {
      this.x += this.vx;
      this.y += this.vy;
      this.vx += (Math.random() - 0.5) * cfg.jitter;
      this.vy += (Math.random() - 0.5) * cfg.jitter;

      if (this.x < margin) { this.x = margin; this.vx = Math.abs(this.vx); }
      if (this.x > w - margin) { this.x = w - margin; this.vx = -Math.abs(this.vx); }
      if (this.y < margin) { this.y = margin; this.vy = Math.abs(this.vy); }
      if (this.y > h - margin) { this.y = h - margin; this.vy = -Math.abs(this.vy); }

      this.phase += 0.01;
      if (this.phase > Math.PI * 2) this.phase -= Math.PI * 2;
    }
  }

  function computeCounts(area, densityPer100k) {
    return Math.max(24, Math.round((area / 100000) * densityPer100k));
  }

  function spawnParticles(count, w, h, margin, cfg, dpr) {
    const pts = [];
    const [sMin, sMax] = cfg.sizeRange.map(v => v * dpr);
    const [vMin, vMax] = cfg.speedRange.map(v => v * dpr);

    for (let i = 0; i < count; i++) {
      const x = rand(margin, w - margin);
      const y = rand(margin, h - margin);
      const angle = rand(0, Math.PI * 2);
      const speed = rand(vMin, vMax);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const r = rand(sMin, sMax);
      const phase = rand(0, Math.PI * 2);
      pts.push(new Particle(x, y, vx, vy, r, phase));
    }
    return pts;
  }

  window.Particles = {
    Particle,
    computeCounts,
    spawnParticles
  };
})();
