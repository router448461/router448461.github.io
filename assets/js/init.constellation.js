document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('constellation');
  if (!canvas || !window.Constellation) return;

  const engine = new Constellation(canvas, {
    dotColor: '#91a8ff',
    lineColor: '#6aa7ff',
    dotRadius: [0.8, 1.8],
    lineWidth: 0.9,
    lineMaxDistance: 140,
    density: 17000,
    minParticles: 70,
    maxParticles: 220,
    speed: 0.38,
    drift: 0.14,
    hoverLinkDistance: 180,
    repelRadius: 95,
    repelForce: 0.013,
    wrap: true,
    fpsCap: 60
  });

  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  function updateMotion(e) {
    if (e.matches) engine.stop();
    else engine.start();
  }
  mq.addEventListener?.('change', updateMotion);
  if (mq.matches) engine.stop();
  else engine.start();
});
