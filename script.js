// Your Mapbox API key
mapboxgl.accessToken =
  'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';

// Initialize the Mapbox map
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [131.0369, -25.3444], // Centered on Uluru
  zoom: 4,
  attributionControl: false,
});

// Disable interactive controls for a static experience
map.dragPan.disable();
map.dragRotate.disable();
map.scrollZoom.disable();
map.doubleClickZoom.disable();
map.boxZoom.disable();
map.keyboard.disable();
map.touchZoomRotate.disable();

// Function to hide text labels and administrative boundaries from the map
function hideMapElements() {
  const style = map.getStyle();
  if (!style || !style.layers) return;

  style.layers.forEach((layer) => {
    if (
      layer.type === 'symbol' || // Hide symbols (like text labels)
      layer.id.includes('boundary') || // Hide boundaries
      layer.id.includes('admin-0') || // Hide country boundaries
      layer.id.includes('admin-1') // Hide state/province boundaries
    ) {
      map.setLayoutProperty(layer.id, 'visibility', 'none');
    }
  });
}

// Add a blinking red dot at Uluru
function addBlinkingDot() {
  const uluruDot = document.createElement('div');
  uluruDot.className = 'blinking-dot';
  new mapboxgl.Marker(uluruDot).setLngLat([131.0369, -25.3444]).addTo(map);
}

// Clock and countdown timer sync logic
const clockElement = document.getElementById('clock');
const countdownElement = document.getElementById('countdown');
let countdownTime = 60 * 1000; // 60,000ms = 1 minute

// Update the clock timer (local time)
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

// Update the countdown timer in sync with the clock
function updateCountdown() {
  countdownTime -= 10; // Decrease by 10ms
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

  // If countdown reaches zero, reload the page to restart the loop
  if (countdownTime <= 0) {
    clearInterval(syncInterval); // Stop the interval
    setTimeout(() => {
      window.location.href = window.location.href; // Force reload
    }, 100); // Brief delay for visibility
  }
}

// Sync both timers and the blinking dot
function syncTimersAndDot() {
  updateClock(); // Update the local clock
  updateCountdown(); // Update the countdown
}

// When the map is loaded
map.on('load', () => {
  hideMapElements(); // Hide boundaries and labels
  addBlinkingDot(); // Add the red dot at Uluru
  console.log('Map loaded, boundaries hidden, and red dot added.');

  // Delay the start of the timers by 3 seconds for the red lines animation
  setTimeout(() => {
    countdownTime = 60 * 1000; // Reset countdown to 1 minute
    syncInterval = setInterval(syncTimersAndDot, 10); // Start syncing timers every 10ms
  }, 3000); // 3-second delay
});
