(() => {
  const engine = window.engine;
  const mod = (engine.modules.base = {
    canvas: null,
    ctx: null,
    dpr: Math.min(2, window.devicePixelRatio || 1),
    width: 0,
    height: 0,
    _resizeRaf: null,

    init() {
      this.canvas = document.getElementById("constellationCanvas");
      // Use alpha:true so underlying DOM map remains visible
      this.ctx = this.canvas.getContext("2d", { alpha: true, desynchronized: true });
      engine.state.canvas = this.canvas;
      engine.state.ctx = this.ctx;
      this.resize();
      this.bindEvents();
      this.clear(true);
    },

    bindEvents() {
      // Debounced resize using rAF to avoid layout thrash
      window.addEventListener("resize", () => {
        if (this._resizeRaf) cancelAnimationFrame(this._resizeRaf);
        this._resizeRaf = requestAnimationFrame(() => { this.resize(); this._resizeRaf = null; });
      }, { passive: true });

      // Pointer tracking with capture on down for consistent interaction and subtle parallax
      this.canvas.addEventListener("pointermove", (e) => {
        engine.state.mouse.x = e.clientX;
        engine.state.mouse.y = e.clientY;
      }, { passive: true });

      this.canvas.addEventListener("pointerdown", (e) => {
        engine.state.mouse.down = true;
        try { e.target.setPointerCapture?.(e.pointerId); } catch (err) {}
        engine.state.mouse.x = e.clientX;
        engine.state.mouse.y = e.clientY;
      }, { passive: true });

      this.canvas.addEventListener("pointerup", (e) => {
        engine.state.mouse.down = false;
        try { e.target.releasePointerCapture?.(e.pointerId); } catch (err) {}
      }, { passive: true });

      // also observe global pointer up to ensure release
      window.addEventListener("pointerup", () => { engine.state.mouse.down = false; }, { passive: true });

      document.addEventListener("visibilitychange", () => {
        // Optionally handle pause/resume
      });
    },

    resize() {
      const dpr = (this.dpr = Math.min(2, window.devicePixelRatio || 1));
      this.width = Math.floor(window.innerWidth);
      this.height = Math.floor(window.innerHeight);
      this.canvas.width = Math.floor(this.width * dpr);
      this.canvas.height = Math.floor(this.height * dpr);
      this.canvas.style.width = this.width + "px";
      this.canvas.style.height = this.height + "px";
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Notify visuals if present
      if (engine.modules.visuals?.onResize) engine.modules.visuals.onResize(this.width, this.height, dpr);
      this.clear(true);
    },

    clear(hard = false) {
      const ctx = this.ctx;
      if (!ctx) return;
      // Always fully clear the canvas to keep the DOM map visible underneath.
      // This avoids cumulative semi-transparent fills that would eventually obscure the map.
      ctx.clearRect(0, 0, this.width, this.height);
    },

    tick() {
      // We clear fully each frame; visuals are fully redrawn.
      this.clear(false);
    }
  });

  engine.markReady("base");
})();
