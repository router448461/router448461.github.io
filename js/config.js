export const config = {
  pixelRatio:      window.devicePixelRatio || 1,
  particleCount:   60,
  maxLinkDistance: 150,
  baseSpeed:       0.4,
  speedVariance:   0.5,
  particleRadius:  2,
  lineThickness:   1,

  // “Blood & Ash” colors
  particleColor:   'rgba(139, 0, 0, 0.8)',
  lineColor:       'rgba(85, 0, 0, 0.3)',

  // glow & pulsation
  glowBlur:         8,        // px
  glowColor:       'rgba(139, 0, 0, 0.5)',
  pulseSpeed:      0.005,    // radians per frame
  lineFlickerFreq: 0.02      // chance per frame to brighten a link
};
