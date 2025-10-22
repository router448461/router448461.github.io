(() => {
  const engine = window.engine;
  if (!engine) return;

  // Small helpers
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function rgbToStr(r, g, b, a = 1) { return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a})`; }
  function hexToRgb(hex) {
    const m = hex.replace('#','');
    const n = m.length === 3 ? m.split('').map(c=>c+c).join('') : m;
    const r = parseInt(n.slice(0,2),16), g = parseInt(n.slice(2,4),16), b = parseInt(n.slice(4,6),16);
    return [r,g,b];
  }

  // Hook into visuals if present, otherwise wait
  function wire() {
    const visuals = engine.modules.visuals;
    const base = engine.modules.base;
    if (!visuals || !base) return;

    // --- Offscreen bloom support (downsampled) ---
    visuals._bloom = {
      enabled: true,
      downscale: 0.5,       // render bloom at half resolution
      blurPx: 8,
      frameSkip: 3,         // only re-blur every N frames
      frameCounter: 0,
      canvas: null,
      ctx: null,
    };

    function ensureBloomCanvas() {
      const b = visuals._bloom;
      const w = Math.max(1, Math.floor(base.width * b.downscale));
      const h = Math.max(1, Math.floor(base.height * b.downscale));
      if (!b.canvas) {
        b.canvas = document.createElement('canvas');
        b.ctx = b.canvas.getContext('2d');
      }
      if (b.canvas.width !== Math.floor(w * base.dpr) || b.canvas.height !== Math.floor(h * base.dpr)) {
        b.canvas.width = Math.floor(w * base.dpr);
        b.canvas.height = Math.floor(h * base.dpr);
        b.canvas.style.width = w + 'px';
        b.canvas.style.height = h + 'px';
        b.ctx.setTransform(base.dpr,0,0,base.dpr,0,0);
      }
    }

    // Patch Particle.draw to use subtle color temperature mixing
    const warm = [255,210,170], cool = [132,197,255];
    const origParticleProto = visuals.particles && visuals.particles[0] ? Object.getPrototypeOf(visuals.particles[0]) : null;
    // Instead of rewriting class, monkeypatch by adding a drawWithTemp function used by visuals tick below

    // --- Weapon system state ---
    visuals._weapon = {
      projectiles: [],
      cooldown: 0,         // seconds
      heat: 0,
      heatRate: 0.6,       // heat/sec while firing
      coolRate: 0.35,      // heat/sec while idle
      maxHeat: 1.0,
      firing: false,
      lastFire: 0,
      fireInterval: 120,   // ms between shots
    };

    class Projectile {
      constructor(x,y,dx,dy) {
        this.x = x; this.y = y;
        this.vx = dx; this.vy = dy;
        this.life = 800; // ms
        this.t = 0;
        this.size = 2.2;
      }
      step(dt) {
        this.t += dt;
        this.x += this.vx * (dt/16.67);
        this.y += this.vy * (dt/16.67);
        return this.t < this.life;
      }
      draw(ctx) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const a = 1 - (this.t / this.life);
        // bright core
        ctx.fillStyle = `rgba(255,240,200,${0.9 * a})`;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size * 1.0, 0, Math.PI*2); ctx.fill();
        // tracer
        ctx.strokeStyle = `rgba(255,200,140,${0.28 * a})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(this.x - this.vx*0.6, this.y - this.vy*0.6); ctx.lineTo(this.x, this.y); ctx.stroke();
        ctx.restore();
      }
    }

    // Reticle / HUD: keep simple crosshair centered; togglable
    visuals._weapon.hudEnabled = true;

    // Fire function: spawn projectile from center toward pointer
    function fireOnce() {
      const s = visuals._weapon;
      const m = engine.state.mouse;
      const centerX = base.width * 0.5;
      const centerY = base.height * 0.5;
      const tx = (m.x != null ? m.x : centerX);
      const ty = (m.y != null ? m.y : centerY);
      const dx = tx - centerX;
      const dy = ty - centerY;
      const len = Math.sqrt(dx*dx + dy*dy) || 1;
      const speed = 5.2; // pixels per tick unit
      const vx = (dx / len) * speed;
      const vy = (dy / len) * speed;
      s.projectiles.push(new Projectile(centerX, centerY, vx, vy));
      s.lastFire = performance.now();
    }

    // Hook into visuals.tick by wrapping it: we cannot replace existing, so patch by adding a post-step handler
    const originalTick = visuals.tick.bind(visuals);
    visuals.tick = function (dt) {
      // Draw bloom pass before or after particle draws? We'll render glow-only to offscreen, blur, then composite after visuals draw
      const b = this._bloom;
      if (b.enabled) {
        ensureBloomCanvas();
        b.frameCounter++;
        // Render glow pass into offscreen at downscale resolution
        const off = b.ctx;
        off.clearRect(0,0, off.canvas.width / base.dpr, off.canvas.height / base.dpr);
        off.save();
        // scale coordinate system to match downscale
        off.scale(b.downscale, b.downscale);
        // Draw bright glows for each particle (cheap approximate)
        for (let i=0;i<this.particles.length;i++){
          const p = this.particles[i];
          const tw = 1 + 0.28 * Math.sin((performance.now()*0.001) + p.twinklePhase);
          const size = p.size * 1.6;
          // color temp lerp
          const bias = p.tempBias ?? (p.tempBias = (Math.random()*2-1)*0.35); // small stored bias
          const t = clamp((p.z-0.6)/(1.6-0.6), 0, 1); // depth
          const mix = clamp(0.5 + bias * 0.5 + (t*0.2), 0, 1);
          const r = lerp(warm[0], cool[0], mix);
          const g = lerp(warm[1], cool[1], mix);
          const bb = lerp(warm[2], cool[2], mix);
          off.fillStyle = rgbToStr(r,g,bb, 0.14 * (p.z) * tw);
          off.beginPath();
          off.arc(p.x, p.y, size, 0, Math.PI*2);
          off.fill();
        }
        off.restore();

        // Apply blur/composite every frameSkip frames (to save perf)
        if (b.frameCounter % b.frameSkip === 0) {
          // blur by drawing with ctx.filter if available: draw off to another temp and apply filter
          try {
            // Use the offscreen's context filter when drawing into main canvas (browser applies filter to drawImage)
            // We'll perform the blur when compositing down onto main ctx (below)
          } catch (e) { /* ignore */ }
        }
      }

      // ORIGINAL visuals tick (updates positions and draws particles and links)
      originalTick(dt);

      // After original draw, composite bloom onto main ctx
      if (b.enabled && b.canvas) {
        const main = engine.state.ctx;
        main.save();
        if (main.filter !== undefined) {
          main.filter = `blur(${b.blurPx}px)`; // apply blur on the compositing step
        } else {
          // fallback: do nothing; we still get glow but not blurred
        }
        main.globalCompositeOperation = 'lighter';
        // draw downscaled bloom onto full canvas
        // drawImage expects source size in pixels; since we set offscreen canvas DPI transform, draw it stretched
        main.drawImage(b.canvas, 0, 0, base.width, base.height);
        main.globalCompositeOperation = 'source-over';
        main.filter = 'none';
        main.restore();
      }

      // Weapon projectiles lifecycle
      const w = visuals._weapon;
      // handle firing (auto-fire while mouse down)
      if (engine.state.mouse.down && w.heat < w.maxHeat) {
        const now = performance.now();
        if (!w._lastShot || (now - w._lastShot) >= visuals._weapon.fireInterval) {
          fireOnce();
          w._lastShot = now;
          // heat
          w.heat = clamp(w.heat + (w.heatRate * (visuals._weapon.fireInterval/1000)), 0, w.maxHeat);
        }
      } else {
        // cooldown
        w.heat = clamp(w.heat - (w.coolRate * (dt/1000)), 0, w.maxHeat);
      }

      // step & draw projectiles
      if (w.projectiles.length) {
        const ctx = engine.state.ctx;
        for (let i = w.projectiles.length - 1; i >= 0; i--) {
          const pr = w.projectiles[i];
          const alive = pr.step(dt);
          pr.draw(ctx);
          // simple hit: check distance to nearest particle and spawn a tiny explosion
          for (let j = 0; j < this.particles.length; j++) {
            const p = this.particles[j];
            const dx = pr.x - p.x, dy = pr.y - p.y;
            if (dx*dx + dy*dy < (pr.size + p.size + 2) * (pr.size + p.size + 2)) {
              // hit particle: spawn a short flash & remove projectile
              // brief bright spot
              ctx.save();
              ctx.globalCompositeOperation = 'lighter';
              ctx.fillStyle = 'rgba(255,220,160,0.9)';
              ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, Math.PI*2); ctx.fill();
              ctx.restore();
              // nudge particle away to simulate impact
              p.vx += (pr.vx*0.6); p.vy += (pr.vy*0.6);
              w.projectiles.splice(i,1);
              break;
            }
          }
          if (!alive) w.projectiles.splice(i,1);
        }
      }

      // HUD: draw center reticle and heat bar
      if (visuals._weapon.hudEnabled) {
        const ctx = engine.state.ctx;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        // crosshair
        const cx = base.width * 0.5, cy = base.height * 0.5;
        ctx.strokeStyle = `rgba(255,230,180,0.9)`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(cx, cy, 10, 0, Math.PI*2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - 16, cy); ctx.lineTo(cx - 6, cy); ctx.moveTo(cx + 6, cy); ctx.lineTo(cx + 16, cy);
        ctx.moveTo(cx, cy - 16); ctx.lineTo(cx, cy - 6); ctx.moveTo(cx, cy + 6); ctx.lineTo(cx, cy + 16);
        ctx.stroke();

        // heat bar at bottom-left
        const bw = 160, bh = 8, bx = 18, by = base.height - 28;
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.fillRect(bx-2, by-2, bw+4, bh+4);
        ctx.fillStyle = 'rgba(60,60,60,0.9)';
        ctx.fillRect(bx, by, bw, bh);
        const pct = w.heat / w.maxHeat;
        ctx.fillStyle = `rgba(${200 + Math.round(55*pct)}, ${120 + Math.round(80*(1-pct))}, 60, 0.95)`; // warm when hot
        ctx.fillRect(bx, by, bw * pct, bh);
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.strokeRect(bx-2, by-2, bw+4, bh+4);
        ctx.restore();
      }
    };

    engine.log('Weapon extension wired into visuals');
  }

  // Wait for base + visuals
  engine.when(['base','visuals'], () => {
    wire();
    // Also add simple controls UI (mode + density)
    // Create overlay DOM
    const savedMode = localStorage.getItem('constellation:mode') || 'ambient';
    document.documentElement.dataset.mode = savedMode;
    const savedDensity = parseFloat(localStorage.getItem('constellation:density') || '') || null;
    if (savedDensity) engine.config.baseParticleDensity = savedDensity;

    // Minimal control panel (small unobtrusive)
    const panel = document.createElement('div');
    panel.style.position = 'fixed';
    panel.style.right = '12px';
    panel.style.top = '12px';
    panel.style.zIndex = 9999;
    panel.style.color = 'rgba(210,230,255,0.9)';
    panel.style.fontFamily = 'ui-sans-serif, system-ui';
    panel.style.fontSize = '12px';
    panel.style.backdropFilter = 'blur(6px)';
    panel.style.padding = '8px';
    panel.style.borderRadius = '8px';
    panel.style.background = 'rgba(6,8,12,0.26)';
    panel.style.display = 'grid';
    panel.style.gap = '6px';

    panel.innerHTML = `
      <div style="display:flex;gap:6px;align-items:center">
        <button data-mode="ambient">Ambient</button>
        <button data-mode="ops">Ops</button>
        <button data-mode="stealth">Stealth</button>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <label style="min-width:64px">Density</label>
        <input id="densityRange" type="range" min="0.00002" max="0.00022" step="0.00001" value="${engine.config.baseParticleDensity}">
      </div>
      <div style="font-size:11px;opacity:0.85">Click & hold to fire. Center is origin.</div>
    `;
    document.body.appendChild(panel);
    panel.querySelectorAll('button[data-mode]').forEach(b => {
      b.addEventListener('click', () => {
        const m = b.getAttribute('data-mode');
        document.documentElement.dataset.mode = m;
        localStorage.setItem('constellation:mode', m);
        // adjust config for modes
        if (m === 'stealth') {
          engine.config.baseParticleDensity = 0.000035;
          engine.config.linkOpacity = 0.06;
        } else if (m === 'ops') {
          engine.config.baseParticleDensity = 0.00012;
          engine.config.linkOpacity = 0.18;
        } else {
          engine.config.baseParticleDensity = 0.00008;
          engine.config.linkOpacity = 0.12;
        }
        // force visuals to resize/spawn to reflect density change
        engine.modules.visuals.onResize(engine.modules.base.width, engine.modules.base.height, engine.modules.base.dpr);
        engine.modules.visuals.spawn();
        localStorage.setItem('constellation:density', engine.config.baseParticleDensity);
      });
    });
    const range = panel.querySelector('#densityRange');
    range.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      engine.config.baseParticleDensity = v;
      localStorage.setItem('constellation:density', v);
      engine.modules.visuals.onResize(engine.modules.base.width, engine.modules.base.height, engine.modules.base.dpr);
      engine.modules.visuals.spawn();
    });
  });
})();
