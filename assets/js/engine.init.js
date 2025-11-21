(() => {
  // Namespace and readiness gate
  const engine = (window.engine = {
    version: "1.4.1-tac-flights",
    t0: performance.now(),
    config: {
      // visuals
      baseParticleDensity: 0.00006,
      maxParticles: 260,
      linkDistance: 140,
      linkOpacity: 0.12,
      particleSize: [0.9, 2.0],
      speed: [0.06, 0.32],
      repelRadius: 110,
      backgroundFade: 0.05,
      // disable heavy bloom/orb effects to keep visuals crisp and map visible
      bloomEnabled: false,
      bloomDownscale: 0.45,
      bloomBlurPx: 8,
      bloomFrameSkip: 3,

      // flight overlay: choose data source
      flightEnabled: true,
      flightSource: 'opensky',
      // Poll interval in ms
      flightPollInterval: 10000,
      flightProxy: '',

      // Map options (Leaflet fallback)
      initialCenter: { lat: 20.0, lng: 0.0 },
      initialZoom: 2
    },
    state: {
      started: false,
      canvas: null,
      ctx: null,
      mouse: { x: null, y: null, down: false },
      fps: 0,
      domMapLoaded: false,
      map: null,
      mapReady: false
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

  // small polyfill for styleMedia deprecation callers (harmless)
  if (!window.styleMedia) {
    window.styleMedia = {
      matchMedium: (q) => {
        try { return !!window.matchMedia && window.matchMedia(q).matches; } catch (e) { return false; }
      }
    };
  }

  // respects reduced-motion preference
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) engine.config.reducedMotion = true;

  // load main styles immediately
  function loadMainCss() {
    if (document.querySelector('link[href*="assets/css/main.css"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "assets/css/main.css";
    document.head.appendChild(link);
  }

  // Initialize a DOM map. Default is Leaflet + Carto Dark tiles (no key required).
  function initDomMap() {
    return new Promise((resolve) => {
      // add Leaflet CSS if not present
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const lcss = document.createElement('link');
        lcss.rel = 'stylesheet';
        lcss.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(lcss);
      }
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      s.defer = true;
      s.onload = () => {
        try {
          const mapEl = document.getElementById('mapContainer');
          if (!mapEl) return resolve(false);
          mapEl.innerHTML = '';

          // ensure container has proper sizing (set style in case)
          mapEl.style.width = '100vw';
          mapEl.style.height = '100vh';

          const map = L.map(mapEl, {
            center: [engine.config.initialCenter.lat, engine.config.initialCenter.lng],
            zoom: engine.config.initialZoom,
            dragging: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            touchZoom: false,
            boxZoom: false,
            keyboard: false,
            zoomControl: false,
            attributionControl: false,
            interactive: false
          });

          const tile = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
            subdomains: 'abcd',
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
          }).addTo(map);

          // When the first tile load completes, force a size calc and mark map ready.
          tile.on('load', () => {
            try { map.invalidateSize(true); } catch (e) {}
            // small delay to make sure internal tile layout occurs
            setTimeout(() => {
              try { map.invalidateSize(true); } catch (e) {}
              engine.state.mapReady = true;
            }, 220);
          });

          // also when map is ready (Leaflet API)
          try {
            map.whenReady(() => {
              try { map.invalidateSize(true); } catch (e) {}
              engine.state.mapReady = true;
            });
          } catch (e) { /* ignore if older Leaflet */ }

          // keep map sized if the window resizes
          window.addEventListener('resize', () => { try { map.invalidateSize(); } catch (e) {} });

          engine.state.map = map;
          engine.state.domMapLoaded = true;
          engine.log('Leaflet/CARTO map loaded');
          resolve(true);
        } catch (e) {
          console.warn('[engine] Leaflet init failed', e);
          resolve(false);
        }
      };
      s.onerror = () => resolve(false);
      document.head.appendChild(s);
    });
  }

  // loader fade — ensure map gets one last invalidate once loader removed
  function removeLoader() {
    const loader = document.getElementById("loader");
    if (!loader) return;
    if (engine.config.reducedMotion) {
      loader.classList.add("removed");
      if (engine.state.map) try { engine.state.map.invalidateSize(true); } catch (e) {}
      return;
    }
    loader.classList.add("fade-out");
    loader.addEventListener("transitionend", () => {
      loader.classList.add("removed");
      // once loader hidden, force Leaflet reflow to ensure tiles & container compute
      if (engine.state.map) {
        try { engine.state.map.invalidateSize(true); } catch (e) {}
        // small second pass
        setTimeout(() => { try { engine.state.map.invalidateSize(true); } catch (e) {} }, 300);
      }
    }, { once: true });
  }

  window.addEventListener("DOMContentLoaded", () => {
    loadMainCss();

    // attempt to init DOM map first (Leaflet fallback)
    initDomMap().then(() => {
      // dynamically load modules after map attempt
      ["engine.base.js", "engine.visuals.js"].forEach(file => {
        const s = document.createElement("script");
        s.src = `assets/js/${file}`;
        s.async = true;
        document.body.appendChild(s);
      });

      // optional intel
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
  });
})();
