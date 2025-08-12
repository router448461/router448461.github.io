document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('constellation');
  if (!canvas) {
    console.warn('[Constellation] Canvas #constellation not found.');
    return;
  }

  const boot = () => {
    try {
      const ConstellationCtor = window.Constellation;
      if (!ConstellationCtor) return false;

      const engine = new ConstellationCtor(canvas, {
        // Visuals
        dotColor: '#ffffff',
        lineColor: '#9bb8ff',
        sparkColor: '#a8c7ff',

        // Geometry & motion
        dotRadius: [1.2, 2.0],
        lineWidth: 1.05,
        lineMaxDistance: 170,
        hoverLinkDistance: 200,

        // Density & perf
        density: 15000,
        minParticles: 90,
        maxParticles: 220,

        // Kinetics
        speed: 0.42,
        speedZ: 0.05,
        drift: 0.1,
        repelRadius: 110,
        repelForce: 0.014,
        wrap: true,

        // 3D feel
        use3D: true,
        zRange: [-180, 180],
        fov: 380,
        parallax: 0.06,
        depthFade: true,

        // Sparks
        sparkCount: 20,
        sparkSize: [1.1, 2.1],
        sparkSpeed: [70, 120],
        sparkLife: [2.5, 6.0],

        // Runtime
        fpsCap: 60,
        tacticalMode: true
      });

      engine.start();
      return true;
    } catch (e) {
      console.error('[Constellation] Boot error:', e);
      return false;
    }
  };

  // Immediate try, then brief retry window if engine script lags.
  if (!boot()) {
    let attempts = 0;
    const timer = setInterval(() => {
      attempts++;
      if (boot() || attempts >= 20) clearInterval(timer);
    }, 100);
  }
});
