(() => {
  // Namespace and readiness gate
  const engine = (window.engine = {
    version: "1.2.0-tac-remote",
    t0: performance.now(),
    config: {
      // tuned for dense, ominous tactical visuals (reduced clutter)
      baseParticleDensity: 0.00008,
      maxParticles: 320,
      linkDistance: 140,
      linkOpacity: 0.12,
      particleSize: [0.9, 2.0],
      speed: [0.06, 0.32],
      repelRadius: 110,
      backgroundFade: 0.05,
      bloomEnabled: true,
      bloomDownscale: 0.45,
      bloomBlurPx: 8,
      bloomFrameSkip: 3,

      // military forced
      militaryMode: true,
      reducedMotion: false,

      // Remote map URL (preselected a high-contrast Wikimedia world SVG that generally allows CORS).
      // You can replace this with any CORS-enabled SVG/PNG URL you prefer.
      worldUrl: "https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg",
    },
    state: {
      started: false,
      canvas: null,
      ctx: null,
      mouse: { x: null, y: null, down: false },
      fps: 0
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

  // small polyfill for some legacy uses of window.styleMedia.matchMedium
  if (!window.styleMedia) {
    window.styleMedia = {
      matchMedium: (q) => {
        try {
          return !!window.matchMedia && window.matchMedia(q).matches;
        } catch (e) {
          return false;
        }
      }
    };
  }

  // respects reduced-motion preference
  const prr = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prr) engine.config.reducedMotion = true;

  // load main styles immediately (avoid preload warning)
  function loadMainCss() {
    if (document.querySelector('link[href*="assets/css/main.css"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "assets/css/main.css";
    document.head.appendChild(link);
  }

  // loader fade
  function removeLoader() {
    const loader = document.getElementById("loader");
    if (!loader) return;
    if (engine.config.reducedMotion) {
      loader.classList.add("removed");
      return;
    }
    loader.classList.add("fade-out");
    loader.addEventListener("transitionend", () => loader.classList.add("removed"), { once: true });
  }

  window.addEventListener("DOMContentLoaded", () => {
    loadMainCss();

    // dynamically load modules
    ["engine.base.js", "engine.visuals.js"].forEach(file => {
      const s = document.createElement("script");
      s.src = `assets/js/${file}`;
      s.async = true;
      document.body.appendChild(s);
    });

    // optional intel module (keeps FPS tracking)
    const intel = document.createElement("script");
    intel.src = "assets/js/engine.intel.js";
    intel.defer = true;
    document.body.appendChild(intel);

    // start when base + visuals ready
    engine.when(["base", "visuals"], () => {
      if (engine.state.started) return;
      engine.state.started = true;

      engine.modules.base.init();
      engine.modules.visuals.init();

      // main loop
      let last = performance.now();
      function frame(now) {
        const dt = Math.min(48, now - last);
        last = now;
        engine.modules.base.tick(dt);
        engine.modules.visuals.tick(dt);
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);

      removeLoader();
      engine.log(`Started in ${Math.round(performance.now() - engine.t0)}ms`);
      if (engine.modules.intel?.start) engine.modules.intel.start();
    });

    // Safety fade
    setTimeout(() => { removeLoader(); }, 3500);
  });
})();
