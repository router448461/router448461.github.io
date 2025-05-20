// script.js (main entry)
import { startGlitch } from './glitchModule.js';
import { startTimer } from './timerModule.js';
import mapboxgl from 'mapbox-gl';

// Set your Mapbox access token here
mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN';

// Initialize the Mapbox map
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [144.9631, -37.8136], // Example: Melbourne, Australia
  zoom: 10
});

// Start the glitch effect and timer
startGlitch();
startTimer();

// Enhance the reticle behavior to simulate sensor dynamics
const reticle = document.getElementById('reticle');
if (reticle) {
  const updateReticle = () => {
    const offsetX = (Math.random() - 0.5) * 4; // ±2px jitter
    const offsetY = (Math.random() - 0.5) * 4;
    reticle.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;
    requestAnimationFrame(updateReticle);
  };
  updateReticle();
}
