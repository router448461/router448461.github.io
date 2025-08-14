(() => {
  const engine = window.engine;
  const { util } = engine;

  const mod = (engine.modules.ui = {
    hover: false,
    center: { x: 0, y: 0 },
    radius: 0,
    clickBound: false,

    init() {
      const base = engine.modules.base;
      this.onResize(base.width, base.height, base.dpr);
      if (!this.clickBound) {
        window.addEventListener("click", (e) => {
          const rect = engine.state.canvas.getBoundingClientRect();
          const x = (e.clientX - rect.left) * base.dpr;
          const y = (e.clientY - rect.top) * base.dpr;
          const dx = x - this.center.x;
          const dy = y - this.center.y;
          if (dx*dx + dy*dy <= this.radius*this.radius) {
            // Placeholder: click handler for Earth symbol
            engine.modules.intel && engine.modules.intel.logEarthClick();
            engine.log("Earth symbol clicked (placeholder action).");
          }
        });
        this.clickBound = true;
      }
    },

    onResize(w, h) {
      this.center.x = w / 2;
      this.center.y = h / 2;
      this.radius = engine.config.earth.radius * (engine.modules.base?.dpr || 1);
    },

    draw(dt) {
      if (!this._inited) { this.init(); this._inited = true; }

      const ctx = engine.state.ctx;
      const { x, y } = this.center;
      const cfg = engine.config;
      const { r, g, b } = engine.util.hexToRgb(cfg.color);

      // Hover detection in current frame
      const mx = engine.state.mouse.x, my = engine.state.mouse.y;
      this.hover = (mx != null && my != null) && ((mx - x)**2 + (my - y)**2 <= this.radius*this.radius * 1.2);

      // Pulse for hover/idle
      const t = engine.state.time * 0.001 * cfg.earth.pulse.speed;
      const pulse = util.lerp(cfg.earth.pulse.min, cfg.earth.pulse.max, (Math.sin(t) + 1) * 0.5);
      const glow = this.hover ? Math.max(1.0, pulse + 0.25) : pulse;

      // Outer subtle ring
      ctx.save();
      ctx.beginPath();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = `rgba(${r},${g},${b},${0.35 * glow})`;
      ctx.shadowBlur = 10 * glow;
      ctx.shadowColor = `rgba(${r},${g},${b},0.6)`;
      ctx.arc(x, y, this.radius * 1.15, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Draw the ⏚ glyph centered
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = cfg.earth.font;
      ctx.fillStyle = `rgba(${r},${g},${b},${0.9})`;
      ctx.shadowBlur = 14 * glow;
      ctx.shadowColor = `rgba(${r},${g},${b},0.75)`;
      ctx.fillText(cfg.earth.glyph, x, y);
      ctx.restore();
    }
  });

  // react to base resizes
  (function bindResize() {
    const base = engine.modules.base;
    if (!base) return setTimeout(bindResize, 16);
    const ro = new ResizeObserver(() => {
      mod.onResize(base.width, base.height, base.dpr);
    });
    ro.observe(engine.state.canvas);
  })();

  engine.markReady("ui");
})();
