(() => {
  // Namespace and readiness gate
  const engine = (window.engine = {
    version: "1.2.0",
    t0: performance.now(),
    config: {
      baseParticleDensity: 0.00008,  // particles per px^2
      maxParticles: 220,
      linkDistance: 110,
      linkOpacity: 0.12,
      particleSize: [1.0, 2.2],
      speed: [0.15, 0.6],
      repelRadius: 120,
      backgroundFade: 0.08,
      color: "#84c5ff",
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

  // Loader sequence
  function startLoaderSequence() {
    const loader = document.getElementById("loader");
    const radar = document.getElementById("radarSpinner");
    const connecting = document.getElementById("connectingText");
    const earthBtn = document.getElementById("earthEnterButton");
    const enterHint = document.getElementById("enterHint");

    // Step 1: Show spinner and "connecting..." for 2s
    setTimeout(() => {
      if (radar) radar.style.display = "none";
      if (connecting) connecting.style.display = "none";
      if (earthBtn) {
        earthBtn.style.display = "grid";
        setTimeout(() => earthBtn.classList.add("shown"), 50); // fade in nicely
      }
      if (enterHint) enterHint.style.display = "block";
      loader.style.cursor = "pointer";
      earthBtn.focus();
    }, 2000);
  }

  // Remove loader with graceful fade
  function removeLoader() {
    const loader = document.getElementById("loader");
    if (!loader) return;
    loader.classList.add("fade-out");
    loader.setAttribute("aria-hidden", "true");
    setTimeout(() => loader.classList.add("removed"), 350);
  }

  // Enable earth logo entry button
  function setupEarthEntryButton() {
    const earthBtn = document.getElementById("earthEnterButton");
    if (!earthBtn) return;

    function enterSite(e) {
      if (e.type === "click" || (e.type === "keydown" && (e.key === "Enter" || e.key === " "))) {
        removeLoader();
        startEngine();
      }
    }
    earthBtn.addEventListener("click", enterSite);
    earthBtn.addEventListener("keydown", enterSite);
  }

  // Start engine after loader dismissed
  function startEngine() {
    if (engine.state.started) return;
    engine.state.started = true;

    engine.modules.base.init();
    engine.modules.visuals.init();

    // Main loop
    let last = performance.now();
    function frame(now) {
      const dt = Math.min(32, now - last);
      last = now;
      engine.modules.base.tick(dt);
      engine.modules.visuals.tick(dt);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    loadMainCss();
    const t1 = performance.now();
    engine.log(`Started in ${Math.round(t1 - engine.t0)}ms`);
    if (engine.modules.intel?.start) engine.modules.intel.start();
  }

  // Boot orchestrator
  window.addEventListener("DOMContentLoaded", () => {
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
      setupEarthEntryButton();
      startLoaderSequence();
    });

    setTimeout(() => { removeLoader(); }, 10000); // fallback
  });
})();
