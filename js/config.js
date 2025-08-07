// js/config.js
export default {
  pixelRatio: window.devicePixelRatio || 1,

  grid: {
    cellSize: 60,             // size of each logical grid cell
    connectThreshold: 80      // max distance to draw a line
  },

  particle: {
    radius: 1.5,
    color: '#00ff00',
    drag: 0.98,
    pulseAmplitude: 0.6,      // how big the dots pulse
    pulseSpeed: 1.5           // pulses per second
  }
};
