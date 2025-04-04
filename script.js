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
        (layer.id.includes("boundary") ||
         layer.id.includes("admin-0") ||
         layer.id.includes("admin-1")))
    ) {
      map.setLayoutProperty(layer.id, "visibility", "none");
    }
  });
}

// When the map is loaded:
map.on("load", () => {
  hideMapElements();
  // Make the map visible after style adjustments.
  document.getElementById("map").style.visibility = "visible";

  // After 3 seconds, trigger a flash on the status message.
  setTimeout(() => {
    const statusEl = document.getElementById("status");
    statusEl.classList.add("flash");
  }, 3000);

  // After 6 seconds (3s delay + 3s red line animation), hide the status message and show the clock.
  setTimeout(() => {
    document.getElementById("status").style.display = "none";
    document.getElementById("clock").style.display = "block";
    startClock();
  }, 6000);
});

// Re-apply the hideMapElements function if the style data changes.
map.on("styledata", hideMapElements);

// Function to start the local time clock.
function startClock() {
  updateClock(); // Update immediately.
  setInterval(updateClock, 1000);
}

// Update the clock element with the visitor's local time (HH:MM:SS format).
function updateClock() {
  const clockEl = document.getElementById("clock");
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");
  clockEl.innerText = `${hours}:${minutes}:${seconds}`;
}
