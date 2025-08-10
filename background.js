"use strict";

/*
  Hardened canvas boot:
  - Waits for DOM if needed (even with defer, we guard)
  - Verifies element and context exist
  - DPR-aware sizing with crisp grid rendering
  - No animations unless requested; only redraws on resize
*/

(function bootstrap() {
  const CANVAS_ID = "bg";
  const GRID_STEP = 48; // logical CSS pixels between grid lines
  const LINE_WIDTH = 1; // device-space line width after DPR scaling
  const PALETTE = {
    bg: "#0a0a0a",
    primary: "#ff2a2a",
    secondary: "#a81818",
  };

  let canvas = null;
  let ctx = null;
  let rafResizeToken = 0;

  function byId(id) {
    return document.getElementById(id);
  }

  function getDPR() {
    return Math.max(1, Math.min(3, window.devicePixelRatio || 1));
  }

  function sizeCanvasToViewport() {
    // Use CSS size as authoritative, then scale backing store by DPR
    const dpr = getDPR();

    // Ensure CSS sizing is applied
    const rect = canvas.getBoundingClientRect();
    const cssW = Math.max(1, Math.floor(rect.width));
    const cssH = Math.max(1, Math.floor(rect.height));

    // Backing store dimensions
    const targetW = Math.max(1, Math.round(cssW * dpr));
    const targetH = Math.max(1, Math.round(cssH * dpr));

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    // Normalize drawing coordinates so 1 unit = 1 CSS pixel
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function clear() {
    // Clear using CSS pixel space
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = PALETTE.bg;
    ctx.fillRect(0, 0, rect.width, rect.height);
  }

  function drawGrid() {
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    clear();

    // Crisp lines: offset by 0.5 CSS pixel for odd-width strokes
    ctx.lineWidth = LINE_WIDTH;
    ctx.strokeStyle = PALETTE.secondary;

    // Secondary grid
    ctx.beginPath();
    for (let x = 0.5; x <= w; x += GRID_STEP) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = 0.5; y <= h; y += GRID_STEP) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();

    // Primary grid every N steps
    ctx.strokeStyle = PALETTE.primary;
    ctx.beginPath();
    const major = GRID_STEP * 4;
    for (let x = 0.5; x <= w; x += major) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = 0.5; y <= h; y += major) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();
  }

  function redraw() {
    sizeCanvasToViewport();
    drawGrid();
  }

  function onResize() {
    // rAF collapses bursty resize events into a single redraw
    if (rafResizeToken) return;
    rafResizeToken = requestAnimationFrame(() => {
      rafResizeToken = 0;
      redraw();
    });
  }

  function init() {
    canvas = byId(CANVAS_ID);
    if (!canvas) {
      console.error(`[tactical-grid] Canvas element #${CANVAS_ID} not found.`);
      return;
    }

    // Opaque canvas improves perf and matches solid background
    ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) {
      console.error("[tactical-grid] 2D context unavailable.");
      return;
    }

    // Initial draw and listeners
    redraw();
    window.addEventListener("resize", onResize, { passive: true });

    // Optional: react to DPR changes (e.g., moving between monitors)
    // Not all browsers support this, so feature-detect
    if (window.matchMedia) {
      try {
        const mq = window.matchMedia(`(resolution: ${getDPR()}dppx)`);
        // Rebind on change to capture DPR updates
        mq.addEventListener?.("change", redraw);
        mq.addListener?.(redraw); // legacy Safari
      } catch {
        /* no-op */
      }
    }
  }

  // Even with defer, guard for safety in diverse pipelines (optimizers/CDNs)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
