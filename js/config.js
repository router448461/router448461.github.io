export const config = {
  pixelRatio: Math.min(window.devicePixelRatio || 1, 2),

  maxLinkDistance: 140,
  lineThickness: 1.2,

  clusters: {
    blackzone: {
      label: 'black.zone',
      color: 'rgba(220,120,0,0.85)',
      linkColor: 'rgba(180,100,30,0.30)',
      linkColorActive: 'rgba(255,140,30,0.50)',
      particleCount: 36,
      radius: 2.3,
      speed: { base: 0.38, var: 0.28 },
      region: { cx: 0.5, cy: 0.5, r: 0.25 }
    }
  },

  allowMatrix: {
    blackzone: []
  }
};
