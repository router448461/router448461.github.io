mapboxgl.accessToken = 'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [0, 0],
  zoom: 2,
  attributionControl: false,
});

// Disable interactive gestures
map.dragPan.disable();
map.dragRotate.disable();
map.scrollZoom.disable();
map.doubleClickZoom.disable();
map.boxZoom.disable();
map.keyboard.disable();
map.touchZoomRotate.disable();

function hideMapElements() {
  const style = map.getStyle();
  if (!style || !style.layers) return;
  style.layers.forEach((layer) => {
    if (
      layer.type === 'symbol' ||
      (layer.id &&
        (layer.id.includes('boundary') ||
         layer.id.includes('admin-0') ||
         layer.id.includes('admin-1')))
    ) {
      map.setLayoutProperty(layer.id, 'visibility', 'none');
    }
  });
}

// Create the day–night overlay element immediately with a default "day" gradient.
const dayNightOverlay = document.createElement('div');
dayNightOverlay.id = 'dayNightOverlay';
dayNightOverlay.style.position = 'absolute';
dayNightOverlay.style.top = '0';
dayNightOverlay.style.left = '0';
dayNightOverlay.style.width = '100vw';
dayNightOverlay.style.height = '100vh';
dayNightOverlay.style.pointerEvents = 'none';
dayNightOverlay.style.zIndex = '5';
// Default overlay (day)
dayNightOverlay.style.background = 'linear-gradient(to bottom, rgba(255,255,0,0.2), rgba(255,255,0,0))';
document.body.appendChild(dayNightOverlay);

// Update the overlay based on the visitor's geolocation using SunCalc.
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const sunPos = SunCalc.getPosition(new Date(), latitude, longitude);
      // If sun altitude > 0, it's day; otherwise, it's night.
      const isDay = sunPos.altitude > 0;
      const gradient = isDay
        ? 'linear-gradient(to bottom, rgba(255, 255, 0, 0.2), rgba(255, 255, 0, 0))'
        : 'linear-gradient(to bottom, rgba(0, 0, 139, 0.3), rgba(0, 0, 139, 0))';
      dayNightOverlay.style.background = gradient;
    },
    (err) => {
      console.error("Error fetching geolocation:", err);
      // If geolocation fails (or is denied), the default (day) overlay remains.
    }
  );
} else {
  console.error("Geolocation is not supported by this browser.");
}

map.on('load', () => {
  hideMapElements();

  // Start the line animations immediately.
  document.querySelectorAll('.line').forEach((el) => {
    el.style.animationPlayState = 'running';
  });
});
