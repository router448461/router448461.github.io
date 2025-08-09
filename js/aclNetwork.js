import { config } from './config.js';
import { ACLCluster } from './aclCluster.js';

export class ACLNetwork {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.W = 0;
    this.H = 0;
    this.dpr = config.pixelRatio;

    this.clusters = {};
    this.allowMatrix = JSON.parse(JSON.stringify(config.allowMatrix));

    this.nextAclShiftAt = 0;
  }

  resize(width, height) {
    this.W = Math.max(1, Math.floor(width));
    this.H = Math.max(1, Math.floor(height));

    // DPR-correct backbuffer
    this.canvas.width = Math.floor(this.W * this.dpr);
    this.canvas.height = Math.floor(this.H * this.dpr);
    this.canvas.style.width = `${this.W}px`;
    this.canvas.style.height = `${this.H}px`;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    // Rebuild clusters
    this.clusters = {};
    for (const [name, cfg] of Object.entries(config.clusters)) {
      this.clusters[name] = new ACLCluster(name, this.W, this.H, cfg);
    }

    // Schedule ACL shift (optional)
    if (config.autonomy.dynamicACL) {
      this.nextAclShiftAt = performance.now() + config.autonomy.aclShiftMs;
    }
  }

  maybeRotateACL() {
    if (!config.autonomy.dynamicACL) return;
    const now = performance.now();
    if (now < this.nextAclShiftAt) return;

    // Simple rotation: toggle weapon3 <-> weapon2 link occasionally
    const enable = Math.random() < 0.5;
    this.allowMatrix.weapon3 = enable ? ['weapon2'] : [];
    this.nextAclShiftAt = now + config.autonomy.aclShiftMs;
  }

  updateAndDraw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);

    // Update clusters
    for (const c of Object.values(this.clusters)) c.update();

    // Draw links based on current allow matrix
    const maxDist = config.maxLinkDistance;
    ctx.lineWidth = config.lineThickness;

    for (const [fromName, toList] of Object.entries(this.allowMatrix)) {
      const from = this.clusters[fromName];
      if (!from) continue;

      for (const toName of toList) {
        const to = this.clusters[toName];
        if (!to) continue;

        const aArr = from.particles;
        const bArr = to.particles;

        // Pairwise scan (kept lean by distance threshold)
        for (let i = 0; i < aArr.length; i++) {
          const a = aArr[i];
          for (let j = 0; j < bArr.length; j++) {
            const b = bArr[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const d = Math.hypot(dx, dy);
            if (d >= maxDist) continue;

            // Elevated endpoints brighten the link
            const active = (a.state === 'elevated' || b.state === 'elevated');
            ctx.strokeStyle = active ? from.cfg.linkColorActive : from.cfg.linkColor;

            // Quarantined endpoints do not link
            if (a.state === 'quarantine' || b.state === 'quarantine') continue;

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
    }

    // Draw particles and labels last (on top of links)
    for (const c of Object.values(this.clusters)) {
      c.draw(ctx);
      c.drawLabel(ctx);
    }

    // Optional autonomous ACL rotation
    this.maybeRotateACL();
  }
}
