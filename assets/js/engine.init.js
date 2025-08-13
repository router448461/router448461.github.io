(() => {
  // Namespace and readiness gate
  const engine = (window.engine = {
    version: "1.1.0",
    t0: performance.now(),
    config: {
      // DEMON SEED defaults (no user interaction or time-based mode switching)
      baseParticleDensity: 0.00009,   // particles per px^2
      maxParticles: 260,
      linkDistance: 120,
      linkOpacity: 0.12,
      particleSize: [0.8, 2.4],
      speed: [0.08, 0.5],             // base drift; flow field adds on top
      backgroundFade: 0.065,          // trail strength (lower = longer trails)
      color: "#ff6b6b",               // primary
      colorSecondary: "#ffb36b",      // secondary ember
      depth: { min: 0.65, max: 1.55, linkZTolerance: 0.28 },
      glow: { blur: 6, strength: 1.0 },
      noise: { scale: 0.0018, speed: 0.00020, strength: 0.32 },
      enableInteraction: false        // hard-off by request
    },
    state: {
      started: false,
      paused: false,
      canvas: null,
      ctx: null,
      fps: 0,
    },
    modules: {},
    _ready: new Set(),
    _waiters: [],
    markReady(name) {
      this._ready.add(name);
      this._flushWaiters();
    },
    when(mods, cb) {
      this._waiters.push({ mods: new Set(mods), cb });
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

  // Visibility pause/resume
  function handleVisibility() {
    engine.state.paused = document.hidden === true;
    if (!engine.state.paused && engine.modules.base?.clear) {
      // Hard clear on resume to prevent ghost trails
      engine.modules.base.clear(true);
    }
  }
  document.addEventListener("visibilitychange", handleVisibility, { passive: true });

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
      let hiddenAccumulator = 0;
      function frame(now) {
        const dt = Math.min(48, now - last); // cap delta for stability
        last = now;

        if (!engine.state.paused) {
          engine.modules.base.tick(dt);
          engine.modules.visuals.tick(dt);
          hiddenAccumulator = 0;
        } else {
          // When hidden, do very light maintenance at low cadence
          hiddenAccumulator += dt;
          if (hiddenAccumulator > 250) {
            engine.modules.base.tick(250);
            hiddenAccumulator = 0;
          }
        }

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
