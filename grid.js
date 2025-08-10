(() => {
  'use strict';

  // CONFIG — tweak these to match the target exactly.
  const CFG = {
    spacingX: 40,          // px between vertical lines
    spacingY: 40,          // px between horizontal lines
    majorEveryX: 5,        // every Nth vertical line is "major"
    majorEveryY: 5,        // every Nth horizontal line is "major"

    // Colors/opacity (no glow, no blur)
    colorMinor: [255, 0, 0, 0.14], // rgba for minor lines
    colorMajor: [255, 0, 0, 0.28], // rgba for major lines

    lineWidthMinor: 1,     // CSS px, will render crisp via DPR scaling
    lineWidthMajor: 1,     // keep 1px for hard, surgical lines

    // Grid anchoring (prevents "swim" on resize)
    // - 'viewport': origin at (0,0) (top-left)
    // - 'center':   origin snaps to viewport center
    anchor: 'viewport',

    // Optional static offset (px) to match exact phase of the target
    // Positive shifts lines right/down.
    offsetX: 0,
    offsetY: 0,

    // Optional subtle drift (disabled to match “just grid lines”)
    driftEnabled: false,
    driftSpeedX: 2,   // px/s
    driftSpeedY: 0,   // px/s

    // Optional intersection dots (likely off for BYD)
    dotsEnabled: false,
    dotSize: 1,       // px
    dotAlpha: 0.22,

    // Optional vignette (kept off by default, BYD is typically clean)
    vignetteEnabled: false,
    vignetteAlpha: 0.25
  };

  const canvas = document.getElementById('grid');
  const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });

  let width = 0, height = 0, dpr = 1;
  let lastTs = 0;
  let driftX = 0, driftY = 0;

  const rgba = (arr) => `rgba(${arr[0]}, ${arr[1]}, ${arr[2]}, ${arr[3]})`;

  function resize() {
    dpr = Math.max(1, window.devicePixelRatio || 1);
    const cssW = Math.floor(window.innerWidth);
    const cssH = Math.floor(window.innerHeight);

    canvas.width = Math.max(1, Math.round(cssW * dpr));
    canvas.height = Math.max(1, Math.round(cssH * dpr));

    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    width = cssW;
    height = cssH;
  }

  function computeOrigin() {
    // Decide grid origin based on anchor
    let originX = 0;
    let originY = 0;
    if (CFG.anchor === 'center') {
      originX = Math.floor(width / 2);
      originY = Math.floor(height / 2);
    }
    // Apply manual offsets and any drift
    originX += CFG.offsetX + driftX;
    originY += CFG.offsetY + driftY;

    // Snap origin to line phase so the grid is deterministic
    const phaseX = originX % CFG.spacingX;
    const phaseY = originY % CFG.spacingY;

    return {
      startX: -phaseX,
      startY: -phaseY
    };
  }

  function drawGrid() {
    // Hard clear: pure black
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // ensure scale stays correct
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    const { startX, startY } = computeOrigin();

    // Precompute colors
    const minor = rgba(CFG.colorMinor);
    const major = rgba(CFG.colorMajor);

    // Vertical lines
    {
      ctx.lineWidth = CFG.lineWidthMinor;
      for (let x = startX, ix = 0; x <= width; x += CFG.spacingX, ix++) {
        const isMajor = CFG.majorEveryX > 0 && (ix % CFG.majorEveryX) === 0;
        ctx.strokeStyle = isMajor ? major : minor;
        // Pixel-crisp alignment: draw on half-pixel to hit device pixel
        const px = Math.round(x) + 0.5;
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, height);
        ctx.stroke();
      }
    }

    // Horizontal lines
    {
      ctx.lineWidth = CFG.lineWidthMinor;
      for (let y = startY, iy = 0; y <= height; y += CFG.spacingY, iy++) {
        const isMajor = CFG.majorEveryY > 0 && (iy % CFG.majorEveryY) === 0;
        ctx.strokeStyle = isMajor ? major : minor;
        const py = Math.round(y) + 0.5;
        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(width, py);
        ctx.stroke();
      }
    }

    // Intersection dots (optional)
    if (CFG.dotsEnabled) {
      const dotColor = `rgba(${CFG.colorMajor[0]}, ${CFG.colorMajor[1]}, ${CFG.colorMajor[2]}, ${CFG.dotAlpha})`;
      ctx.fillStyle = dotColor;
      const r = CFG.dotSize / 2;
      for (let x = startX; x <= width; x += CFG.spacingX) {
        for (let y = startY; y <= height; y += CFG.spacingY) {
          ctx.fillRect(Math.round(x) - r, Math.round(y) - r, CFG.dotSize, CFG.dotSize);
        }
      }
    }

    // Vignette (optional, off by default)
    if (CFG.vignetteEnabled) {
      const g = ctx.createRadialGradient(
        width / 2, height / 2, Math.min(width, height) * 0.2,
        width / 2, height / 2, Math.max(width, height) * 0.7
      );
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(1, `rgba(0,0,0,${CFG.vignetteAlpha})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);
    }
  }

  function tick(ts) {
    if (!lastTs) lastTs = ts;
    const dt = Math.max(0, (ts - lastTs) / 1000);
    lastTs = ts;

    if (CFG.driftEnabled) {
      driftX += CFG.driftSpeedX * dt;
      driftY += CFG.driftSpeedY * dt;
      // Keep drift bounded to avoid large numbers
      if (CFG.spacingX > 0) driftX %= CFG.spacingX;
      if (CFG.spacingY > 0) driftY %= CFG.spacingY;
    }

    drawGrid();
    requestAnimationFrame(tick);
  }

  // Wire up
  window.addEventListener('resize', () => {
    const prevPhaseX = (CFG.offsetX + driftX) % CFG.spacingX;
    const prevPhaseY = (CFG.offsetY + driftY) % CFG.spacingY;
    resize();
    // Maintain phase across resize to avoid a perceptual "jump"
    CFG.offsetX = prevPhaseX;
    CFG.offsetY = prevPhaseY;
  });

  // Initialize and start
  resize();
  requestAnimationFrame(tick);
})();
