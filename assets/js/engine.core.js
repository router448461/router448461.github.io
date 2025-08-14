(() => {
  // Minimal engine core: state, logging, readiness tracking, utils.
  const engine = (window.engine = {
    t0: performance.now(),
    modules: {},
    state: {
      fps: 60,
      ctx: null,
      canvas: null,
      mouse: { x: null, y: null, down: false },
      time: 0
    },
    ready: new Set(),
    log: (...args) => console.log("[engine]", ...args),
    markReady(name) {
      engine.ready.add(name);
    },
    util: {
      clamp(v, a, b) { return v < a ? a : (v > b ? b : v); },
      lerp(a, b, t) { return a + (b - a) * t; },
      hexToRgb(hex) {
        const h = hex.replace("#", "");
        const n = parseInt(h.length === 3
          ? h.split("").map(c => c + c).join("")
          : h, 16);
        return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
      }
    }
  });
})();
