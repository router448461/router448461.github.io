(() => {
  // Namespace and readiness gate
  const engine = (window.engine = {
    version: "1.0.0",
    t0: performance.now(),
    config: {
      // Tuned for slower, denser, ominous visuals
      baseParticleDensity: 0.00012,  // particles per px^2 (increased to produce more lines)
      maxParticles: 300,
      linkDistance: 160,              // longer links to create an interconnected web
      linkOpacity: 0.16,              // slightly stronger links
      particleSize: [0.9, 2.6],       // keep size variety
      speed: [0.06, 0.28],            // slower base speeds
      repelRadius: 120,
      backgroundFade: 0.04,           // lower fade => longer trails (stronger motion blur)
      color: "#84c5ff",
      bloomEnabled: true,             // optional offscreen bloom
      bloomDownscale: 0.45,
      bloomBlurPx: 10,
      bloomFrameSkip: 3
    },
    state: {
      started: false,
      canvas: null,
      ctx: null,
      mouse: { x: null, y: null, down: false },
      fps: 0,
    },
    modules: {},
    _ready: new Set(),
    _waiters: [],
    markReady(name) {
      this._ready.add(name);
      this._flushWaiters();
    },
    when(modules, cb) {
      this._waiters.push({ mods: new Set(modules), cb });
      this._flushWaiters();
    },
    _flushWaiters() {
      this._waiters = this._waiters.filter(job => {
        const ok = [...job.mods].every(m => this._ready.has(m));
        if (ok) job.cb();
        return !ok;
      });
    },
    log(msg, ...rest) {
      // eslint-disable-next-line no-console
      console.log(`[ENGINE] ${msg}`, ...rest);
    }
  });

  // Preload and apply main.css after first paint
  function loadMainCss() {
    if (document.querySelector('link[href*="assets/css/main.css"]')) return;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "style";
    link.href = "assets/css/main.css";
    link.onload = function () { this.rel = "stylesheet"; };
    document.head.appendChild(link);
  }

  // Remove loader with graceful fade
  function removeLoader() {
    const loader = document.getElementById("loader");
    if (!loader) return;
    loader.classList.add("fade-out");
    loader.addEventListener("transitionend", () => {
      loader.classList.add("removed");
    }, { once: true });
  }

  // Boot orchestrator
  window.addEventListener("DOMContentLoaded", () => {
    loadMainCss();

    // Dynamically load modules (async)
    ["engine.base.js", "engine.visuals.js"].forEach(file => {
      const s = document.createElement("script");
      s.src = `assets/js/${file}`;
      s.async = true;
      document.body.appendChild(s);
    });

    // Optional telemetry module
    const intel = document.createElement("script");
    intel.src = "assets/js/engine.intel.js";
    intel.defer = true;
    document.body.appendChild(intel);

    // Start when base + visuals are ready
    engine.when(["base", "visuals"], () => {
      if (engine.state.started) return;
      engine.state.started = true;

      engine.modules.base.init();
      engine.modules.visuals.init();

      // Main loop
      let last = performance.now();
      function frame(now) {
        const dt = Math.min(48, now - last); // cap delta (allow slightly larger dt but still bounded)
        last = now;
        engine.modules.base.tick(dt);
        engine.modules.visuals.tick(dt);
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);

      removeLoader();

      const t1 = performance.now();
      engine.log(`Started in ${Math.round(t1 - engine.t0)}ms`);
      if (engine.modules.intel?.start) engine.modules.intel.start();
    });

    // Safety fallback: if visuals slow to load, still fade loader
    setTimeout(() => { removeLoader(); }, 3500);
  });
})();
