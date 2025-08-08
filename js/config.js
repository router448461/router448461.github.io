export const config = {
  pixelRatio:      window.devicePixelRatio || 1,
  particleCount:   60,
  maxLinkDistance: 150,
  baseSpeed:       0.4,
  speedVariance:   0.5,
  particleRadius:  2,
  lineThickness:   1,

  // military-inspired colors
  particleColor:   'rgba(107, 142, 35, 0.8)',  // olive drab
  lineColor:       'rgba(85, 107, 47, 0.3)',   // darker olive

  // glow & pulsation
  glowBlur:         8,                         // px
  glowColor:       'rgba(107, 142, 35, 0.5)',  // soft olive glow
  pulseSpeed:      0.005,                      // radians per frame
  lineFlickerFreq: 0.02                        // chance per frame to brighten a link
};
