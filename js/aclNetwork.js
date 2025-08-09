// ...existing imports
import { config } from './config.js';
import { ACLCluster } from './aclCluster.js';

export class ACLNetwork {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.W = canvas.width;
    this.H = canvas.height;
    this.clusters = {};
  }

  resize(width, height) {
    this.W = this.canvas.width = width;
    this.H = this.canvas.height = height;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.clusters = {};

    for (const [name, cfg] of Object.entries(config.clusters)) {
      this.clusters[name] = new ACLCluster(name, this.W, this.H, cfg);
    }

    // Simulate posture: elevate random particles at load
    Object.values(this.clusters).forEach(cluster => {
      for (let i = 0; i < 2; i++) {
        cluster.particles[i]?.pingActivity?.();
      }
    });
  }

  updateAndDraw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);

    // Draw ACL topology preview
    for (const [name, cluster] of Object.entries(this.clusters)) {
      const ruleAllowed = config.allowMatrix[name];
      ctx.strokeStyle = ruleAllowed.length ? 'rgba(255,255,255,0.1)' : 'rgba(255,0,0,0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(this.W * 0.05, this.H * 0.05 + Object.keys(this.clusters).indexOf(name) * 60, this.W * 0.9, 50);
    }

    // Update/draw particles
    Object.values(this.clusters).forEach(cluster => {
      cluster.update();
      cluster.draw(ctx);
    });

    // Link logic
    const distance = config.maxLinkDistance;
    const lineWidth = config.lineThickness;

    for (const [fromName, allowed] of Object.entries(config.allowMatrix)) {
      const fromCluster = this.clusters[fromName];
      if (!fromCluster) continue;

      for (const toName of allowed) {
        const toCluster = this.clusters[toName];
        if (!toCluster) continue;

        for (const a of fromCluster.particles) {
          for (const b of toCluster.particles) {
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < distance && a.state !== 'quarantine' && b.state !== 'quarantine') {
              ctx.strokeStyle = fromCluster.linkColor;
              ctx.lineWidth = lineWidth;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }
      }
    }

    // Draw labels
    Object.values(this.clusters).forEach(c => c.drawLabel(ctx));
  }
}
