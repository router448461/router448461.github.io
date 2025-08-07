// js/config.js

export default {
  pixelRatio: window.devicePixelRatio || 1,

  // grid & connection settings
  grid: {
    cellSize: 50,
    connectThreshold: 55
  },

  // particle appearance & physics
  particle: {
    radius: 1.5,
    color: '#00ff00',
    drag: 0.98,
    pulseAmplitude: 0.6,  // extra radius
    pulseSpeed: 2         // cycles per second
  }
};
