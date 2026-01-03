(() => {
  const engine = window.engine;

  function rand(min, max) { return Math.random() * (max - min) + min; }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a,b,t){ return a + (b - a) * t; }

  // Particle class unchanged except smaller glows (keeps visuals subtle)
  class Particle {
    constructor(w, h, cfg) {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.z = rand(0.6, 1.6);
      const speedBase = rand(cfg.speed[0], cfg.speed[1]);
      const slowFactor = 0.46;
      this.vx = speedBase * slowFactor * (Math.random() < 0.5 ? -1 : 1) * (0.6 + (this.z - 0.6));
      this.vy = speedBase * slowFactor * (Math.random() < 0.5 ? -1 : 1) * (0.6 + (this.z - 0.6));
      this.size = rand(cfg.particleSize[0], cfg.particleSize[1]) * this.z;
      this.twinklePhase = Math.random() * Math.PI * 2;
      this.twinkleSpeed = rand(0.6, 1.2);
      this.seed = Math.random() * 1000;
      this.tempBias = (Math.random() * 2 - 1) * 0.42;
    }
    step(dt, bounds, mouse, cfg, now) {
      const t = dt / 16.6667;
      const wander = 0.008 * (1 / this.z);
      this.vx += rand(-wander, wander);
      this.vy += rand(-wander, wander);
      const sway = Math.sin((now * 0.0006) + this.seed) * 0.01;
      this.vx += sway * (1 / this.z);
      this.vy += sway * (1 / this.z);
      if (mouse.x != null && mouse.y != null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const d2 = dx*dx + dy*dy;
        const r = engine.config.repelRadius * (1 + (1.2 - this.z));
        if (d2 < r*r) {
          const d = Math.sqrt(d2) || 0.0001;
          const f = clamp(1 - d / r, 0, 1);
          const mode = mouse.down ? -1 : 1;
          const strength = (0.18 + 0.62 * f) * (mode) * (0.6 + (1.6 - this.z) * 0.18);
          this.vx += (dx / d) * strength;
          this.vy += (dy / d) * strength;
        }
      }
      this.x += this.vx * t;
      this.y += this.vy * t;
      if (this.x < -20) { this.x = -20; this.vx *= -0.78; }
      if (this.x > bounds.w + 20) { this.x = bounds.w + 20; this.vx *= -0.78; }
      if (this.y < -20) { this.y = -20; this.vy *= -0.78; }
      if (this.y > bounds.h + 20) { this.y = bounds.h + 20; this.vy *= -0.78; }
      const damp = 0.994 + (0.0016 * (1.6 - this.z));
      this.vx *= damp;
      this.vy *= damp;
    }
    drawCore(ctx, now) {
      const tw = 1 + 0.12 * Math.sin((now * 0.00068 * this.twinkleSpeed) + this.twinklePhase);
      const alpha = 0.48 * (this.z / 1.2) * tw;
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.beginPath();
      // slightly muted olive/amber core
      ctx.fillStyle = `rgba(${140 + Math.round(28*(1-this.z))},${180 - Math.round(24*(1-this.z))},${95 - Math.round(10*(1-this.z))},${alpha})`;
      ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  const mod = (engine.modules.visuals = {
    particles: [],
    bounds: { w: 0, h: 0 },
    grid: null,
    cellSize: 120,
    targetCount: 120,
    bloom: null,
    radar: { angle: 0, speed: 0.00010 },
    flights: [],
    lastFlightFetch: 0,
    flightTimer: 0,
    lockPulseStart: 0,

    init() {
      this.onResize(engine.modules.base.width, engine.modules.base.height, engine.modules.base.dpr);
      this.spawn();

      if (engine.config.flightEnabled) {
        // initial fetch attempt
        if (engine.state.mapReady) {
          this._fetchFlights().catch(()=>{});
          this.triedInitialFetch = true;
        } else {
          // retry a couple times while waiting for map to settle
          const waitForMapAndFetch = () => {
            if (engine.state.mapReady) {
              this._fetchFlights().catch(()=>{});
              this.triedInitialFetch = true;
            } else if (!this.triedInitialFetch) {
              setTimeout(waitForMapAndFetch, 350);
            }
          };
          setTimeout(waitForMapAndFetch, 350);
        }
      }
    },

    // _fetchFlights, _latLngToCanvasPoint, onResize, spawn, buildGrid, neighborsFor remain mostly unchanged
    async _fetchFlights() {
      const proxy = engine.config.flightProxy && engine.config.flightProxy.trim();
      const source = engine.config.flightSource || 'opensky';
      let url = '';
      if (proxy) url = proxy;
      else if (source === 'opensky') url = 'https://opensky-network.org/api/states/all';
      if (!url) return;
      try {
        const res = await fetch(url, { cache: 'no-cache' });
        if (!res.ok) throw new Error('Flight fetch failed: ' + res.status);
        const data = await res.json();
        const states = data.states || data;
        const flights = [];
        for (let i = 0; i < states.length; i++) {
          const s = states[i];
          if (Array.isArray(s)) {
            // OpenSky returns longitude then latitude (indexes 5 and 6)
            const [icao24, callsign, origin_country, time_position, last_contact, longitude, latitude, baro_altitude, on_ground, velocity, heading, vertical_rate] = s;
            if (latitude != null && longitude != null) flights.push({
              icao24, callsign: (callsign||'').trim(), lat: latitude, lon: longitude, alt: baro_altitude, velocity, heading, vrate: vertical_rate, on_ground
            });
          } else if (s && s.latitude != null && s.longitude != null) {
            flights.push({
              icao24: s.icao24 || s.hex || '',
              callsign: s.callsign || s.flight || '',
              lat: s.latitude,
              lon: s.longitude,
              alt: s.altitude || s.baro_altitude || null,
              velocity: s.velocity || 0,
              heading: s.heading || 0,
              vrate: s.vertical_rate || 0,
              on_ground: s.on_ground || false
            });
          }
        }
        this.flights = flights;
        this.lastFlightFetch = performance.now();
        console.log(`[visuals] fetched ${flights.length} flights`);
      } catch (e) {
        console.warn('[visuals] flight fetch failed', e);
      }
    },

    _latLngToCanvasPoint(lat, lon) {
      if (engine.state.map && typeof L !== 'undefined' && L.latLng && engine.state.mapReady) {
        try {
          const pt = engine.state.map.latLngToContainerPoint(L.latLng(lat, lon));
          return { x: pt.x, y: pt.y };
        } catch (e) {
          // fallback to equirectangular if something goes wrong
        }
      }
      const x = ((lon + 180) / 360) * this.bounds.w;
      const y = ((90 - lat) / 180) * this.bounds.h;
      return { x, y };
    },

    // ... remaining methods remain as before (onResize, spawn, buildGrid, neighborsFor, tick)
    // (No further changes required for this patch; existing tick draws flights using _latLngToCanvasPoint)
  });

  engine.markReady("visuals");
})();
