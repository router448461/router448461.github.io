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
  }

  resize(width, height) {
    this.W = Math.floor(width);
    this.H = Math.floor(height);

    this.canvas.width = Math.floor(this.W * this.dpr);
    this.canvas.height = Math.floor(this.H * this.dpr);
    this.canvas.style.width = `${this.W}px`;
    this.canvas.style.height = `${this.H}px`;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    this.clusters = {};
    for (const [name, cfg] of Object.entries(config.clusters)) {
      this.clusters[name] = new ACLCluster(name, this.W, this.H, cfg);
    }
  }

  updateAndDraw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);

    for (const c of Object.values(this.clusters)) c.update();

    ctx.lineWidth = config.lineThickness;

    for (const [fromName, toList] of Object.entries(this.allowMatrix)) {
      const from = this.clusters[fromName];
      if (!from) continue;

      for (const toName of toList) {
        const to = this.clusters[toName];
        if (!to) continue;

        const aArr = from.particles;
        const bArr = to.particles;

        for (let i = 0; i < aArr.length; i++) {
          const a = aArr[i];
          for (let j = 0; j < bArr.length; j++) {
            const b = bArr[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const d = Math.hypot(dx, dy);
            if (d >= config.maxLinkDistance) continue;

            ctx.strokeStyle = from.cfg.linkColor;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
    }

    for (const c of Object.values(this.clusters)) {
      c.draw(ctx);
      c.drawLabel(ctx);
    }
  }
}
