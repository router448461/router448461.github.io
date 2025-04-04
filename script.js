mapboxgl.accessToken = 'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [0, 0],
  zoom: 1.5,
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

// Real-time coordinate tracking with fixed formatting
map.on('load', () => {
  const mapContainer = map.getContainer();
  mapContainer.addEventListener('mousemove', (e) => {
    const rect = mapContainer.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const coords = map.unproject([mouseX, mouseY]);
    const lat = coords.lat.toFixed(3).padStart(7, ' ');
    const lng = coords.lng.toFixed(3).padStart(7, ' ');
    document.getElementById('target-coords').innerText = `TARGET: ${lat}, ${lng}`;
  });
});

// Parallax effect for overlay, map, and HUD
document.addEventListener('mousemove', function(e) {
  const x = (e.clientX / window.innerWidth - 0.5) * 15;
  const y = (e.clientY / window.innerHeight - 0.5) * 15;
  document.getElementById('overlay').style.transform = `translate(${x}px, ${y}px)`;
  document.getElementById('map').style.transform = `translate(${x/2}px, ${y/2}px)`;
  document.getElementById('hud').style.transform = `translate(${x/2}px, ${y/2}px)`;
});

// Move the reticle with the mouse
document.addEventListener('mousemove', function(e) {
  const reticle = document.getElementById('reticle');
  reticle.style.left = `${e.clientX}px`;
  reticle.style.top = `${e.clientY}px`;
});

// Sound effect for scan lines
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
function playBeep() {
  const oscillator = audioContext.createOscillator();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
  oscillator.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.1);
}

// Play beep every 9 seconds
setInterval(playBeep, 9000);

// Example: Change scan line color to blue
// document.documentElement.style.setProperty('--scan-color', '#0000FF');
