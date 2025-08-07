// js/config.js

export default {
  // device pixel ratio for high-DPI support
  pixelRatio: window.devicePixelRatio || 1,

  // how many particles to spawn
  particleCount: 1000,

  // grid configuration
  grid: {
    cellSize: 50  // each cell is 50×50 pixels
  },

  // particle appearance & physics
  particle: {
    radius: 1.5,
    color: '#00FF00',
    drag: 0.98       // velocity retention each frame
  }
};
