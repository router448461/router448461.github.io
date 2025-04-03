// Your Mapbox API key
mapboxgl.accessToken =
  'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';

// Initialize the Mapbox map in dark mode
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [0, 0],
  zoom: 1,
  attributionControl: false
});

// Disable all interactive controls for a completely static display
map.dragPan.disable();
map.dragRotate.disable();
map.scrollZoom.disable();
map.doubleClickZoom.disable();
map.boxZoom.disable();
map.keyboard.disable();
map.touchZoomRotate.disable();

// Hide all text labels on the map
function hideLabels() {
  const style = map.getStyle();
  if (!style || !style.layers) return;
  style.layers.forEach(layer => {
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
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const centiseconds = Math.floor(now.getMilliseconds() / 10)
    .toString()
    .padStart(2, '0');
  timerElement.innerText = `${hours}:${minutes}:${seconds}:${centiseconds}`;
}
setInterval(updateTimer, 10);

/* --- Flash Effect --- */
// Trigger the flash when the right horizontal line's thickness animation ends
const flashTriggeredElement = document.querySelector('.line.horizontal.right');
let flashTriggered = false;
flashTriggeredElement.addEventListener('animationend', event => {
  if (event.animationName === 'growThicknessH' && !flashTriggered) {
    flashTriggered = true;
    const flashDiv = document.getElementById('flash');
    flashDiv.classList.add('flash');
    flashDiv.addEventListener(
      'animationend',
      () => {
        flashDiv.classList.remove('flash');
      },
      { once: true }
    );
  }
});
