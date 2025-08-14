export function startConstellation2D() {
  const canvas = document.getElementById("constellationCanvas");
  const ctx = canvas.getContext("2d");

  let w = window.innerWidth;
  let h = window.innerHeight;
  canvas.width = w * window.devicePixelRatio;
  canvas.height = h * window.devicePixelRatio;
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);

  // Responsive resize
  window.addEventListener("resize", () => {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * window.devicePixelRatio;
    canvas.height = h * window.devicePixelRatio;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  });

  // Parameters for advanced look
  const PARTICLE_COUNT = 96;
  const PARTICLE_SIZE = 2.1;
  const PARTICLE_COLOR = "#6fc2ff";
  const LINK_COLOR = "#a8e2ff";
  const LINK_DISTANCE = 84;
  const LINK_WIDTH = 1.1;
  const LINK_OPACITY = 0.17;
  const TRACER_COLOR = "#fff";
  const TRACER_SIZE = 1.15;
  const TRACER_OPACITY = 0.28;
  const TRACER_COUNT = 22;

  // Particle physics
  const particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * w * 0.75 + w * 0.125,
      y: Math.random() * h * 0.75 + h * 0.125,
      vx: (Math.random() - 0.5) * 0.48,
      vy: (Math.random() - 0.5) * 0.48,
    });
  }

  // Tracer "data packets" along links
  const tracers = [];
  function makeTracer() {
    // Pick two random particles close enough
    let a, b;
    do {
      a = Math.floor(Math.random() * PARTICLE_COUNT);
      b = Math.floor(Math.random() * PARTICLE_COUNT);
    } while (a === b || distance(particles[a], particles[b]) > LINK_DISTANCE);
    return {
      a, b,
      t: Math.random(),
      speed: 0.0035 + Math.random() * 0.003,
      forward: Math.random() < 0.5,
    };
  }
  for (let i = 0; i < TRACER_COUNT; i++) {
    tracers.push(makeTracer());
  }

  function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  // Main animation loop
  function animate() {
    ctx.clearRect(0, 0, w, h);

    // Vignette effect
    const grad = ctx.createRadialGradient(w / 2, h / 2, Math.max(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.8);
    grad.addColorStop(0, "#181d29");
    grad.addColorStop(1, "#0b0f16");
    ctx.fillStyle = grad;
    ctx.globalAlpha = 1;
    ctx.fillRect(0, 0, w, h);

    // Move particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      let p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      // Bounce softly within bounds
      if (p.x < w * 0.08 || p.x > w * 0.92) p.vx *= -1;
      if (p.y < h * 0.08 || p.y > h * 0.92) p.vy *= -1;

      // Random wander
      p.vx += (Math.random() - 0.5) * 0.011;
      p.vy += (Math.random() - 0.5) * 0.011;
      p.vx = clamp(p.vx, -0.48, 0.48);
      p.vy = clamp(p.vy, -0.48, 0.48);
    }

    // Draw links
    ctx.save();
    ctx.globalAlpha = LINK_OPACITY;
    ctx.lineWidth = LINK_WIDTH;
    ctx.strokeStyle = LINK_COLOR;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      for (let j = i + 1; j < PARTICLE_COUNT; j++) {
        let a = particles[i], b = particles[j];
        let d = distance(a, b);
        if (d < LINK_DISTANCE) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    ctx.restore();

    // Draw particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      let p = particles[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, PARTICLE_SIZE, 0, Math.PI * 2);
      ctx.fillStyle = PARTICLE_COLOR;
      ctx.shadowColor = "#fff";
      ctx.shadowBlur = 6;
      ctx.globalAlpha = 1;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Move and draw tracers
    for (let i = 0; i < tracers.length; i++) {
      let tr = tracers[i];
      tr.t += tr.speed * (tr.forward ? 1 : -1);
      if (tr.t > 1 || tr.t < 0) {
        tracers[i] = makeTracer();
        continue;
      }
      let a = particles[tr.a], b = particles[tr.b];
      let x = a.x + (b.x - a.x) * tr.t;
      let y = a.y + (b.y - a.y) * tr.t;

      ctx.beginPath();
      ctx.arc(x, y, TRACER_SIZE, 0, Math.PI * 2);
      ctx.fillStyle = TRACER_COLOR;
      ctx.globalAlpha = TRACER_OPACITY;
      ctx.shadowColor = "#fff";
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;

    requestAnimationFrame(animate);
  }

  animate();
}
