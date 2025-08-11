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
        dotColor: '#ffffff',
        lineColor: '#9bb8ff',
        dotRadius: [1.2, 2.2],
        lineWidth: 1.1,
        lineMaxDistance: 160,
        hoverLinkDistance: 190,
        density: 15000,
        minParticles: 80,
        maxParticles: 220,
        speed: 0.4,
        drift: 0.1,
        repelRadius: 110,
        repelForce: 0.014,
        wrap: true,
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
