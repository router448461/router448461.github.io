document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('constellation');
  if (!canvas) return;

  const engine = new Constellation(canvas, {
    // High-contrast defaults for immediate visibility
    dotColor: '#ffffff',
    lineColor: '#9bb8ff',
    dotRadius: [1.4, 2.6],
    lineWidth: 1.2,
    lineMaxDistance: 170,
    hoverLinkDistance: 210,
    density: 15000,
    minParticles: 90,
    maxParticles: 280,
    speed: 0.42,
    drift: 0.1,
    repelRadius: 120,
    repelForce: 0.014,
    wrap: true,
    fpsCap: 60
  });

  // Respect reduced motion by softening, but never fully disabling
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  function applyMotionPreference(e) {
    if (e.matches) {
      engine.opts.speed = 0.18;
      engine.opts.drift = 0.05;
      engine.opts.lineMaxDistance = 140;
      engine.opts.hoverLinkDistance = 170;
      engine.opts.density = 22000; // fewer particles
      engine.resize(); // reapply density
    } else {
      engine.opts.speed = 0.42;
      engine.opts.drift = 0.1;
      engine.opts.lineMaxDistance = 170;
      engine.opts.hoverLinkDistance = 210;
      engine.opts.density = 15000;
      engine.resize();
    }
  }

  // Apply once and on change
  applyMotionPreference(mq);
  mq.addEventListener?.('change', applyMotionPreference);

  // Start animation
  engine.start();

  // Optional: quick sanity log for visibility checks
  // console.log('Constellation initialized');
});
