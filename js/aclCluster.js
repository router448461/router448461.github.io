import { ACLParticle } from './aclParticle.js';

export class ACLCluster {
  constructor(name, W, H, cfg) {
    this.name = name;
    this.cfg = cfg;

    this.center = this.computeCenter(W, H, cfg.region);

    this.particles = Array.from({ length: cfg.particleCount }, () =>
      new ACLParticle(W, H, cfg, this.center)
    );
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
    this.center = this.computeCenter(W, H, this.cfg.region);
    this.particles.forEach(p => p.setCenter(this.center));
  }

  update() {
    this.particles.forEach(p => p.update());
  }

  draw(ctx) {
    this.particles.forEach(p => p.draw(ctx));
  }

  drawLabel(ctx) {
    ctx.fillStyle = 'rgba(255,255,255,0.60)';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(this.cfg.label, this.center.cx, this.center.cy - this.center.r - 8);
  }
}
