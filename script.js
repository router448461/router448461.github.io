mapboxgl.accessToken = 'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [0, 0],
  zoom: 2,
  attributionControl: false
});

// Disable map interactions
map.dragPan.disable();
map.dragRotate.disable();
map.scrollZoom.disable();
map.doubleClickZoom.disable();
map.boxZoom.disable();
map.keyboard.disable();
map.touchZoomRotate.disable();

// Update overlay and target coordinates on mouse move
document.addEventListener('mousemove', function(e) {
  // Parallax effect for overlay, map, and HUD
  const x = (e.clientX / window.innerWidth - 0.5) * 10;
  const y = (e.clientY / window.innerHeight - 0.5) * 10;
  document.getElementById('overlay').style.transform = `translate(${x}px, ${y}px)`;
  document.getElementById('map').style.transform = `translate(${x/2}px, ${y/2}px)`;
  document.getElementById('hud').style.transform = `translate(${x/2}px, ${y/2}px)`;

  // Get mouse position relative to map container
  const rect = map.getContainer().getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // Convert to geographic coordinates
  const coords = map.unproject([mouseX, mouseY]);
  const lat = coords.lat.toFixed(3);
  const lng = coords.lng.toFixed(3);
  document.getElementById('target-coords').innerText = `TARGET: ${lat}, ${lng}`;
});

// Generate random comms text
function randomString(length) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const messages = ["TARGET LOCKED", "WEAPON ARMED", "SYSTEMS ONLINE", "ENEMY DETECTED"];
let commsText = "";
for (let i = 0; i < 100; i++) {
  commsText += randomString(20) + " " + messages[i % messages.length] + " ";
}
document.getElementById("comms-text").innerText = commsText;
