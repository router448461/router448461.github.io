(() => {
  const engine = window.engine;

  function rand(min, max) { return Math.random() * (max - min) + min; }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a,b,t){ return a + (b - a) * t; }

  // Particle class unchanged except smaller glows
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
      ctx.arc(this.x, this.y, this.size * (0.72 + 0.12 * this.z) * tw, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    drawGlowTo(ctx, now, glowColor) {
      const tw = 1 + 0.12 * Math.sin((now * 0.00068 * this.twinkleSpeed) + this.twinklePhase);
      // reduced glow radius and alpha for realism
      const galpha = 0.08 * (this.z) * tw;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = `rgba(${glowColor[0]},${glowColor[1]},${glowColor[2]},${galpha})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, Math.max(3, this.size * 1.6), 0, Math.PI * 2);
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
    radar: { angle: 0, speed: 0.0010 },
    flights: [],
    lastFlightFetch: 0,
    flightTimer: 0,
    lockPulseStart: 0,

    init() {
      this.onResize(engine.modules.base.width, engine.modules.base.height, engine.modules.base.dpr);
      this.spawn();

      if (engine.config.bloomEnabled) {
        // soften the bloom pass so it's subtle — smaller blur + lower alpha in pass
        this.bloom = {
          canvas: document.createElement('canvas'),
          ctx: null,
          down: Math.max(0.28, engine.config.bloomDownscale || 0.45),
          blurPx: Math.max(4, (engine.config.bloomBlurPx || 8) - 4),
          frameSkip: Math.max(3, engine.config.bloomFrameSkip || 3),
          frameCounter: 0
        };
        this.bloom.ctx = this.bloom.canvas.getContext('2d');
      }

      this.radar.speed = 0.0007 + Math.random() * 0.0008;
      this.flightTimer = 0;
    },

    // _fetchFlights, _latLngToCanvasPoint, onResize, spawn, buildGrid, neighborsFor unchanged (except _latLngToCanvasPoint uses L.latLng when possible)
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
            const [icao24, callsign, origin_country, time_position, last_contact, lon, lat, baro_altitude, on_ground, velocity, heading, vertical_rate] = s;
            if (lat != null && lon != null) flights.push({
              icao24, callsign: (callsign||'').trim(), lat, lon, alt: baro_altitude, velocity, heading, vrate: vertical_rate, on_ground
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
      if (engine.state.map && typeof L !== 'undefined' && L.latLng) {
        try {
          const pt = engine.state.map.latLngToContainerPoint(L.latLng(lat, lon));
          return { x: pt.x, y: pt.y };
        } catch (e) {
          // fallback
        }
      }
      const x = ((lon + 180) / 360) * this.bounds.w;
      const y = ((90 - lat) / 180) * this.bounds.h;
      return { x, y };
    },

    onResize(w, h, dpr) {
      this.bounds.w = w;
      this.bounds.h = h;
      const area = w * h;
      const target = Math.min(engine.config.maxParticles, Math.ceil(area * engine.config.baseParticleDensity));
      this.targetCount = target || 80;
      this.cellSize = Math.max(72, Math.floor(engine.config.linkDistance * 0.95));
      this.grid = null;
      if (this.bloom) {
        const bw = Math.max(1, Math.floor(w * this.bloom.down));
        const bh = Math.max(1, Math.floor(h * this.bloom.down));
        const pdpr = Math.max(1, Math.floor(dpr));
        this.bloom.canvas.width = Math.floor(bw * pdpr);
        this.bloom.canvas.height = Math.floor(bh * pdpr);
        this.bloom.canvas.style.width = bw + 'px';
        this.bloom.canvas.style.height = bh + 'px';
        this.bloom.ctx.setTransform(pdpr,0,0,pdpr,0,0);
      }
    },

    spawn() {
      const cfg = engine.config;
      const need = (this.targetCount ?? 120);
      const current = this.particles.length;
      for (let i = current; i < need; i++) this.particles.push(new Particle(this.bounds.w, this.bounds.h, cfg));
      if (this.particles.length > need) this.particles.length = need;
    },

    buildGrid() {
      const grid = new Map();
      const cs = this.cellSize;
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        const ix = Math.floor(p.x / cs);
        const iy = Math.floor(p.y / cs);
        const key = ix + ',' + iy;
        let bucket = grid.get(key);
        if (!bucket) { bucket = []; grid.set(key, bucket); }
        bucket.push(p);
      }
      this.grid = grid;
    },

    neighborsFor(p) {
      const cs = this.cellSize;
      const ix = Math.floor(p.x / cs);
      const iy = Math.floor(p.y / cs);
      const list = [];
      for (let ox = -1; ox <= 1; ox++) for (let oy = -1; oy <= 1; oy++) {
        const key = (ix + ox) + ',' + (iy + oy); const bucket = this.grid.get(key); if (bucket) list.push(...bucket);
      }
      return list;
    },

    tick(dt) {
      if ((this.particles.length | 0) !== (this.targetCount | 0)) this.spawn();
      const ctx = engine.state.ctx;
      const cfg = engine.config;
      const now = performance.now();
      const fps = engine.state.fps || 60;
      const linkEnabled = fps > 20;

      if (cfg.militaryMode) this.radar.angle += this.radar.speed * dt;

      // flight polling
      if (cfg.flightEnabled) {
        this.flightTimer += dt;
        if (this.flightTimer >= (cfg.flightPollInterval || 10000)) {
          this.flightTimer = 0;
          this._fetchFlights();
        }
      }

      for (let i = 0; i < this.particles.length; i++) this.particles[i].step(dt, this.bounds, engine.state.mouse, cfg, now);

      if (linkEnabled) this.buildGrid();

      if (this.bloom) {
        const b = this.bloom;
        b.frameCounter++;
        if (b.frameCounter % b.frameSkip === 0) {
          const boc = b.ctx;
          boc.clearRect(0,0, boc.canvas.width / (b.ctx.getTransform()?.a || 1), boc.canvas.height / (b.ctx.getTransform()?.d || 1));
          boc.save();
          boc.scale(b.down, b.down);
          for (let i=0;i<this.particles.length;i++){
            const p = this.particles[i];
            const warm = [200,220,120], cool = [120,170,100];
            const depth = clamp((p.z - 0.6) / (1.6 - 0.6), 0, 1);
            const mix = clamp(0.6 + p.tempBias * 0.25 + (depth * 0.12), 0, 1);
            const r = Math.round(lerp(warm[0], cool[0], mix));
            const g = Math.round(lerp(warm[1], cool[1], mix));
            const bcol = Math.round(lerp(warm[2], cool[2], mix));
            // smaller, subtler bloom blobs
            boc.fillStyle = `rgba(${r},${g},${bcol},${0.06 * p.z})`;
            boc.beginPath();
            boc.arc(p.x, p.y, Math.max(4, p.size * 2.0), 0, Math.PI*2);
            boc.fill();
          }
          boc.restore();
        }
      }

      // draw cores
      for (let i = 0; i < this.particles.length; i++) this.particles[i].drawCore(ctx, now);

      // draw links
      if (linkEnabled) {
        ctx.save(); ctx.lineCap = 'round';
        for (let i = 0; i < this.particles.length; i++) {
          const a = this.particles[i]; const neighbors = this.neighborsFor(a);
          for (let j = 0; j < neighbors.length; j++) {
            const b = neighbors[j]; if (a === b) continue;
            const dx = a.x - b.x, dy = a.y - b.y; const d2 = dx*dx + dy*dy; const maxD = cfg.linkDistance;
            if (d2 <= maxD * maxD) {
              const d = Math.sqrt(d2);
              const depthFactor = (a.z + b.z) * 0.5;
              const baseAlpha = cfg.linkOpacity * 1.2;
              const alpha = Math.max(0, baseAlpha * (1 - d / maxD) * depthFactor);
              if (alpha > 0.02) {
                const r = Math.round(90 + 30 * (1 - depthFactor));
                const g = Math.round(130 + 40 * depthFactor);
                const bl = Math.round(60 + 30 * depthFactor);
                ctx.strokeStyle = `rgba(${r},${g},${bl},${alpha})`;
                ctx.lineWidth = 0.7 + (0.8 * depthFactor);
                ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
              }
            }
          }
        }
        ctx.restore();
      }

      // composite bloom
      if (this.bloom && this.bloom.canvas) {
        ctx.save(); if (ctx.filter !== undefined) ctx.filter = `blur(${this.bloom.blurPx}px)`; ctx.globalCompositeOperation = 'lighter';
        ctx.drawImage(this.bloom.canvas, 0, 0, this.bounds.w, this.bounds.h); ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none'; ctx.restore();
      }

      // per-particle glows (subtle)
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        const cool = [120,170,100], warm = [200,220,120];
        const depth = clamp((p.z - 0.6) / (1.6 - 0.6), 0, 1);
        const mix = clamp(0.6 + p.tempBias * 0.25 + (depth * 0.12), 0, 1);
        const glowColor = [Math.round(lerp(warm[0], cool[0], mix)), Math.round(lerp(warm[1], cool[1], mix)), Math.round(lerp(warm[2], cool[2], mix))];
        p.drawGlowTo(ctx, now, glowColor);
      }

      // draw flights (if any) — aircraft markers are crisp and small
      if (engine.config.flightEnabled && this.flights && this.flights.length) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < this.flights.length; i++) {
          const f = this.flights[i];
          if (!f.lat || !f.lon) continue;
          const pt = this._latLngToCanvasPoint(f.lat, f.lon);
          if (pt.x < -50 || pt.x > this.bounds.w + 50 || pt.y < -50 || pt.y > this.bounds.h + 50) continue;
          const sz = 6 + (Math.min(800, Math.max(0, (f.velocity || 0))) / 160);
          const heading = (f.heading != null ? f.heading : 0) * Math.PI / 180;
          ctx.save();
          ctx.translate(pt.x, pt.y);
          ctx.rotate(heading);
          ctx.beginPath();
          ctx.moveTo(sz, 0);
          ctx.lineTo(-sz * 0.6, sz * 0.5);
          ctx.lineTo(-sz * 0.6, -sz * 0.5);
          ctx.closePath();
          ctx.fillStyle = 'rgba(220,240,160,0.98)';
          ctx.fill();
          ctx.beginPath();
          ctx.arc(0, 0, sz * 1.2, 0, Math.PI*2);
          ctx.fillStyle = 'rgba(200,220,120,0.04)';
          ctx.fill();
          ctx.restore();
          if (f.callsign) {
            ctx.font = '10px ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial';
            ctx.fillStyle = 'rgba(200,230,150,0.86)';
            ctx.fillText(f.callsign.trim().slice(0,8), pt.x + 10, pt.y + 4);
          }
        }
        ctx.restore();
      }

      // HUD reticle & radar sweep remain (unchanged)
      // ... (same as prior implementation)
    }
  });

  engine.markReady("visuals");
})();
