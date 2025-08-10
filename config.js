window.Config = {
  theme: {
    background: getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#050505',
    accent: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#b21717',
    accentSoft: getComputedStyle(document.documentElement).getPropertyValue('--accent-soft').trim() || '#7f1313'
  },
  // Deterministic start
  random: {
    seed: 'OPS-RED-SEED' // change to any string; same string => same start every load
  },
  // Spawn behavior
  spawn: {
    mode: 'burst',              // 'burst' (from center) or 'random' (full field)
    origin: { xPct: 0.5, yPct: 0.5 },
    radiusPct: 0.02             // spawn radius relative to min(viewport)
  },
  particles: {
    densityPer100k: 14,         // increased density (tune 10–18)
    sizeRange: [0.8, 1.6],
    speedRange: [0.10, 0.32],
    linkDistance: 140,
    linkWidth: 1,
    interiorMarginPct: 0.00,    // bounce at the actual edge
    jitter: 0.002,              // subtle frame-to-frame noise
    // Bounce chaos (adds realism on impact)
    bounceAngleJitter: 0.18,    // radians (±)
    bounceSpeedJitter: 0.07,    // multiplier variance
    enableFlicker: false,
    flickerDepth: 0.15
  },
  render: {
    dotAlpha: 0.85,
    lineAlpha: 0.10,
    composite: 'source-over',
    roundCaps: true,
    capStyle: 'round'
  }
};
