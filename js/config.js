export const config = {
  // Rendering
  pixelRatio:      Math.min(window.devicePixelRatio || 1, 2),

  // Particles
  particleCount:   70,
  baseSpeed:       0.32,
  speedVariance:   0.36,
  particleRadius:  2.2,

  // Links
  maxLinkDistance: 140,
  lineThickness:   1.2,

  // Palette (restrained, non-cinematic)
  particleColor:   'rgba(139, 0, 0, 0.85)',  // disciplined red
  lineColor:       'rgba(90, 0, 0, 0.32)',

  // Subtle signal glow
  glowBlur:        5,
  glowColor:       'rgba(139, 0, 0, 0.35)',

  // Low-probability micro-flicker to indicate link instability
  lineFlickerFreq: 0.012
};
