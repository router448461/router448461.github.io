window.addEventListener('load', () => {
  const ACCENT = [255, 43, 43];

  const THEME = {
    particleRGBA: (a = 0.9) => `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},${a})`,
    lineRGB: ACCENT,
    lineMaxAlpha: 0.82,
    lineWidth: 0.8
  };

  const canvas = document.getElementById('background');
  const ctx = canvas.getContext('2d');

  let vw = window.innerWidth;
  let vh = window.innerHeight;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let particles = [];
  let lastTime = 0;

  function linkDistance() {
    const base = Math.min(vw, vh);
    const v = 0.12 * base + 60;
    return Math.max(90, Math.min(160, v));
  }

  function targetCount() {
    const area = vw * vh;
    const density = area / 40000;
    return Math.max(36, Math.min(120, Math.round(density)));
  }

  function resizeCanvas(preserve = true) {
    const oldW = vw;
    const oldH = vh;
    vw = window.innerWidth;
    vh = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.style.width = vw + 'px';
    canvas.style.height = vh + 'px';
    canvas.width = Math.floor(vw * dpr);
    canvas.height = Math.floor(vh * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (preserve && particles.length) {
      const sx = oldW ? vw / oldW : 1;
      const sy = oldH ? vh / oldH : 1;
      for (let p of particles) {
        p.x *= sx;
        p.y *= sy;
      }
    }
    adjustDensity();
  }

  function addParticles(n) {
    for (let i = 0; i < n; i++) {
      particles.push({
        x: Math.random() * vw,
        y: Math.random() * vh,
        vx: (Math.random() - 0.5) * 80,
        vy: (Math.random() - 0.5) * 80,
        r: 1.3 + Math.random() * 0.6
      });
    }
  }

  function adjustDensity() {
    const target = targetCount();
    if (particles.length < target) addParticles(target - particles.length);
    else if (particles.length > target) particles.length = target;
  }

  function update(dt) {
    for (let p of particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.x < 0 || p.x > vw) p.vx *= -1;
      if (p.y < 0 || p.y > vh) p.vy *= -1;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, vw, vh);
    for (let p of particles) {
      ctx.fillStyle = THEME.particleRGBA();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    const maxDist = linkDistance();
    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < maxDist) {
          const alpha = THEME.lineMaxAlpha * (1 - dist / maxDist);
          ctx.strokeStyle = `rgba(${THEME.lineRGB[0]},${THEME.lineRGB[1]},${THEME.lineRGB[2]},${alpha})`;
          ctx.lineWidth = THEME.lineWidth;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
  }

  function loop(ts) {
    if (!lastTime) lastTime = ts;
    const dt = Math.min((ts - lastTime) / 1000, 0.05);
    lastTime = ts;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', () => resizeCanvas(true));
  document.addEventListener('visibilitychange', () => { lastTime = performance.now(); });

  resizeCanvas(false);
  particles = [];
  addParticles(targetCount());
  lastTime = 0;
  requestAnimationFrame(loop);
});
