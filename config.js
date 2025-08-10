window.Config = {
  theme: {
    background: '#050505',
    accent: '#b21717',
    accentSoft: '#7f1313'
  },
  random: {
    seed: 'RED-BREACH-SEED'
  },
  spawn: {
    mode: 'burst',
    origin: { xPct: 0.5, yPct: 0.5 },
    radiusPct: 0.02
  },
  particles: {
    densityPer100k: 14,
    sizeRange: [0.8, 1.6],
    speedRange: [0.10, 0.32],
    velocityRamp: 0.0004,
    exitThreshold: 1.2,
    exitFade: true,
    enableTrails: true,
    trailLength: 6,
    trailAlpha: 0.08,
    linkDistance: 140,
    linkWidth: 1,
    interiorMarginPct: 0.00,
    jitter: 0.002,
    bounceAngleJitter: 0.18,
    bounceSpeedJitter: 0.07,
    enableFlicker: false
  },
  render: {
    dotAlpha: 0.85,
    lineAlpha: 0.10,
    composite: 'source-over',
    roundCaps: true,
    capStyle: 'round'
  }
};
