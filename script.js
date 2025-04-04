// Replace with your valid Mapbox API key.
mapboxgl.accessToken =
  'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';

// Initialize the Mapbox map centered on [0, 0] (the middle of the world)
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [0, 0],
  zoom: 2,
  attributionControl: false,
});

// Disable interactive controls so the presentation remains static.
map.dragPan.disable();
map.dragRotate.disable();
map.scrollZoom.disable();
map.doubleClickZoom.disable();
map.boxZoom.disable();
map.keyboard.disable();
map.touchZoomRotate.disable();

// Function to hide unwanted map labels and boundaries.
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

// Once the map loads, reveal it and schedule the flash and clock.
map.on('load', () => {
  hideMapElements();
  document.getElementById('map').style.visibility = 'visible';

  // After 6 seconds, trigger a full-screen flash,
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

// Starts the clock updating every 50ms.
function startClock() {
  updateClock();
  setInterval(updateClock, 50);
}

// Update the clock element with local time (HH:MM:SS:ms with ms padded to three digits)
function updateClock() {
  const clockEl = document.getElementById('clock');
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
  clockEl.innerText = `${hours}:${minutes}:${seconds}:${milliseconds}`;
}
