// script.js
import { startGlitch } from './glitchModule.js';
import { startTimer } from './timerModule.js';

try {
  // Use the global mapboxgl (loaded via the <script> tag in index.html)
  mapboxgl.accessToken =
    'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';

  // Initialize the Mapbox map centered at [0, 0] for a global, top‑down view.
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    center: [0, 0],
    zoom: 1.5,
  });

  // Disable interactive behaviors for a fixed, mechanical display.
  map.dragPan.disable();
  map.dragRotate.disable();
  map.scrollZoom.disable();
  map.doubleClickZoom.disable();
  map.boxZoom.disable();
  map.keyboard.disable();
  map.touchZoomRotate.disable();

  map.on('error', (err) => {
    console.error('Mapbox encountered an error:', err);
  });

  // Update the map dimensions on window resize.
  window.addEventListener('resize', () => {
    try {
      map.resize();
    } catch (error) {
      console.error('Error resizing map:', error);
    }
  });

  // Restore latitude/longitude display by updating the "coords" element on mouse move over the map container.
  const mapContainer = map.getContainer();
  mapContainer.addEventListener('mousemove', (e) => {
    try {
      const rect = mapContainer.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const coords = map.unproject([mouseX, mouseY]);
      const lat = coords.lat.toFixed(3);
      const lng = coords.lng.toFixed(3);
      const coordsElement = document.getElementById('coords');
      if (coordsElement) {
        coordsElement.innerText = `LAT: ${lat}  LON: ${lng}`;
      }
    } catch (error) {
      console.error('Error updating coordinates:', error);
    }
  });

  // Unified mousemove: update reticle (red dot) position instantly and update map pull effect.
  document.addEventListener('mousemove', (e) => {
    // Debug log to confirm mousemove event firing
    console.log('Mouse position:', e.clientX, e.clientY);
    
    // Update reticle position instantly so you know where you are pointing.
    const reticle = document.getElementById('reticle');
    if (reticle) {
      reticle.style.transform = `translate(-50%, -50%) translate(${e.clientX}px, ${e.clientY}px)`;
    } else {
      console.error('Reticle element not found.');
    }

    // Update map pull effect using CSS variables.
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const offsetX = (e.clientX - centerX) * 0.02; // Adjust multiplier as desired.
    const offsetY = (e.clientY - centerY) * 0.02;
    const mapElement = document.getElementById('map');
    if (mapElement) {
      mapElement.style.setProperty('--parallax-x', `${offsetX}px`);
      mapElement.style.setProperty('--parallax-y', `${offsetY}px`);
    }
  });

  // Start glitch effect and timer.
  startGlitch();
  startTimer();

} catch (error) {
  console.error('Error during map or app initialization:', error);
}
