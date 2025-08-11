document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('constellation');
  if (!canvas || !window.Constellation) return;

  const engine = new Constellation(canvas, {
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
});
