// Your Mapbox API key
mapboxgl.accessToken =
  'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';

// Initialize the Mapbox map in dark mode
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [0, 0],
  zoom: 1,
  attributionControl: false,
});

// Disable all interactive controls for a static display
map.dragPan.disable();
map.dragRotate.disable();
map.scrollZoom.disable();
map.doubleClickZoom.disable();
map.boxZoom.disable();
map.keyboard.disable();
map.touchZoomRotate.disable();

// Function to hide all text labels on the map
function hideLabels() {
  const style = map.getStyle();
  if (!style || !style.layers) return;
  style.layers.forEach((layer) => {
    if (layer.type === 'symbol' && layer.layout && layer.layout['text-field']) {
      map.setLayoutProperty(layer.id, 'visibility', 'none');
    }
  });
}

map.on('load', () => {
  hideLabels();
  console.log('Map loaded and labels hidden.');
});
map.on('styledata', hideLabels);

/* --- Timer Implementation --- */
const timerElement = document.getElementById('timer');

function updateTimer() {
  const now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  let seconds = now.getSeconds();
  // Get centiseconds (two digits): milliseconds divided by 10
  let centiseconds = Math.floor(now.getMilliseconds() / 10);
  // Pad each value to ensure two digits
  hours = hours.toString().padStart(2, '0');
  minutes = minutes.toString().padStart(2, '0');
  seconds = seconds.toString().padStart(2, '0');
  centiseconds = centiseconds.toString().padStart(2, '0');
  timerElement.innerText = `${hours}:${minutes}:${seconds}:${centiseconds}`;
}

// Update timer every 10 milliseconds
setInterval(updateTimer, 10);

/* --- Flash Effect After Circle Draw Completes --- */
// Listen for the end of the circle's drawing animation
const drawCircle = document.querySelector('.draw-circle');
drawCircle.addEventListener('animationend', () => {
  const flashDiv = document.getElementById('flash');
  flashDiv.classList.add('flash');
  // Remove the class after the flash animation completes (so it can re-trigger later if needed)
  flashDiv.addEventListener(
    'animationend',
    () => {
      flashDiv.classList.remove('flash');
    },
    { once: true }
  );
});
