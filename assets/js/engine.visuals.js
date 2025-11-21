(() => {
  const engine = window.engine;

  function rand(min, max) { return Math.random() * (max - min) + min; }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a,b,t){ return a + (b - a) * t; }

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
        const r = cfg.repelRadius * (1 + (1.2 - this.z));
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
      const tw = 1 + 0.14 * Math.sin((now * 0.00068 * this.twinkleSpeed) + this.twinklePhase);
      const alpha = 0.55 * (this.z / 1.2) * tw;
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.beginPath();
      // olive / amber tinted cores for military feel
      ctx.fillStyle = `rgba(${160 + Math.round(40*(1-this.z))},${200 - Math.round(30*(1-this.z))},${110 - Math.round(15*(1-this.z))},${alpha})`;
      ctx.arc(this.x, this.y, this.size * (0.78 + 0.18 * this.z) * tw, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    drawGlowTo(ctx, now, glowColor) {
      const tw = 1 + 0.14 * Math.sin((now * 0.00068 * this.twinkleSpeed) + this.twinklePhase);
      const galpha = 0.18 * (this.z) * tw;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = `rgba(${glowColor[0]},${glowColor[1]},${glowColor[2]},${galpha})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, Math.max(4, this.size * 2.8), 0, Math.PI * 2);
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
    anomalyTimer: 0,
    radar: { angle: 0, speed: 0.0011 },
    worldImg: null,
    worldLoaded: false,
    mapBitmap: null,
    mapCanvas: null,

    init() {
      this.onResize(engine.modules.base.width, engine.modules.base.height, engine.modules.base.dpr);
      this.spawn();

      if (engine.config.bloomEnabled) {
        this.bloom = {
          canvas: document.createElement('canvas'),
          ctx: null,
          down: engine.config.bloomDownscale || 0.45,
          blurPx: engine.config.bloomBlurPx || 10,
          frameSkip: engine.config.bloomFrameSkip || 3,
          frameCounter: 0
        };
        this.bloom.ctx = this.bloom.canvas.getContext('2d');
      }

      // radar speed variance
      this.radar.speed = 0.0009 + Math.random() * 0.0012;

      // begin load of flat world map: try SVG then PNG fallback
      this._loadWorld('assets/img/world-flat.svg').catch(() => {
        // try png fallback if svg failed
        return this._loadWorld('assets/img/world-flat.png');
      }).catch(() => {
        console.warn('[visuals] world image not available — using procedural fallback');
        this.worldLoaded = false;
        this._generateFallbackMap();
      });
    },

    // robust fetch -> blob -> objectURL load to avoid cross-origin taint where possible
    async _loadWorld(url) {
      try {
        const res = await fetch(url, {cache: "no-cache"});
        if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
        const blob = await res.blob();
        const img = new Image();
        img.crossOrigin = "anonymous";
        const objectURL = URL.createObjectURL(blob);
        await new Promise((resolve, reject) => {
          img.onload = () => { resolve(); URL.revokeObjectURL(objectURL); };
          img.onerror = (e) => { URL.revokeObjectURL(objectURL); reject(e); };
          img.src = objectURL;
        });
        this.worldImg = img;
        this.worldLoaded = true;
        // create processed map now that image is loaded
        await this._processMapToBitmap();
        return true;
      } catch (err) {
        console.warn('[visuals] _loadWorld error', err);
        throw err;
      }
    },

    // create an offscreen processed image (contrast + edge emphasis + colorize)
    async _processMapToBitmap() {
      if (!this.worldImg) return;
      const w = Math.max(512, this.bounds.w);
      const h = Math.max(256, this.bounds.h);
      // create mapCanvas sized to viewport for best quality
      const mapCanvas = document.createElement('canvas');
      mapCanvas.width = w;
      mapCanvas.height = h;
      const mctx = mapCanvas.getContext('2d', { willReadFrequently: true });
      // draw image to cover area (centered & cover)
      // preserve aspect: draw image so entire canvas filled, cropping if necessary
      const iw = this.worldImg.width;
      const ih = this.worldImg.height;
      const scale = Math.max(w / iw, h / ih);
      const dw = Math.round(iw * scale);
      const dh = Math.round(ih * scale);
      const ox = Math.round((w - dw) * 0.5);
      const oy = Math.round((h - dh) * 0.5);
      mctx.clearRect(0,0,w,h);
      mctx.drawImage(this.worldImg, ox, oy, dw, dh);

      // get image data and run a lightweight enhancement
      try {
        const id = mctx.getImageData(0,0,w,h);
        const d = id.data;
        // compute luminance and perform a high-contrast + edge-ish mask
        const lum = new Float32Array(w*h);
        for (let i=0, p=0; i<d.length; i+=4, p++) {
          // luminance
          lum[p] = d[i]*0.2126 + d[i+1]*0.7152 + d[i+2]*0.0722;
        }
        // simple gradient magnitude for edges
        const edge = new Float32Array(w*h);
        for (let y=1; y<h-1; y++) {
          for (let x=1; x<w-1; x++) {
            const i = x + y*w;
            const gx = -lum[i-w-1] - 2*lum[i-1] - lum[i+w-1] + lum[i-w+1] + 2*lum[i+1] + lum[i+w+1];
            const gy = -lum[i-w-1] - 2*lum[i-w] - lum[i-w+1] + lum[i+w-1] + 2*lum[i+w] + lum[i+w+1];
            const mag = Math.sqrt(gx*gx + gy*gy);
            edge[i] = mag;
          }
        }
        // normalize edge and write colorized result into new image
        const out = mctx.createImageData(w,h);
        const outd = out.data;
        // color tone for military (olive tint)
        const baseR = 36, baseG = 58, baseB = 24; // dark olive base
        const landR = 160, landG = 200, landB = 110; // lighter olive for land
        // compute min/max edge to normalize
        let emax = 0;
        for (let i=0;i<edge.length;i++) if (edge[i] > emax) emax = edge[i];
        const en = emax > 0 ? 1 / emax : 0;
        for (let y=0, p=0; y<h; y++) {
          for (let x=0; x<w; x++, p++) {
            const L = lum[p] / 255;
            // make land brighter where luminance high
            const landFactor = clamp((L - 0.15) * 1.4, 0, 1);
            // edge strength normalized
            const edgeStrength = clamp(edge[p] * en * 3.5, 0, 1);
            // color mix: base + land tint
            const r = Math.round(lerp(baseR, landR, landFactor));
            const g = Math.round(lerp(baseG, landG, landFactor));
            const b = Math.round(lerp(baseB, landB, landFactor));
            // alpha: preserve strong land but allow sea to be translucent
            const alpha = 0.18 + 0.36 * landFactor + 0.42 * edgeStrength;
            outd[p*4] = r;
            outd[p*4+1] = g;
            outd[p*4+2] = b;
            outd[p*4+3] = Math.round(clamp(alpha, 0, 1) * 255);
          }
        }
        mctx.putImageData(out, 0, 0);
      } catch (e) {
        // if getImageData is blocked (CORS), just keep raw draw and warn
        console.warn('[visuals] map processing skipped (possible CORS):', e);
      }

      // create an ImageBitmap for fast drawing
      try {
        if (self.createImageBitmap) {
          this.mapBitmap = await createImageBitmap(mapCanvas);
        } else {
          // fallback to using the canvas as source
          this.mapBitmap = mapCanvas;
        }
        this.mapCanvas = mapCanvas;
      } catch (e) {
        this.mapBitmap = mapCanvas;
        this.mapCanvas = mapCanvas;
      }
    },

    _generateFallbackMap() {
      // create a simple stylized silhouette as fallback
      const w = Math.max(512, this.bounds.w);
      const h = Math.max(256, this.bounds.h);
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const cx = c.getContext('2d');
      cx.fillStyle = 'rgba(20,40,14,0.16)';
      cx.fillRect(0,0,w,h);
      cx.fillStyle = '#e9f0d4';
      cx.beginPath();
      cx.moveTo(w*0.05, h*0.45);
      cx.bezierCurveTo(w*0.18,h*0.28, w*0.32,h*0.28, w*0.46,h*0.36);
      cx.bezierCurveTo(w*0.6,h*0.44, w*0.68,h*0.62, w*0.78,h*0.6);
      cx.bezierCurveTo(w*0.88,h*0.58, w*0.92,h*0.42, w*0.97,h*0.38);
      cx.bezierCurveTo(w*0.8,h*0.44, w*0.6,h*0.48, w*0.44,h*0.6);
      cx.bezierCurveTo(w*0.32,h*0.7, w*0.18,h*0.68, w*0.05,h*0.55);
      cx.closePath();
      cx.fill();
      // produce bitmap
      try {
        if (self.createImageBitmap) this.mapBitmap = createImageBitmap(c);
        else this.mapBitmap = c;
        this.mapCanvas = c;
      } catch (e) {
        this.mapBitmap = c;
        this.mapCanvas = c;
      }
    },

    onResize(w, h, dpr) {
      this.bounds.w = w;
      this.bounds.h = h;
      const area = w * h;
      const target = Math.min(engine.config.maxParticles, Math.ceil(area * engine.config.baseParticleDensity));
      this.targetCount = target || 100;
      this.cellSize = Math.max(56, Math.floor(engine.config.linkDistance * 0.9));
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

      // if world image was loaded, reprocess to match new size
      if (this.worldLoaded) {
        this._processMapToBitmap().catch((e) => {
          console.warn('[visuals] reprocess map failed', e);
        });
      } else if (this.mapCanvas) {
        // regenerate fallback to new size
        this._generateFallbackMap();
      }
    },

    spawn() {
      const cfg = engine.config;
      const need = (this.targetCount ?? 120);
      const current = this.particles.length;
      for (let i = current; i < need; i++) {
        this.particles.push(new Particle(this.bounds.w, this.bounds.h, cfg));
      }
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
      for (let ox = -1; ox <= 1; ox++) {
        for (let oy = -1; oy <= 1; oy++) {
          const key = (ix + ox) + ',' + (iy + oy);
          const bucket = this.grid.get(key);
          if (bucket) list.push(...bucket);
        }
      }
      return list;
    },

    tick(dt) {
      if ((this.particles.length | 0) !== (this.targetCount | 0)) this.spawn();

      const ctx = engine.state.ctx;
      const cfg = engine.config;
      const now = performance.now();
      const fps = engine.state.fps || 60;
      const linkEnabled = fps > 18;

      // update radar angle
      if (cfg.militaryMode) this.radar.angle += this.radar.speed * dt;

      // anomaly timer
      this.anomalyTimer -= dt;
      if (this.anomalyTimer <= 0) {
        this.anomalyTimer = 7000 + Math.random() * 18000;
        this._triggerAnomaly = now;
      }

      // update particles
      for (let i = 0; i < this.particles.length; i++) {
        this.particles[i].step(dt, this.bounds, engine.state.mouse, cfg, now);
      }

      // draw background world map (processed bitmap) with parallax and tint
      if (this.mapBitmap) {
        ctx.save();
        const mx = (engine.state.mouse.x != null ? engine.state.mouse.x : this.bounds.w * 0.5);
        const my = (engine.state.mouse.y != null ? engine.state.mouse.y : this.bounds.h * 0.5);
        const ox = (mx - this.bounds.w * 0.5) / this.bounds.w * 28; // parallax
        const oy = (my - this.bounds.h * 0.5) / this.bounds.h * 12;
        ctx.globalAlpha = 0.36;
        ctx.globalCompositeOperation = 'screen';
        try {
          ctx.drawImage(this.mapBitmap, -ox, -oy, this.bounds.w + Math.abs(ox)*2, this.bounds.h + Math.abs(oy)*2);
        } catch (e) {
          // fallback: draw canvas directly if mapBitmap is canvas
          try { ctx.drawImage(this.mapCanvas, -ox, -oy, this.bounds.w + Math.abs(ox)*2, this.bounds.h + Math.abs(oy)*2); } catch (e2) {}
        }
        // darken seas / tint
        ctx.fillStyle = 'rgba(14,28,10,0.14)';
        ctx.fillRect(0,0,this.bounds.w,this.bounds.h);
        ctx.restore();
      }

      // subtle tactical overlay: faint lat/lon-like grid and concentric rings centered on screen
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineWidth = 0.4;
      ctx.strokeStyle = 'rgba(90,110,70,0.06)';
      const cols = 12;
      const rows = 8;
      for (let i = 1; i < cols; i++) {
        const x = (this.bounds.w / cols) * i;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, this.bounds.h); ctx.stroke();
      }
      for (let j = 1; j < rows; j++) {
        const y = (this.bounds.h / rows) * j;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.bounds.w, y); ctx.stroke();
      }
      // concentric rings for radar feel
      const cx = this.bounds.w * 0.5;
      const cy = this.bounds.h * 0.5;
      const maxR = Math.max(this.bounds.w, this.bounds.h) * 0.78;
      for (let r = maxR * 0.12; r < maxR; r += maxR * 0.18) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // build grid if links enabled
      if (linkEnabled) this.buildGrid();

      // bloom: render glows offscreen periodically
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
            boc.fillStyle = `rgba(${r},${g},${bcol},${0.08 * p.z})`;
            boc.beginPath();
            boc.arc(p.x, p.y, Math.max(6, p.size * 3.4), 0, Math.PI*2);
            boc.fill();
          }
          boc.restore();
        }
      }

      // draw particle cores
      for (let i = 0; i < this.particles.length; i++) {
        this.particles[i].drawCore(ctx, now);
      }

      // draw links between neighbors
      if (linkEnabled) {
        ctx.save();
        ctx.lineCap = 'round';
        for (let i = 0; i < this.particles.length; i++) {
          const a = this.particles[i];
          const neighbors = this.neighborsFor(a);
          for (let j = 0; j < neighbors.length; j++) {
            const b = neighbors[j];
            if (a === b) continue;
            const dx = a.x - b.x, dy = a.y - b.y;
            const d2 = dx*dx + dy*dy;
            const maxD = cfg.linkDistance;
            if (d2 <= maxD * maxD) {
              const d = Math.sqrt(d2);
              const depthFactor = (a.z + b.z) * 0.5;
              const baseAlpha = cfg.linkOpacity * 1.4;
              const alpha = Math.max(0, baseAlpha * (1 - d / maxD) * depthFactor);
              if (alpha > 0.02) {
                // olive-ish line color
                const r = Math.round(90 + 30 * (1 - depthFactor));
                const g = Math.round(130 + 40 * depthFactor);
                const bl = Math.round(60 + 30 * depthFactor);
                ctx.strokeStyle = `rgba(${r},${g},${bl},${alpha})`;
                ctx.lineWidth = 0.8 + (0.9 * depthFactor);
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
              }
            }
          }
        }
        ctx.restore();
      }

      // composite bloom onto main canvas for scary glow
      if (this.bloom && this.bloom.canvas) {
        ctx.save();
        if (ctx.filter !== undefined) ctx.filter = `blur(${this.bloom.blurPx}px)`;
        ctx.globalCompositeOperation = 'lighter';
        ctx.drawImage(this.bloom.canvas, 0, 0, this.bounds.w, this.bounds.h);
        ctx.globalCompositeOperation = 'source-over';
        ctx.filter = 'none';
        ctx.restore();
      }

      // sharp per-particle glows
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        const cool = [120,170,100], warm = [200,220,120];
        const depth = clamp((p.z - 0.6) / (1.6 - 0.6), 0, 1);
        const mix = clamp(0.6 + p.tempBias * 0.25 + (depth * 0.12), 0, 1);
        const glowColor = [Math.round(lerp(warm[0], cool[0], mix)), Math.round(lerp(warm[1], cool[1], mix)), Math.round(lerp(warm[2], cool[2], mix))];
        p.drawGlowTo(ctx, now, glowColor);
      }

      // radar sweep — pronounced, eerie, and centered
      if (cfg.militaryMode) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const angle = this.radar.angle;
        const sweep = Math.PI * 0.10; // tighter sweep for tactical look
        const g = ctx.createRadialGradient(cx, cy, maxR * 0.02, cx, cy, maxR);
        g.addColorStop(0, 'rgba(220,255,160,0.16)');
        g.addColorStop(1, 'rgba(20,30,10,0.0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, maxR, angle - sweep * 0.5, angle + sweep * 0.5);
        ctx.closePath();
        ctx.fill();

        // sharper sweep line
        ctx.strokeStyle = 'rgba(220,255,160,0.14)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
        ctx.stroke();
        ctx.restore();
      }

      // anomaly flash (subtle, ominous)
      if (this._triggerAnomaly && (now - this._triggerAnomaly) < 900) {
        const t = (now - this._triggerAnomaly) / 900;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = `rgba(180,200,100,${0.08 * (1 - t)})`;
        const ax = Math.random() * this.bounds.w;
        const ay = Math.random() * this.bounds.h;
        ctx.beginPath();
        ctx.arc(ax, ay, (this.bounds.w + this.bounds.h) * (0.02 + 0.06 * (1 - t)), 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
        if ((now - this._triggerAnomaly) > 800) this._triggerAnomaly = null;
      }

      // click feedback (very subtle)
      if (engine.state.mouse.down && engine.state.mouse.x != null) {
        const m = engine.state.mouse;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = 'rgba(200,230,140,0.04)';
        ctx.beginPath();
        ctx.arc(m.x, m.y, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  });

  engine.markReady("visuals");
})();
