window.Config = {
  theme: {
    background: getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#050505',
    accent: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#b21717',
    accentSoft: getComputedStyle(document.documentElement).getPropertyValue('--accent-soft').trim() || '#7f1313'
  },
  particles: {
    densityPer100k: 10,
    sizeRange: [0.8, 1.6],
    speedRange: [0.08, 0.28],
    linkDistance: 140,
    linkWidth: 1,
    interiorMarginPct: 0.06,
    jitter: 0.002,
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
