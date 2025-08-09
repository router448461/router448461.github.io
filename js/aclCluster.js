import { ACLParticle } from './aclParticle.js';

export class ACLCluster {
  constructor(name, W, H, cfg) {
    this.name = name;
    this.cfg = cfg;

    this.W = W;
    this.H = H;

    this.center = this.computeCenter(W, H, cfg.region);

    // Particles
    this.particles = Array.from({ length: cfg.particleCount }, () =>
      new ACLParticle(W, H, cfg, this.center)
    );

    // Heartbeat scheduling
    this.nextBeatAt = this.scheduleNextBeat();
  }

  computeCenter(W, H, region) {
    const minDim = Math.min(W, H);
    return {
      cx: region.cx * W,
      cy: region.cy * H,
      r: Math.max(10, region.r * minDim)
    };
  }

  onResize(W, H) {
    this.W = W; this.H = H;
    this.center = this.computeCenter(W, H, this.cfg.region);
    this.particles.forEach(p => p.setCenter(this.center));
  }

  scheduleNextBeat() {
    const [min, max] = this.cfg.behavior.heartbeatMs;
    return performance.now() + (min + Math.random() * (max - min));
  }

  heartbeat() {
    // Ping activity on a few nodes
    const k = Math.max(1, Math.round(this.particles.length * 0.08));
    for (let i = 0; i < k; i++) {
      const idx = (Math.random() * this.particles.length) | 0;
      this.particles[idx].pingActivity();
    }

    // Occasional quarantine in noisier zones
    const qp = this.cfg.behavior.quarantineProb || 0;
    if (qp > 0 && Math.random() < qp) {
      const idx = (Math.random() * this.particles.length) | 0;
      this.particles[idx].quarantineFor(6000 + Math.random() * 6000);
    }
  }

  update() {
    const now = performance.now();
    if (now >= this.nextBeatAt) {
      this.heartbeat();
      this.nextBeatAt = this.scheduleNextBeat();
    }

    this.particles.forEach(p => p.update());
  }

  draw(ctx) {
    this.particles.forEach(p => p.draw(ctx));
  }

  drawLabel(ctx) {
    // Minimal, disciplined label near cluster center
    ctx.fillStyle = 'rgba(255, 255, 255, 0.60)';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(this.cfg.label, this.center.cx, this.center.cy - this.center.r - 8);
  }
}
