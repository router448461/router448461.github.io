// Replace with your valid Mapbox API key.
mapboxgl.accessToken =
  'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';

// Initialize the Mapbox map centered on [0, 0] (the middle of the world).
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [0, 0],
  zoom: 2,
  attributionControl: false,
});

// Disable interactive controls for a static presentation.
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

// When the map is loaded:
map.on('load', () => {
  hideMapElements();
  // Reveal the map once style adjustments are done.
  document.getElementById('map').style.visibility = 'visible';

  // After 6 seconds (3s delay + 3s line animation), flash the screen,
  // then remove the status message and show the clock.
  setTimeout(() => {
    // Flash the entire screen by adding a class to the body.
    document.body.classList.add('flashScreen');
    setTimeout(() => {
      document.body.classList.remove('flashScreen');
    }, 500);

    // Hide status message and show the clock.
    document.getElementById('status').style.display = 'none';
    document.getElementById('clock').style.display = 'block';
    startClock();
  }, 6000);
});

// Also re-apply hideMapElements if style changes.
map.on('styledata', hideMapElements);

// Start and update the local clock (HH:MM:SS:ms, with ms padded to three digits)
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
