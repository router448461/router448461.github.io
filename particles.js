(function () {
  function hashStr(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function makeRNG(seedStr) {
    let a = hashStr(String(seedStr || 'SEED')) || 1;
    return function rng() {
      a ^= a << 13; a >>>= 0;
      a ^= a >>> 17; a >>>= 0;
      a ^= a << 5;  a >>>= 0;
      return (a >>> 0) / 4294967296;
    };
  }

  let rng = Math.random;
  function setRNG(nextRng) {
    rng = typeof nextRng === 'function' ? nextRng : Math.random;
  }

  const rand = (min, max) => min + rng() * (max - min);

  class Particle {
    constructor(x, y, vx, vy, r, phase, cfg) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.r = r;
      this.phase = phase;
      this.cfg = cfg;
      this.trail = [];
      this.exiting = false;
    }

    bounceTweak() {
      const { bounceAngleJitter, bounceSpeedJitter } = this.cfg;
      const angJ = (rng() * 2 - 1) * bounceAngleJitter;
      const cos = Math.cos(angJ), sin = Math.sin(angJ);
      const vx = this.vx * cos - this.vy * sin;
      const vy = this.vx * sin + this.vy * cos;
      const spJ = 1 + (rng() * 2 - 1) * bounceSpeedJitter;
      this.vx = vx * spJ;
      this.vy = vy * spJ;
    }

    step(w, h, margin, cfg) {
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > cfg.exitThreshold) {
        this.exiting = true;
      }

      this.trail.unshift({ x: this.x, y: this.y });
      if (this.trail.length > cfg.trailLength) this.trail.length = cfg.trailLength;

      if (!this.exiting) {
        this.vx += (rng() - 0.5) * cfg.jitter + cfg.velocityRamp;
        this.vy += (rng() - 0.5) * cfg.jitter + cfg.velocityRamp;

        this.x += this.vx;
        this.y += this.vy;

        if (this.x < margin || this.x > w - margin || this.y < margin || this.y > h - margin) {
          this.exiting = true;
        }

        this.phase += 0.01;
        if (this.phase > Math.PI * 2) this.phase -= Math.PI * 2;
      } else {
        this.x += this.vx;
        this.y += this.vy;
      }
    }
  }

  function computeCounts(area, densityPer100k) {
    return Math.max(24, Math.round((area / 100000) * densityPer100k));
  }

  function spawnParticles(count, w, h, margin, prCfg, dpr, spawnCfg) {
    const pts = [];
    const [sMin, sMax] = prCfg.sizeRange.map(v => v * dpr);
    const [vMin, vMax] = prCfg.speedRange.map(v => v * dpr);

    const mode = (spawnCfg && spawnCfg.mode) || 'random';
    const minDim = Math.min(w, h);
    const cx = (spawnCfg?.origin?.xPct ?? 0.5) * w;
    const cy = (spawnCfg?.origin?.yPct ?? 0.5) * h;
    const rSpawn = Math.max(1, (spawnCfg?.radiusPct ?? 0.02) * minDim);

    for (let i = 0; i < count; i++) {
      let x, y;
      if (mode === 'burst') {
        const t = rand(0, Math.PI * 2);
        const r = Math.sqrt(rand(0, 1)) * rSpawn;
        x = cx + Math.cos(t) * r;
        y = cy + Math.sin(t) * r;
      } else {
        x = rand(margin, w - margin);
        y = rand(margin, h - margin);
      }

      const angle = rand(0, Math.PI * 2);
      const speed = rand(vMin, vMax);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      const rDot = rand(sMin, sMax);
      const phase = rand(0, Math.PI * 2);

      pts.push(new Particle(x, y, vx, vy, rDot, phase, prCfg));
    }
    return pts;
  }

  window.Particles = {
    makeRNG,
    setRNG,
    computeCounts,
    spawnParticles
  };
})();
