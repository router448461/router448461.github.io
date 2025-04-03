// Your Mapbox API key – replace with your valid token.
mapboxgl.accessToken =
  'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';

// Initialize the Mapbox map.
// Centering the map on Uluru (Ayers Rock) for the custom marker.
// Adjust the zoom if you’d like a wider view.
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [131.0369, -25.3444], // Uluru coordinates
  zoom: 4,
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

// Hide unwanted labels and boundaries (such as world names and admin boundaries).
function hideMapElements() {
  const style = map.getStyle();
  if (!style || !style.layers) return;
  style.layers.forEach(layer => {
    if (
      layer.type === 'symbol' ||
      (layer.id && (layer.id.includes('boundary') ||
                    layer.id.includes('admin-0') ||
                    layer.id.includes('admin-1')))
    ) {
      map.setLayoutProperty(layer.id, 'visibility', 'none');
    }
  });
}

// Sample array of Australian military bases (dummy coordinates).
// Replace these with real public data as needed.
const australianMilitaryBases = [
  { name: "RAAF Base Edinburgh", coordinates: [138.62, -34.93] },
  { name: "HMAS Stirling", coordinates: [115.79, -32.02] },
  { name: "HMAS Albatross", coordinates: [151.16, -33.96] },
  { name: "RAAF Base Darwin", coordinates: [130.85, -12.42] },
  { name: "RAAF Base Richmond", coordinates: [150.91, -33.62] }
];

// Function to add green markers for each military base.
function addMilitaryBasesMarkers() {
  australianMilitaryBases.forEach(base => {
    new mapboxgl.Marker({ color: "green" })
      .setLngLat(base.coordinates)
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(base.name))
      .addTo(map);
  });
}

// Create a custom marker for Uluru containing red cross lines and a blinking dot.
function addUluruMarker() {
  const markerElement = document.createElement('div');
  markerElement.className = 'uluru-marker';
  markerElement.innerHTML = `
    <div class="red-line horizontal"></div>
    <div class="red-line vertical"></div>
    <div class="blinking-dot"></div>
  `;
  new mapboxgl.Marker({ element: markerElement, anchor: 'center' })
    .setLngLat([131.0369, -25.3444])
    .addTo(map);
}

// Timer elements references (clock and countdown).
const clockElement = document.getElementById('clock');
const countdownElement = document.getElementById('countdown');
let countdownTime = 60 * 1000; // 1 minute in milliseconds.
let syncInterval; // For synchronized timer updates.

// Update the local time clock.
function updateClock() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const centiseconds = Math.floor(now.getMilliseconds() / 10)
    .toString()
    .padStart(2, '0');
  clockElement.innerText = `${hours}:${minutes}:${seconds}:${centiseconds}`;
}

// Update the countdown timer.
function updateCountdown() {
  countdownTime -= 10; // Decrement by 10ms
  if (countdownTime < 0) countdownTime = 0;
  
  const minutes = Math.floor((countdownTime % (1000 * 60 * 60)) / (1000 * 60))
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor((countdownTime % (1000 * 60)) / 1000)
    .toString()
    .padStart(2, '0');
  const centiseconds = Math.floor((countdownTime % 1000) / 10)
    .toString()
    .padStart(2, '0');
  countdownElement.innerText = `${minutes}:${seconds}:${centiseconds}`;
  
  // When countdown reaches zero, clear the interval and reload the page.
  if (countdownTime <= 0) {
    clearInterval(syncInterval);
    setTimeout(() => {
      window.location.href = window.location.href;
    }, 100); // Brief delay for final state visibility.
  }
}

// Synchronize the clock and countdown timers.
function syncTimers() {
  updateClock();
  updateCountdown();
}

// When the map is loaded:
map.on('load', () => {
  hideMapElements(); // Hide unwanted labels/boundaries.
  
  // Make the map visible once style is ready to avoid flickering.
  document.getElementById('map').style.visibility = 'visible';
  
  // Add the military bases (green markers).
  addMilitaryBasesMarkers();
  
  // Add the custom Uluru marker with red cross and blinking dot.
  addUluruMarker();
  
  console.log('Map loaded; unwanted elements hidden; markers added.');
  
  // Start timers (and hence the sync) after 3 seconds (matching the red lines animation duration).
  setTimeout(() => {
    countdownTime = 60 * 1000; // Reset countdown to 1 minute.
    syncInterval = setInterval(syncTimers, 10);
  }, 3000);
});

// Re-hide elements if style data changes.
map.on('styledata', hideMapElements);
