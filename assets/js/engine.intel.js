(() => {
  const engine = window.engine;
  const samples = [];
  let last = performance.now();

  const mod = (engine.modules.intel = {
    start() {
      engine.log("Intel online");

      // FPS sampler (moving average over 60 frames)
      const pulse = (now) => {
        const dt = now - last;
        last = now;
        samples.push(dt);
        if (samples.length > 60) samples.shift();
        const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
        const fps = Math.round(1000 / (avg || 16.7));
        engine.state.fps = fps;
        requestAnimationFrame(pulse);
      };
      requestAnimationFrame(pulse);

      // Basic interaction trace
      document.addEventListener("click", (e) => {
        engine.log(`click @ ${e.clientX},${e.clientY} fps=${engine.state.fps}`);
      });

      // Startup timing
      const t1 = performance.now();
      engine.log(`boot window: ${Math.round(t1 - engine.t0)}ms`);
    },

    logEarthClick() {
      engine.log(`earth_click fps=${engine.state.fps}`);
    }
  });

  mod.start();
  engine.markReady("intel");
})();
