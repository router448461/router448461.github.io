(function () {
  function hexToRGBA(hex, alpha = 1) {
    const h = hex.replace('#', '');
    const bigint = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function drawFrame(ctx, state) {
    const { w, h, dpr, cfg, particles } = state;
    const prCfg = cfg.particles;
    const rdCfg = cfg.render;
    const theme = cfg.theme;

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.globalCompositeOperation = rdCfg.composite;
    if (rdCfg.roundCaps) {
      ctx.lineCap = rdCfg.capStyle;
      ctx.lineJoin = rdCfg.capStyle;
    }

    const linkDist = prCfg.linkDistance * dpr;
    const lineColor = hexToRGBA(theme.accent, rdCfg.lineAlpha);

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = prCfg.linkWidth * dpr;

    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 <= linkDist * linkDist) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const flicker = prCfg.enableFlicker
        ? (1 - prCfg.flickerDepth) + Math.sin(p.phase) * prCfg.flickerDepth
        : 1;

      ctx.beginPath();
      ctx.fillStyle = hexToRGBA(theme.accent, Math.min(1, rdCfg.dotAlpha * flicker));
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  window.Renderer = {
    drawFrame
  };
})();
