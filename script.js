// Replace with your valid Mapbox API key.
mapboxgl.accessToken =
  'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';

// Initialize the Mapbox map centered on [0, 0]
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [0, 0],
  zoom: 2,
  attributionControl: false,
});

// Disable interactive controls to keep the presentation static.
map.dragPan.disable();
map.dragRotate.disable();
map.scrollZoom.disable();
map.doubleClickZoom.disable();
map.boxZoom.disable();
map.keyboard.disable();
map.touchZoomRotate.disable();

// Function to hide unwanted labels/boundaries on the map.
function hideMapElements() {
  const style = map.getStyle();
  if (!style || !style.layers) return;
  style.layers.forEach(layer => {
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

map.on('load', () => {
  hideMapElements();
  // Reveal the map once styles are adjusted.
  document.getElementById('map').style.visibility = 'visible';

  // After 6 seconds (3s delay + 3s animation), trigger the full-screen flash
  // then remove the status message and show the clock.
  setTimeout(() => {
    const flashEl = document.getElementById('flash-overlay');
    flashEl.classList.add('flash');
    setTimeout(() => {
      flashEl.classList.remove('flash');
    }, 500);

    document.getElementById('status').style.display = 'none';
    const clockEl = document.getElementById('clock');
    clockEl.style.display = 'block';
    startClock();
  }, 6000);
});

map.on('styledata', hideMapElements);

// Start and update the local clock.
function startClock() {
  updateClock(); // update immediately
  setInterval(updateClock, 50);
}

function updateClock() {
  const clockEl = document.getElementById('clock');
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
  clockEl.innerText = `${hours}:${minutes}:${seconds}:${milliseconds}`;
}
