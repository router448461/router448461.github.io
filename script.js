// Replace with your valid Mapbox API key.
mapboxgl.accessToken =
  'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';

// Initialize the Mapbox map centered at [0, 0].
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [0, 0],
  zoom: 2,
  attributionControl: false,
});

// Disable interactive map controls for a static presentation.
map.dragPan.disable();
map.dragRotate.disable();
map.scrollZoom.disable();
map.doubleClickZoom.disable();
map.boxZoom.disable();
map.keyboard.disable();
map.touchZoomRotate.disable();

// Function to hide unwanted labels and boundaries.
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

// Once the map style is loaded:
map.on('load', () => {
  hideMapElements();
  // Make the map visible after the style is adjusted.
  document.getElementById('map').style.visibility = 'visible';

  // After 3 seconds, add a flash effect to the status message.
  setTimeout(() => {
    const statusEl = document.getElementById('status');
    statusEl.classList.add('flash');
  }, 3000);

  // After 6 seconds, remove the status text and show the clock.
  setTimeout(() => {
    document.getElementById('status').style.display = 'none';
    const clockEl = document.getElementById('clock');
    clockEl.style.display = 'block';
    startClock();
  }, 6000);
});

// Re-apply hideMapElements if the style data changes.
map.on('styledata', hideMapElements);

// Start the clock that shows local time with milliseconds.
function startClock() {
  updateClock(); // update immediately
  // Update the clock every 50 milliseconds
  setInterval(updateClock, 50);
}

// Update the clock element to display HH:MM:SS:ms (milliseconds padded to 3 digits).
function updateClock() {
  const clockEl = document.getElementById('clock');
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
  clockEl.innerText = `${hours}:${minutes}:${seconds}:${milliseconds}`;
}
