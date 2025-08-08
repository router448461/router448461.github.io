// js/config.js
export const config = {
  pixelRatio: window.devicePixelRatio || 1,
  particleCount:      60,        // number of drifting nodes
  maxLinkDistance:   150,        // px max for line draw
  baseSpeed:          0.4,       // base movement speed per frame
  speedVariance:      0.5,       // ± range e.g. 0.5 = [0.75× → 1.25×]
  particleRadius:     2,         // px for drawing
  lineThickness:      1,         // px for link lines
  particleColor:    'rgba(0,160,255,0.7)',
  lineColor:        'rgba(0,160,255,0.15)',
  gridCellSize:     100         // px for spatial hashing
};
