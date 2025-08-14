(() => {
  const engine = window.engine;

  const mod = (engine.modules.base = {
    width: 0, height: 0, dpr: 1,

    init() {
      // Canvas bootstrap
      const canvas = document.createElement("canvas");
      document.body.appendChild(canvas);
      const ctx = canvas.getContext("2d");
      engine.state.canvas = canvas;
      engine.state.ctx = ctx;

      // Tracking DPR and size
      this.onResize();
      window.addEventListener("resize", () => this.onResize(), { passive: true });

      // Mouse tracking
      window.addEventListener("mousemove", e => {
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * this.dpr;
        const y = (e.clientY - rect.top) * this.dpr;
        engine.state.mouse.x = x;
        engine.state.mouse.y = y;
      }, { passive: true });

      window.addEventListener("mouseleave", () => {
        engine.state.mouse.x = null;
        engine.state.mouse.y = null;
      });

      window.addEventListener("mousedown", () => engine.state.mouse.down = true);
      window.addEventListener("mouseup", () => engine.state.mouse.down = false);

      // Start RAF loop
      this.loop();
    },

    onResize() {
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1)); // clamp for perf
      this.dpr = dpr;
      this.width = Math.floor(window.innerWidth * dpr);
      this.height = Math.floor(window.innerHeight * dpr);
      const canvas = engine.state.canvas;
      if (canvas) {
        canvas.width = this.width;
        canvas.height = this.height;
        canvas.style.width = "100vw";
        canvas.style.height = "100vh";
      }
      const visuals = engine.modules.visuals;
      if (visuals && visuals.onResize) visuals.onResize(this.width, this.height, this.dpr);
    },

    loopLast: performance.now(),

    loop(now = performance.now()) {
      const dt = now - this.loopLast;
      this.loopLast = now;
      engine.state.time = now;

      const ctx = engine.state.ctx;
      const { width: w, height: h } = this;

      // Clear to black
      ctx.setTransform(1,0,0,1,0,0);
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);

      // Background wash (low-alpha gradient + vignette)
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, engine.config.background.top);
      g.addColorStop(1, engine.config.background.bottom);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      // Soft vignette
      const vg = ctx.createRadialGradient(w/2, h/2, Math.min(w, h) * 0.35, w/2, h/2, Math.max(w, h) * 0.7);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, engine.config.background.vignette);
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w, h);

      // Tick visuals
      const visuals = engine.modules.visuals;
      if (visuals && visuals.tick) visuals.tick(dt);

      // Draw UI (Earth)
      const ui = engine.modules.ui;
      if (ui && ui.draw) ui.draw(dt);

      requestAnimationFrame(t => this.loop(t));
    }
  });

  // Boot immediately
  mod.init();
  engine.markReady("base");
})();
