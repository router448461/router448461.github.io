(() => {
  const engine = (window.engine = {
    version: "1.0.1",
    t0: performance.now(),
    config: {
      baseParticleDensity: 0.00008,
      maxParticles: 220,
      linkDistance: 110,
      linkOpacity: 0.12,
      particleSize: [1.0, 2.2],
      speed: [0.15, 0.6],
      repelRadius: 120,
      backgroundFade: 0.075,
      color: "#84c5ff",
      secondaryColor: "#5fb3ff",
      glowStrength: 0.6,
      flickerSpeed: 1.4,
      depth: { min: 0.9, max: 1.25, linkTolerance: 0.22 },
      noise: { scale: 0.0014, speed: 0.00018, strength: 0.16 },
      micro: { spawnRate: 0.0008, life: [600, 1400], size: [0.6, 1.2], alpha: 0.25 },
      pulse: { minInterval: 7000, maxInterval: 14000, duration: 650, intensity: 0.18 }
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
    markReady(name) { this._ready.add(name); this._flushWaiters(); },
    when(modules, cb) { this._waiters.push({ mods: new Set(modules), cb }); this._flushWaiters(); },
    _flushWaiters() {
      this._waiters = this._waiters.filter(job => {
        const ok = [...job.mods].every(m => this._ready.has(m));
        if (ok) job.cb();
        return !ok;
      });
    },
    log(msg, ...rest) { console.log(`[ENGINE] ${msg}`, ...rest); }
  });

  function loadMainCss() {
    if (document.querySelector('link[href*="assets/css/main.css"]')) return;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "style";
    link.href = "assets/css/main.css";
    link.onload = function () { this.rel = "stylesheet"; };
    document.head.appendChild(link);
  }

  function removeLoader() {
    const loader = document.getElementById("loader");
    if (!loader) return;
    loader.classList.add("fade-out");
    loader.addEventListener("transitionend", () => { loader.classList.add("removed"); }, { once: true });
  }

  window.addEventListener("DOMContentLoaded", () => {
    loadMainCss();

    ["engine.base.js", "engine.visuals.js"].forEach(file => {
      const s = document.createElement("script");
      s.src = `assets/js/${file}`;
      s.async = true;
      document.body.appendChild(s);
    });

    const intel = document.createElement("script");
    intel.src = "assets/js/engine.intel.js";
    intel.defer = true;
    document.body.appendChild(intel);

    engine.when(["base", "visuals"], () => {
      if (engine.state.started) return;
      engine.state.started = true;

      engine.modules.base.init();
      engine.modules.visuals.init();

      let last = performance.now();
      function frame(now) {
        const dt = Math.min(32, now - last);
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

    setTimeout(() => { removeLoader(); }, 3500);
  });
})();
