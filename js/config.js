// js/config.js
export const config = {
  pixelRatio:      window.devicePixelRatio || 1,
  particleCount:   60,
  maxLinkDistance: 150,
  baseSpeed:       0.4,
  speedVariance:   0.5,
  particleRadius:  2,
  lineThickness:   1,
  particleColor:   'rgba(0,160,255,0.7)',
  lineColor:       'rgba(0,160,255,0.15)',

  // —— New Military/HUD Settings ——
  gridSize:        120,                   // px between grid lines
  gridColor:       'rgba(0,255,0,0.08)',
  crosshairColor:  'rgba(0,255,0,0.2)',
  scanLineColor:   'rgba(0,255,0,0.1)',
  scanSpeed:       0.02,                  // radians per frame
  noiseDensity:    0.02,                  // % of pixels per frame

  // —— Spatial-hash cell size for link culling ——
  cellSize:        100
};
