// Replace the following token with your valid Mapbox API token.
mapboxgl.accessToken =
  'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';

let blinkingDotElement; // Global reference for blinking dot

// Initialize the Mapbox map, centered on Uluru.
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [131.0369, -25.3444], // Uluru coordinates
  zoom: 4,
  attributionControl: false,
});

// Disable interactivity for a static presentation.
map.dragPan.disable();
map.dragRotate.disable();
map.scrollZoom.disable();
map.doubleClickZoom.disable();
map.boxZoom.disable();
map.keyboard.disable();
map.touchZoomRotate.disable();

// Hide labels and boundaries to prevent flicker of world titles.
function hideMapElements() {
  const style = map.getStyle();
  if (!style || !style.layers) return;
  style.layers.forEach(layer => {
    if (
      layer.type === 'symbol' ||
      (layer.id && (layer.id.includes('boundary') || layer.id.includes('admin-0') || layer.id.includes('admin-1')))
    ) {
      map.setLayoutProperty(layer.id, 'visibility', 'none');
    }
  });
}

// Add a blinking dot over Uluru.
function addBlinkingDot() {
  const dot = document.createElement('div');
  dot.className = 'blinking-dot';
  blinkingDotElement = dot; // Save a reference for synchronous updates.
  new mapboxgl.Marker(dot).setLngLat([131.0369, -25.3444]).addTo(map);
}

// References to our timer elements.
const clockElement = document.getElementById('clock');
const countdownElement = document.getElementById('countdown');
let countdownTime = 60 * 1000; // 1 minute in milliseconds.
let syncInterval; // Global sync interval.

// Update the clock (local time) and—here, also update the blinking dot's opacity.
// We toggle the dot's opacity so that it "flashes" in sync with the clock updates.
function updateClock() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const centiseconds = Math.floor(now.getMilliseconds() / 10).toString().padStart(2, '0');
  clockElement.innerText = `${hours}:${minutes}:${seconds}:${centiseconds}`;
  
  // For a fast flash, toggle opacity using the centiseconds.
  if (blinkingDotElement) {
    blinkingDotElement.style.opacity = (parseInt(centiseconds) % 2 === 0) ? '1' : '0';
  }
}

// Update the countdown timer.
function updateCountdown() {
  countdownTime -= 10; // Decrement by 10ms.
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
  
  // If the countdown has reached zero, clear the sync interval and force a full reload.
  if (countdownTime <= 0) {
    clearInterval(syncInterval);
    setTimeout(() => {
      window.location.href = window.location.href; // Fully reload the page.
    }, 100); // Brief delay to show the final state.
  }
}

// Synchronize both timers (and blinking dot) together.
function syncTimers() {
  updateClock();
  updateCountdown();
}

// When the map has loaded:
map.on('load', () => {
  hideMapElements(); // Immediately hide unwanted labels/boundaries.
  
  // Once the style is ready, show the map container.
  document.getElementById('map').style.visibility = 'visible';
  
  addBlinkingDot(); // Add the blinking red dot over Uluru.
  
  console.log('Map loaded, labels hidden, and blinking dot added.');
  
  // Delay the start of the timers by 3 seconds (to allow red line animation to complete).
  setTimeout(() => {
    countdownTime = 60 * 1000; // Reset countdown to 1 minute.
    syncInterval = setInterval(syncTimers, 10); // Start syncing every 10ms.
  }, 3000);
});

// In case the style data updates, re-hide the labels/boundaries.
map.on('styledata', hideMapElements);
