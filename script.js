// Your Mapbox API key
mapboxgl.accessToken =
  'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';

// Initialize the Mapbox map using the dark style
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [0, 0],
  zoom: 1,
  attributionControl: false
});

// Disable all interactive controls for a static experience
map.dragPan.disable();
map.dragRotate.disable();
map.scrollZoom.disable();
map.doubleClickZoom.disable();
map.boxZoom.disable();
map.keyboard.disable();
map.touchZoomRotate.disable();

// Function to hide all text labels
function hideLabels() {
  const style = map.getStyle();
  if (!style || !style.layers) return;
  style.layers.forEach(layer => {
    if (layer.type === 'symbol' && layer.layout && layer.layout['text-field']) {
      map.setLayoutProperty(layer.id, 'visibility', 'none');
    }
  });
}

// Function to hide white boundary lines (administrative boundaries)
// Adjust this filter as necessary per your Mapbox style.
function hideBoundaries() {
  const layers = map.getStyle().layers;
  layers.forEach(layer => {
    if (
      layer.id.includes('boundary') ||
      layer.id.includes('admin-0') ||
      layer.id.includes('admin-1')
    ) {
      map.setLayoutProperty(layer.id, 'visibility', 'none');
      console.log(`Hiding boundary layer: ${layer.id}`);
    }
  });
}

map.on('load', () => {
  hideLabels();
  hideBoundaries();
  console.log('Map loaded; labels and boundaries hidden; red lines animating.');
});
map.on('styledata', () => {
  hideLabels();
  hideBoundaries();
});

/* --- Timer Implementation (Local Time) --- */
const timerElement = document.getElementById('timer');
function updateTimer() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const centiseconds = Math.floor(now.getMilliseconds() / 10)
    .toString()
    .padStart(2, '0');
  timerElement.innerText = `${hours}:${minutes}:${seconds}:${centiseconds}`;
}
updateTimer(); // update immediately
setInterval(updateTimer, 10);

/* --- Countdown Implementation (1 Minute) --- */
const countdownElement = document.getElementById('countdown');
// Start time: 60,000ms (1 minute)
let countdownTime = 60 * 1000;

function updateCountdown() {
  countdownTime -= 10;
  if (countdownTime < 0) countdownTime = 0;

  const hours = Math.floor(countdownTime / (1000 * 60 * 60))
    .toString()
    .padStart(2, '0');
  const minutes = Math.floor((countdownTime % (1000 * 60 * 60)) / (1000 * 60))
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor((countdownTime % (1000 * 60)) / 1000)
    .toString()
    .padStart(2, '0');
  const centiseconds = Math.floor((countdownTime % 1000) / 10)
    .toString()
    .padStart(2, '0');

  countdownElement.innerText = `${hours}:${minutes}:${seconds}:${centiseconds}`;

  // When countdown reaches zero, clear the interval and refresh the page once
  if (countdownTime <= 0) {
    clearInterval(countdownInterval);
    location.reload();
  }
}
updateCountdown(); // update immediately
const countdownInterval = setInterval(updateCountdown, 10);
