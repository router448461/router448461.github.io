;(() => {
  'use strict';

  // Utility helpers
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const rand = (min, max) => Math.random() * (max - min) + min;
  const choice = arr => arr[Math.floor(Math.random() * arr.length)];

  const DEFAULTS = {
    // Colors
    dotColor: '#ffffff',
    lineColor: '#9bb8ff',
    sparkColor: '#a8c7ff',

    // Particles
    dotRadius: [1.2, 2.2],
    speed: 0.4,              // px per frame @60fps baseline (XY plane)
    speedZ: 0.05,            // depth drift baseline
    drift: 0.1,              // small random perturbation
    wrap: true,

    // Links
    lineWidth: 1.1,
    lineMaxDistance: 160,
    hoverLinkDistance: 190,
    depthFade: true,

    // Density
    density: 15000,          // area/density ≈ particle count
    minParticles: 80,
    maxParticles: 220,

    // 3D feel
    use3D: true,
    zRange: [-180, 180],     // world depth range (near to far)
    fov: 360,                // perspective strength (larger = milder perspective)
    parallax: 0.06,          // subtle mouse parallax factor

    // Sparks (travelers along lines)
    sparkCount: 18,
    sparkSize: [1.2, 2.2],
    sparkSpeed: [60, 120],   // px per second along the edge
    sparkLife: [2.5, 6.0],   // seconds before re-seed

    // Runtime
    repelRadius: 110,
    repelForce: 0.014,
    fpsCap: 60,
    tacticalMode: true
  };

  class Constellation {
    constructor(canvas, opts = {}) {
      if (!canvas || !canvas.getContext) {
        throw new Error('Constellation: canvas not available');
      }

      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.opts = { ...DEFAULTS, ...opts };

      // DPR & sizing
      this.dpr = Math.max(1, window.devicePixelRatio || 1);
      this.w = 0;
      this.h = 0;
      this.cx = 0;
      this.cy = 0;

      // State
      this.particles = [];
      this.edges = [];    // computed each frame: [{i, j, dist}]
      this.sparks = [];   // travelers along edges
      this.trails = [];
      this.mouse = { x: null, y: null, inside: false };
      this.clickFlash = null;
      this.edgePing = null;

      // Loop control
      this._running = false;
      this._rafId = null;
      this._last = 0;
      this._frameInterval = this.opts.fpsCap > 0 ? 1000 / this.opts.fpsCap : 0;

      // Bind handlers
      this._onResize = this._onResize.bind(this);
      this._onMouseMove = this._onMouseMove.bind(this);
      this._onMouseLeave = this._onMouseLeave.bind(this);
      this._onClick = this._onClick.bind(this);
      this._tick = this._tick.bind(this);

      // Init
      this._onResize();
      this._reseedParticles(this._targetCount());
      this._seedSparks();

      window.addEventListener('resize', this._onResize, { passive: true });
      window.addEventListener('mousemove', this._onMouseMove, { passive: true });
      window.addEventListener('mouseleave', this._onMouseLeave, { passive: true });
      window.addEventListener('click', this._onClick, { passive: true });
    }

    destroy() {
      this.stop();
      window.removeEventListener('resize', this._onResize);
      window.removeEventListener('mousemove', this._onMouseMove);
      window.removeEventListener('mouseleave', this._onMouseLeave);
      window.removeEventListener('click', this._onClick);
    }

    start() {
      if (this._running) return;
      this._running = true;
      this._last = performance.now();
      this._rafId = requestAnimationFrame(this._tick);
    }

    stop() {
      this._running = false;
      if (this._rafId) cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }

    // --- Internal: sizing and particles ---

    _onResize() {
      const cssW = this.canvas.clientWidth || window.innerWidth;
      const cssH = this.canvas.clientHeight || window.innerHeight;

      this.w = cssW;
      this.h = cssH;
      this.cx = this.w / 2;
      this.cy = this.h / 2;

      // Scale canvas to DPR while keeping drawing units in CSS pixels
      this.canvas.width = Math.round(cssW * this.dpr);
      this.canvas.height = Math.round(cssH * this.dpr);
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

      // Adjust particle count smoothly
      this._adjustParticleCount(this._targetCount());
      // Re-seed sparks to fit edge density after resize
      this._seedSparks(true);
    }

    _targetCount() {
      const { density, minParticles, maxParticles } = this.opts;
      const area = Math.max(1, this.w * this.h);
      const estimate = Math.round(area / density);
      return clamp(estimate, minParticles, maxParticles);
    }

    _reseedParticles(n) {
      this.particles = [];
      for (let i = 0; i < n; i++) this.particles.push(this._makeParticle());
    }

    _adjustParticleCount(target) {
      const cur = this.particles.length;
      if (cur === target) return;
      if (cur < target) {
        const add = target - cur;
        for (let i = 0; i < add; i++) this.particles.push(this._makeParticle());
      } else {
        this.particles.length = target;
      }
    }

    _makeParticle() {
      const { dotRadius, speed, speedZ, zRange } = this.opts;
      const [rMin, rMax] = dotRadius;
      return {
        // World coords (not projected)
        x: rand(0, this.w),
        y: rand(0, this.h),
        z: rand(zRange[0], zRange[1]),

        // Velocity in world space
        vx: rand(-speed, speed),
        vy: rand(-speed, speed),
        vz: rand(-speedZ, speedZ),

        r: rand(rMin, rMax)
      };
    }

    // --- Sparks (travelers) ---

    _seedSparks(reset = false) {
      const { sparkCount, sparkSize, sparkSpeed, sparkLife } = this.opts;
      if (reset) this.sparks.length = 0;
      const need = sparkCount - this.sparks.length;
      for (let i = 0; i < need; i++) {
        this.sparks.push({
          a: 0, b: 0, // indices of particle endpoints; will be assigned later
          t: Math.random(),
          dir: Math.random() < 0.5 ? -1 : 1,
          speed: rand(sparkSpeed[0], sparkSpeed[1]), // px/sec
          size: rand(sparkSize[0], sparkSize[1]),
          born: performance.now(),
          life: rand(sparkLife[0], sparkLife[1]) * 1000 // ms
        });
      }
    }

    _assignSparkEdge(spark) {
      // Assign spark to a random existing edge if available
      if (!this.edges.length) return false;
      const e = choice(this.edges);
      spark.a = e.i;
      spark.b = e.j;
      // Re-randomize direction and start point
      spark.dir = Math.random() < 0.5 ? -1 : 1;
      spark.t = Math.random();
      spark.born = performance.now();
      return true;
    }

    // --- Input handlers ---

    _onMouseMove(e) {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
      this.mouse.inside = true;

      // Edge pings
      const m = 8;
      const now = performance.now();
      if (this.mouse.x <= m) this.edgePing = { side: 'L', t: now };
      else if (this.mouse.x >= this.w - m) this.edgePing = { side: 'R', t: now };
      else if (this.mouse.y <= m) this.edgePing = { side: 'T', t: now };
      else if (this.mouse.y >= this.h - m) this.edgePing = { side: 'B', t: now };
    }

    _onMouseLeave() {
      this.mouse.x = null;
      this.mouse.y = null;
      this.mouse.inside = false;
    }

    _onClick(e) {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const t = performance.now();
      this.clickFlash = { x, y, t };
      this.trails.push({ x, y, t });
    }

    // --- Loop ---

    _tick(now) {
      if (!this._running) return;

      const elapsed = now - this._last;
      if (this._frameInterval && elapsed < this._frameInterval) {
        this._rafId = requestAnimationFrame(this._tick);
        return;
      }
      this._last = now;

      this.update(elapsed);
      this.draw();

      this._rafId = requestAnimationFrame(this._tick);
    }

    // --- Simulation ---

    update(dtMs) {
      const dt = dtMs / 1000;            // seconds
      const frameScale = dt * 60;        // normalize relative to 60fps
      const { drift, speed, speedZ, wrap, repelRadius, repelForce, zRange } = this.opts;

      const mouseActive = this.mouse.inside && this.mouse.x !== null && this.mouse.y !== null;

      // Update particles
      for (const p of this.particles) {
        // Random drift (small perturbation)
        p.vx += (Math.random() - 0.5) * drift * frameScale;
        p.vy += (Math.random() - 0.5) * drift * frameScale;
        p.vz += (Math.random() - 0.5) * (drift * 0.35) * frameScale;

        // Mouse repel in XY plane (world space approximation)
        if (mouseActive) {
          // Map mouse to world plane with subtle parallax bias
          const dx = p.x - this.mouse.x;
          const dy = p.y - this.mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 0 && dist < repelRadius) {
            const strength = repelForce * (1 - dist / repelRadius) * frameScale;
            p.vx += (dx / dist) * strength;
            p.vy += (dy / dist) * strength;
          }
        }

        // Limit speed in 3D (cap vector magnitude)
        const vmag = Math.hypot(p.vx, p.vy, p.vz * 2); // weigh Z slightly
        const maxV = Math.max(speed, 0.0001);
        if (vmag > maxV) {
          const scale = maxV / vmag;
          p.vx *= scale;
          p.vy *= scale;
          p.vz *= scale;
        }

        // Integrate world position
        p.x += p.vx * frameScale;
        p.y += p.vy * frameScale;
        p.z += p.vz * frameScale;

        // Bounds in XY
        if (wrap) {
          if (p.x < -2) p.x = this.w + 2;
          else if (p.x > this.w + 2) p.x = -2;
          if (p.y < -2) p.y = this.h + 2;
          else if (p.y > this.h + 2) p.y = -2;
        } else {
          if (p.x < 0) { p.x = 0; p.vx *= -1; }
          if (p.x > this.w) { p.x = this.w; p.vx *= -1; }
          if (p.y < 0) { p.y = 0; p.vy *= -1; }
          if (p.y > this.h) { p.y = this.h; p.vy *= -1; }
        }

        // Bounds in Z
        if (p.z < zRange[0]) {
          if (wrap) p.z = zRange[1];
          else { p.z = zRange[0]; p.vz *= -1; }
        } else if (p.z > zRange[1]) {
          if (wrap) p.z = zRange[0];
          else { p.z = zRange[1]; p.vz *= -1; }
        }
      }

      // Build neighbor edges via uniform grid (performance)
      this._buildEdges();

      // Update sparks (travelers)
      this._updateSparks(dtMs);
    }

    _buildEdges() {
      const { lineMaxDistance, use3D } = this.opts;
      const cell = Math.max(16, Math.floor(lineMaxDistance));
      const grid = new Map(); // key "gx,gy" -> array of indices

      const keyOf = (x, y) => `${x},${y}`;

      // Place particles in grid by XY world coords
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        const gx = Math.floor(p.x / cell);
        const gy = Math.floor(p.y / cell);
        const k = keyOf(gx, gy);
        if (!grid.has(k)) grid.set(k, []);
        grid.get(k).push(i);
      }

      const neighborOffsets = [
        [0, 0], [1, 0], [0, 1], [1, 1], [-1, 0], [0, -1], [-1, -1], [1, -1], [-1, 1]
      ];

      const edges = [];
      for (const [k, indices] of grid.entries()) {
        const [gxStr, gyStr] = k.split(',');
        const gx = parseInt(gxStr, 10);
        const gy = parseInt(gyStr, 10);

        // Collect candidates from this cell and neighbors
        const cand = [...indices];
        for (const [ox, oy] of neighborOffsets) {
          const nk = keyOf(gx + ox, gy + oy);
          if (grid.has(nk)) {
            for (const idx of grid.get(nk)) cand.push(idx);
          }
        }

        // Deduplicate candidates and pair
        const unique = Array.from(new Set(cand)).sort((a, b) => a - b);
        for (let ii = 0; ii < unique.length; ii++) {
          const i = unique[ii];
          const a = this.particles[i];
          for (let jj = ii + 1; jj < unique.length; jj++) {
            const j = unique[jj];
            const b = this.particles[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dz = use3D ? (a.z - b.z) : 0;
            const dist = Math.hypot(dx, dy, dz);
            if (dist < lineMaxDistance) {
              edges.push({ i, j, dist });
            }
          }
        }
      }

      this.edges = edges;
    }

    _updateSparks(dtMs) {
      const { sparkLife } = this.opts;
      const dt = dtMs / 1000;

      for (const s of this.sparks) {
        // Re-seed if no valid edge assigned or expired
        const expired = (performance.now() - s.born) > (s.life || 3000);
        if (expired || !this._edgeExists(s.a, s.b)) {
          // Randomize new life for variety
          s.life = rand(sparkLife[0], sparkLife[1]) * 1000;
          if (!this._assignSparkEdge(s)) continue;
        }

        // Move t along edge
        const e = this._getEdge(s.a, s.b);
        if (!e) {
          // try to reassign on next frame
          continue;
        }

        const length = Math.max(1, e.dist);
        const deltaT = (s.speed * dt) / length; // distance over length
        s.t += deltaT * s.dir;

        if (s.t <= 0 || s.t >= 1) {
          // Flip direction or hop to a new edge
          if (Math.random() < 0.6) {
            s.dir *= -1;
            s.t = clamp(s.t, 0, 1);
          } else {
            this._assignSparkEdge(s);
          }
        }
      }
    }

    _edgeExists(a, b) {
      // Quick check using a small cache map could help; linear is fine given capped edges
      for (const e of this.edges) if ((e.i === a && e.j === b) || (e.i === b && e.j === a)) return true;
      return false;
    }

    _getEdge(a, b) {
      for (const e of this.edges) if ((e.i === a && e.j === b) || (e.i === b && e.j === a)) return e;
      return null;
    }

    // --- Projection & rendering helpers ---

    _project(p, parallaxTarget = null) {
      const { use3D, fov, zRange, parallax } = this.opts;
      const cx = this.cx, cy = this.cy;

      // Base input coords
      let x = p.x, y = p.y, z = p.z;

      // Mouse parallax (subtle nudge of world coords)
      if (parallaxTarget && this.mouse.inside) {
        const mx = this.mouse.x - cx;
        const my = this.mouse.y - cy;
        x += mx * parallax * ((z - zRange[0]) / (zRange[1] - zRange[0]) - 0.5);
        y += my * parallax * ((z - zRange[0]) / (zRange[1] - zRange[0]) - 0.5);
      }

      if (!use3D) {
        return { x, y, s: 1, depthAlpha: 1 };
      }

      // Perspective projection around center
      const s = fov / (fov + (z - 0)); // z relative to viewer plane 0
      const px = (x - cx) * s + cx;
      const py = (y - cy) * s + cy;

      // Depth-based alpha factor (nearer => brighter)
      const depthNorm = (z - zRange[0]) / (zRange[1] - zRange[0]); // 0..1
      const depthAlpha = clamp(1.25 - depthNorm, 0.4, 1.0);

      return { x: px, y: py, s, depthAlpha };
    }

    // --- Rendering ---

    draw() {
      const { ctx, particles, opts, mouse, edges } = this;

      // Clear frame
      ctx.clearRect(0, 0, this.w, this.h);

      // Precompute projected positions this frame
      const proj = particles.map(p => this._project(p, true));

      // Particles
      ctx.fillStyle = opts.dotColor;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const pr = proj[i];
        const sizeScale = 0.7 + 0.6 * pr.s; // depth-based size boost
        const r = p.r * sizeScale;

        if (opts.depthFade) ctx.globalAlpha = pr.depthAlpha;
        ctx.beginPath();
        ctx.arc(pr.x, pr.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Lines between particles
      ctx.lineWidth = opts.lineWidth;
      for (const e of edges) {
        const a = proj[e.i];
        const b = proj[e.j];

        // Distance-based alpha (fades as it approaches threshold) + depth blending
        const fade = 1 - (e.dist / opts.lineMaxDistance);
        const depth = opts.depthFade ? Math.min(a.depthAlpha, b.depthAlpha) : 1;
        const alpha = clamp(fade * 0.9 * depth, 0, 1);

        ctx.strokeStyle = opts.lineColor;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Hover links to mouse
      if (mouse.x !== null && opts.hoverLinkDistance) {
        ctx.strokeStyle = opts.lineColor;
        for (let i = 0; i < particles.length; i++) {
          const pr = proj[i];
          const dx = pr.x - mouse.x, dy = pr.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < opts.hoverLinkDistance) {
            const fade = 1 - (dist / opts.hoverLinkDistance);
            const alpha = clamp(fade * 0.7 * (opts.depthFade ? proj[i].depthAlpha : 1), 0, 1);
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.moveTo(pr.x, pr.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
        ctx.globalAlpha = 1;
      }

      // Sparks traveling along lines
      ctx.fillStyle = opts.sparkColor;
      for (const s of this.sparks) {
        const e = this._getEdge(s.a, s.b);
        if (!e) continue;
        const pa = particles[e.i];
        const pb = particles[e.j];

        // Interpolate in world space then project
        const t = clamp(s.t, 0, 1);
        const sx = pa.x + (pb.x - pa.x) * t;
        const sy = pa.y + (pb.y - pa.y) * t;
        const sz = pa.z + (pb.z - pa.z) * t;
        const pr = this._project({ x: sx, y: sy, z: sz }, true);

        const sizeScale = 0.7 + 0.6 * pr.s;
        const r = s.size * sizeScale;

        // Alpha: inherit line fade and depth
        const depthAlpha = opts.depthFade ? pr.depthAlpha : 1;
        ctx.globalAlpha = clamp(0.85 * depthAlpha, 0, 1);
        ctx.beginPath();
        ctx.arc(pr.x, pr.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Click flash
      if (this.clickFlash && performance.now() - this.clickFlash.t < 340) {
        const alpha = 1 - (performance.now() - this.clickFlash.t) / 340;
        ctx.beginPath();
        ctx.arc(this.clickFlash.x, this.clickFlash.y, 48 * alpha, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.12 * alpha})`;
        ctx.fill();
      }

      // Edge ping
      if (this.edgePing && performance.now() - this.edgePing.t < 800) {
        const alpha = 1 - (performance.now() - this.edgePing.t) / 800;
        const s = this.edgePing.side;
        ctx.fillStyle = `rgba(255,255,255,${0.08 * alpha})`;
        if (s === 'L') ctx.fillRect(0, 0, 8, this.h);
        else if (s === 'R') ctx.fillRect(this.w - 8, 0, 8, this.h);
        else if (s === 'T') ctx.fillRect(0, 0, this.w, 8);
        else if (s === 'B') ctx.fillRect(0, this.h - 8, this.w, 8);
      }

      // Trail pulses
      const now = performance.now();
      this.trails = this.trails.filter(t => now - t.t < 600);
      for (const t of this.trails) {
        const age = now - t.t;
        const alpha = 1 - age / 600;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 4 + alpha * 6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.05 * alpha})`;
        ctx.fill();
      }
    }
  }

  window.Constellation = Constellation;
})();
