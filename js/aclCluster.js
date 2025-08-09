import { ACLParticle } from './aclParticle.js';

export class ACLCluster {
  constructor(name, W, H, cfg) {
    this.name = name;
    this.label = cfg.label;
    this.color = cfg.color;
    this.linkColor = cfg.linkColor;
    this.particles = Array.from({ length: cfg.particleCount }, () => new ACLParticle(W, H, cfg.color));
  }

  update() {
    this.particles.forEach(p => p.update());
  }

  draw(ctx) {
    this.particles.forEach(p => p.draw(ctx));
  }

  drawLabel(ctx) {
    const centroid = this.particles[0];
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '12px monospace';
    ctx.fillText(this.label, centroid.x - 30, centroid.y - 10);
  }
}
