this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    draw() {
      const { ctx, particles, opts, mouse } = this;

      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = opts.dotColor;
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < opts.lineMaxDistance) {
            ctx.strokeStyle = opts.lineColor;
            ctx.lineWidth = opts.lineWidth;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      if (mouse.x !== null && opts.hoverLinkDistance) {
        for (const p of particles) {
          const dx = p.x - mouse.x, dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < opts.hoverLinkDistance) {
            ctx.strokeStyle = opts.lineColor;
            ctx.lineWidth = opts.lineWidth;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      if (this.clickFlash && performance.now() - this.clickFlash.t < 340) {
        const alpha = 1 - (performance.now() - this.clickFlash.t) / 340;
        ctx.beginPath();
        ctx.arc(this.clickFlash.x, this.clickFlash.y, 48 * alpha, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.12 * alpha})`;
        ctx.fill();
      }

      if (this.edgePing && performance.now() - this.edgePing.t < 800) {
        const alpha = 1 - (performance.now() - this.edgePing.t) / 800;
        const s = this.edgePing.side;
        ctx.fillStyle = `rgba(255,255,255,${0.08 * alpha})`;
        if (s === 'L') ctx.fillRect(0, 0, 8, this.canvas.height);
        else if (s === 'R') ctx.fillRect(this.canvas.width - 8, 0, 8, this.canvas.height);
        else if (s === 'T') ctx.fillRect(0, 0, this.canvas.width, 8);
        else if (s === 'B') ctx.fillRect(0, this.canvas.height - 8, this.canvas.width, 8);
      }

      const now = performance.now();
      this.trails = this.trails.filter(t => now - t.t < 600);
      for (const t of this.trails) {
        const age = now - t.t;
        const alpha = 1 - age / 600;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 4 + alpha * 6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.05 * alpha})`;
        ctx.fill();
      }
    }
  }

  window.Constellation = Constellation;
})();
