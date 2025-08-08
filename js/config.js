// js/config.js
export const config = {
  pixelRatio:      window.devicePixelRatio || 1,
  particleCount:   60,        // number of drifting nodes
  maxLinkDistance: 150,       // px max for line draw
  baseSpeed:       0.4,       // movement speed per frame
  speedVariance:   0.5,       // ± range for speed variance
  particleRadius:  2,         // px radius of each node
  lineThickness:   1,         // px thickness of links

  // ←— Updated to “Blood & Ash” palette —→
  particleColor:   'rgba(139, 0, 0, 0.8)',  // deep blood red
  lineColor:       'rgba(85, 0, 0, 0.3)'    // washed‐out ember
};
