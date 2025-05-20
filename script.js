// script.js
import { startGlitch } from './glitchModule.js';
import { startTimer } from './timerModule.js';

// Import Mapbox GL from the CDN module
import mapboxgl from 'https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.js';

try {
  // Set your Mapbox access token here (inserted from your provided token)
  mapboxgl.accessToken =
    "pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A";

  // Initialize the Mapbox map (centered on Melbourne for illustration)
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    center: [144.9631, -37.8136],
    zoom: 10,
  });

  // Enhanced Error Handling: Listen to map load errors
  map.on('error', (err) => {
    console.error('Mapbox encountered an error:', err);
  });

  // Call map.resize() on window resize to help mask any black borders during panning.
  window.addEventListener('resize', () => {
    try {
      map.resize();
    } catch (error) {
      console.error('Error resizing map:', error);
    }
  });

  // Start the glitch effect and the timer
  startGlitch();
  startTimer();

  // Enhance the reticle behavior to simulate sensor dynamics with subtle jitter.
  const reticle = document.getElementById('reticle');
  if (reticle) {
    const updateReticle = () => {
      try {
        const offsetX = (Math.random() - 0.5) * 4; // ±2px jitter
        const offsetY = (Math.random() - 0.5) * 4;
        reticle.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;
      } catch (error) {
        console.error('Error updating reticle position:', error);
      }
      requestAnimationFrame(updateReticle);
    };
    updateReticle();
  } else {
    console.error('Reticle element not found.');
  }
} catch (error) {
  console.error('Error during map or app initialization:', error);
}
