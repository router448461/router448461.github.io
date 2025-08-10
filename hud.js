// hud.js
(function () {
  const BG = (window.BG = window.BG || {});

  const state = {
    W: 0, H: 0,
    pulses: [],
    nextPulseAt: 0,
    core: { x: 0, y: 0, vx: 0, vy: 0 },
    mouse: { x: 0.5, y: 0.5 }
  };

  function nowSec(tNow) {
    return (tNow || performance.now()) / 1000;
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function dist(x1, y1, x2, y2) {
    const dx = x1 - x2, dy = y1 - y2;
    return Math.hypot(dx, dy);
  }

  // Grid
  function drawGrid(ctx, theme, W, H, time, CONFIG) {
    const spacing = CONFIG.gridSpacing;
    const alpha = BG.clamp(BG.theme.gridAlpha, 0, 0.25);
    if (alpha <= 0) return;

    const [r, g, b] = theme.gridRGB;
    ctx.save();
    ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
    ctx.lineWidth = 1;

    // Parallax based on mouse
    const px = (state.mouse.x - 0.5) * CONFIG.gridParallax * spacing * 10;
    const py = (state.mouse.y - 0.5) * CONFIG.gridParallax * spacing * 10;

    let x0 = Math.floor((-px) / spacing) * spacing + (-px % spacing);
    let y0 = Math.floor((-py) / spacing) * spacing + (-py % spacing);

    // Vertical lines
    ctx.beginPath();
    for (let x = x0; x <= W + spacing; x += spacing) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
    }
    // Horizontal lines
    for (let y = y0; y <= H + spacing; y += spacing) {
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  // Pulses
  function spawnPulse(atX, atY, threat, theme, CONFIG) {
    const rgb = threat ? theme.pulseThreatRGB : theme.pulseGoodRGB;
    state.pulses.push({
      x: atX, y: atY,
      r: 0,
      maxR: CONFIG.pulseMaxRadius,
      life: 0,
      lifeMax: 1.0,
      rgb,
      width: CONFIG.pulseWidth
    });
  }

  function updatePulses(dt, time, theme, CONFIG) {
    // Schedule new pulses
    if (time >= state.nextPulseAt) {
      const base = CONFIG.pulseIntervalSec;
      const jitter = (Math.random() * 2 - 1) * CONFIG.pulseJitterSec;
      state.nextPulseAt = time + Math.max(1.5, base + jitter);

      // 1) Core pulse
      spawnPulse(state.core.x, state.core.y, false, theme, CONFIG);
      // 2) Rare threat ping
      if (Math.random() < 0.25) {
        const x = Math.random() * state.W;
        const y = Math.random() * state.H;
        spawnPulse(x, y, true, theme, CONFIG);
      }
    }

    // Evolve pulses
    for (let i = state.pulses.length - 1; i >= 0; i--) {
      const p = state.pulses[i];
      p.life += dt * 0.5; // duration ~2s
      const t = BG.clamp(p.life / p.lifeMax, 0, 1);
      p.r = p.maxR * t;
      if (t >= 1) state.pulses.splice(i, 1);
    }
  }

  function drawPulses(ctx) {
    ctx.save();
    for (const p of state.pulses) {
      const t = BG.clamp(p.life / p.lifeMax, 0, 1);
      const a = (1 - t) * 0.35;
      ctx.strokeStyle = `rgba(${p.rgb[0]},${p.rgb[1]},${p.rgb[2]},${a})`;
      ctx.lineWidth = p.width;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Core node
  function updateCore(dt, W, H, CONFIG) {
    const cx = W * 0.5, cy = H * 0.5;
    // Drift slightly with mouse, but pulled back to center
    const targetX = lerp(cx, cx + (state.mouse.x - 0.5) * 30, 0.2);
    const targetY = lerp(cy, cy + (state.mouse.y - 0.5) * 30, 0.2);

    state.core.x = lerp(state.core.x, targetX, CONFIG.coreHoldStrength);
    state.core.y = lerp(state.core.y, targetY, CONFIG.coreHoldStrength);
  }

  function drawCore(ctx, theme, CONFIG, time) {
    const r = CONFIG.coreRadius;
    const glow = CONFIG.coreGlow;
    const [cr, cg, cb] = theme.coreRGB;

    // Glow
    const grad = ctx.createRadialGradient(state.core.x, state.core.y, r, state.core.x, state.core.y, glow);
    grad.addColorStop(0, `rgba(${cr},${cg},${cb},0.28)`);
    grad.addColorStop(1, `rgba(${cr},${cg},${cb},0.0)`);
    ctx.save();
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(state.core.x, state.core.y, glow, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Core dot
    ctx.save();
    ctx.fillStyle = `rgba(${cr},${cg},${cb},0.9)`;
    ctx.beginPath();
    ctx.arc(state.core.x, state.core.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Label proximity intensity
    const d = dist(state.mouse.x * state.W, state.mouse.y * state.H, state.core.x, state.core.y);
    const near = BG.clamp(1 - d / 180, 0, 1);
    ctx.save();
    ctx.font = '11px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = BG.theme.labelRGBA(0.35 + 0.45 * near);
    ctx.fillText('router448461', state.core.x, state.core.y + r + 6);
    ctx.restore();
  }

  // Ambient soft-light overlay
  function drawAmbient(ctx, W, H, theme, CONFIG, time) {
    const intensity = BG.clamp(CONFIG.ambientIntensity, 0, 0.35);
    if (intensity <= 0) return;

    const lfo = 0.6 + 0.4 * Math.sin(time * CONFIG.ambientLfoHz * Math.PI * 2);
    const a = intensity * lfo;

    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, `rgba(255,255,255,${a * 0.06})`);
    grad.addColorStop(0.5, `rgba(0,0,0,${a * 0.12})`);
    grad.addColorStop(1, `rgba(255,255,255,${a * 0.04})`);

    ctx.save();
    const prev = ctx.globalCompositeOperation;
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = prev;
    ctx.restore();
  }

  function drawDebug(ctx, fps, count, W, H) {
    ctx.save();
    ctx.font = '10px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
    ctx.fillStyle = BG.theme.textRGBA(0.6);
    ctx.textBaseline = 'top';
    ctx.fillText(`FPS ${Math.round(fps)}  •  P ${count}`, 10, 8);
    ctx.restore();
  }

  BG.hud = {
    init(W, H) {
      state.W = W; state.H = H;
      state.core.x = W * 0.5;
      state.core.y = H * 0.5;
      state.pulses.length = 0;
      state.nextPulseAt = nowSec() + 1.2;
    },
    update(dt, time, theme, CONFIG) {
      if (!CONFIG || !CONFIG.enableHUD) return;
      if (CONFIG.hud.pulses) updatePulses(dt, time, theme, CONFIG);
      if (CONFIG.hud.core) updateCore(dt, state.W, state.H, CONFIG);
    },
    draw(ctx, theme, CONFIG, W, H, time, fps, particleCount) {
      if (!CONFIG || !CONFIG.enableHUD) return;

      if (CONFIG.hud.grid) drawGrid(ctx, theme, W, H, time, CONFIG);
      if (CONFIG.hud.pulses) drawPulses(ctx);
      if (CONFIG.hud.core) drawCore(ctx, theme, CONFIG, time);
      if (CONFIG.hud.ambient) drawAmbient(ctx, W, H, theme, CONFIG, time);
      if (CONFIG.hud.debug) drawDebug(ctx, fps, particleCount, W, H);
    },
    mouseMove(x, y) {
      state.mouse.x = x; state.mouse.y = y;
    }
  };
})();
