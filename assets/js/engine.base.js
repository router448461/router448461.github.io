(() => {
  const engine = window.engine;
  const mod = (engine.modules.base = {
    canvas: null,
    ctx: null,
    dpr: Math.min(2, window.devicePixelRatio || 1),
    width: 0,
    height: 0,

    init() {
      this.canvas = document.getElementById("constellationCanvas");
      this.ctx = this.canvas.getContext("2d", { alpha: false, desynchronized: true });
      engine.state.canvas = this.canvas;
      engine.state.ctx = this.ctx;
      this.resize();
      this.bindEvents();
      this.clear(true);
    },

    bindEvents() {
      window.addEventListener("resize", () => this.resize(), { passive: true });
      window.addEventListener("pointermove", (e) => {
        engine.state.mouse.x = e.clientX;
        engine.state.mouse.y = e.clientY;
      }, { passive: true });
      window.addEventListener("pointerdown", () => { engine.state.mouse.down = true; }, { passive: true });
      window.addEventListener("pointerup", () => { engine.state.mouse.down = false; }, { passive: true });
      document.addEventListener("visibilitychange", () => {});
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
      if (engine.modules.visuals?.onResize) engine.modules.visuals.onResize(this.width, this.height, dpr);
      this.clear(true);
    },

    clear(hard = false) {
      const ctx = this.ctx;
      if (!ctx) return;
      if (hard) {
        ctx.fillStyle = "#0a0d14";
        ctx.fillRect(0, 0, this.width, this.height);
      } else {
        ctx.fillStyle = `rgba(10,13,20,${engine.config.backgroundFade})`;
        ctx.fillRect(0, 0, this.width, this.height);
      }
    },

    tick() { this.clear(false); }
  });

  engine.markReady("base");
})();
