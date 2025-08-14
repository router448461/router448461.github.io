(() => {
  // Namespace and readiness gate
  const engine = (window.engine = {
    version: "1.3.0",
    t0: performance.now(),
    config: {
      baseParticleDensity: 0.00008,
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

  // Entry symbol logic
  function setupCenterEnter() {
    const centerBtn = document.getElementById("centerEnter");
    if (!centerBtn) return;
    centerBtn.addEventListener("click", enterSite);
    centerBtn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") enterSite(e);
    });
    // For accessibility, focus the symbol on load
    centerBtn.focus();
    // You can replace enterSite below with navigation logic later
    function enterSite(e) {
      // For now, just log and visually feedback
      engine.log("⏚ symbol clicked/entered");
      centerBtn.style.opacity = "0.15";
      setTimeout(() => centerBtn.style.opacity = "0.45", 800);
      // In future: navigate to another page or show overlay
    }
  }

  // Start engine after DOM ready
  window.addEventListener("DOMContentLoaded", () => {
    ["engine.base.js", "engine.visuals.js", "engine.intel.js"].forEach(file => {
      const s = document.createElement("script");
      s.src = `assets/js/${file}`;
      s.async = true;
      document.body.appendChild(s);
    });

    engine.when(["base", "visuals"], () => {
      setupCenterEnter();
      loadMainCss();
    });
  });
})();
