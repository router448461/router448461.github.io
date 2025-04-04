mapboxgl.accessToken =
  'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [0, 0],
  zoom: 2,
  attributionControl: false,
});

// Disable interactive gestures.
map.dragPan.disable();
map.dragRotate.disable();
map.scrollZoom.disable();
map.doubleClickZoom.disable();
map.boxZoom.disable();
map.keyboard.disable();
map.touchZoomRotate.disable();

// Hide unwanted map elements (like labels and titles) by turning off all symbol layers.
function hideMapElements() {
  const style = map.getStyle();
  if (!style || !style.layers) return;
  style.layers.forEach((layer) => {
    // Hide all symbol layers (labels, titles, etc.)
    if (layer.type === 'symbol') {
      map.setLayoutProperty(layer.id, 'visibility', 'none');
    }
  });
}

// Call hideMapElements on every style update as early as possible.
map.on('styledata', hideMapElements);

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
dayNightOverlay.style.background =
  'linear-gradient(to bottom, rgba(255,255,0,0.2), rgba(255,255,0,0))';
document.body.appendChild(dayNightOverlay);

// Update the day–night overlay based on the visitor's geolocation using SunCalc.
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const sunPos = SunCalc.getPosition(new Date(), latitude, longitude);
      // If the sun's altitude is greater than 0, it's day; otherwise, it's night.
      const isDay = sunPos.altitude > 0;
      const gradient = isDay
        ? 'linear-gradient(to bottom, rgba(255,255,0,0.2), rgba(255,255,0,0))'
        : 'linear-gradient(to bottom, rgba(0,0,139,0.3), rgba(0,0,139,0))';
      dayNightOverlay.style.background = gradient;
    },
    (err) => {
      console.error("Error fetching geolocation:", err);
      // If geolocation is denied, the default day overlay remains.
    }
  );
} else {
  console.error("Geolocation is not supported by this browser.");
}

// When the map is fully loaded:
map.on('load', () => {
  // Fade in the map (the CSS transition will smoothly raise the opacity to 1).
  document.getElementById('map').style.opacity = '1';

  // Delay the start of line and radar animations by 1 second.
  setTimeout(() => {
    // Start the line animations.
    document.querySelectorAll('.line').forEach((el) => {
      el.style.animationPlayState = 'running';
    });

    // Start the radar rotation.
    const radar = document.getElementById('radar');
    if (radar) {
      radar.style.animationPlayState = 'running';
    }
  }, 1000);
});
