(function () {
  const drawFrame = (ctx, state) => {
    const { particles: pr, theme: th, render: rd } = state.cfg;
    ctx.globalAlpha = 1;
    ctx.fillStyle = th.background;
    ctx.fillRect(0, 0, state.w, state.h);

    ctx.lineCap = rd.capStyle;
    ctx.lineJoin = rd.capStyle;

    for (const p of state.particles) {
      // Draw exit trail if enabled and particle has exited
      if (pr.enableTrails && p.trail.length > 1) {
        ctx.strokeStyle = th.accent;
        ctx.lineWidth = pr.linkWidth;
        ctx.globalAlpha = pr.trailAlpha;
        ctx.beginPath();
        for (let i = 0; i < p.trail.length - 1; i++) {
          const pt1 = p.trail[i];
          const pt2 = p.trail[i + 1];
          ctx.moveTo(pt1.x, pt1.y);
          ctx.lineTo(pt2.x, pt2.y);
        }
        ctx.stroke();
      }

      // Draw the particle
      ctx.globalAlpha = rd.dotAlpha;
      ctx.fillStyle = th.accent;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1; // Reset alpha
  };

  window.Renderer = {
    drawFrame
  };
})();
