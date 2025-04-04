// Set Mapbox access token and initialize the map.
mapboxgl.accessToken =
  'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [0, 0],
  zoom: 2,
  attributionControl: false,
});

// Disable all user interactions.
map.dragPan.disable();
map.dragRotate.disable();
map.scrollZoom.disable();
map.doubleClickZoom.disable();
map.boxZoom.disable();
map.keyboard.disable();
map.touchZoomRotate.disable();

// Hide undesired map labels and boundaries.
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

// When the map has fully loaded, reveal it and start all animations.
map.on('load', () => {
  hideMapElements();
  document.getElementById('map').style.visibility = 'visible';
  
  // Unpause the cross-line animations.
  document.querySelectorAll('.line').forEach((el) => {
    el.style.animationPlayState = 'running';
  });
  
  // Start the stopwatch immediately.
  startStopwatch();
  
  // Play background audio.
  const audioBg = document.getElementById('audio-bg');
  if (audioBg) {
    audioBg.play().catch((e) => console.log("Background audio play was prevented:", e));
  }
  
  // After the cross lines finish drawing (9 seconds), play the alert audio.
  setTimeout(() => {
    const audioAlert = document.getElementById('audio-alert');
    if (audioAlert) {
      audioAlert.play().catch((e) => console.log("Alert audio play was prevented:", e));
    }
  }, 9000);
});

// Stopwatch functionality.
let stopwatchStart = Date.now();
function startStopwatch() {
  updateStopwatch();
  setInterval(updateStopwatch, 50);
}

function updateStopwatch() {
  const clockEl = document.getElementById('clock');
  const elapsed = Date.now() - stopwatchStart;
  const minutes = Math.floor(elapsed / 60000)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor((elapsed % 60000) / 1000)
    .toString()
    .padStart(2, '0');
  const milliseconds = (elapsed % 1000).toString().padStart(3, '0');
  clockEl.textContent = `${minutes}:${seconds}:${milliseconds}`;
}
