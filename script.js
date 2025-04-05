mapboxgl.accessToken = 'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [0, 0],
  zoom: 1.5,
  attributionControl: false
});
map.dragPan.disable();
map.dragRotate.disable();
map.scrollZoom.disable();
map.doubleClickZoom.disable();
map.boxZoom.disable();
map.keyboard.disable();
map.touchZoomRotate.disable();
map.on('load', () => {
  const mapContainer = map.getContainer();
  mapContainer.addEventListener('mousemove', (e) => {
    const rect = mapContainer.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const coords = map.unproject([mouseX, mouseY]);
    const lat = coords.lat.toFixed(3);
    const lng = coords.lng.toFixed(3);
    document.getElementById('target-coords').innerHTML = `<span>LAT. ${lat}</span><span>LON. ${lng}</span>`;
  });
});
document.addEventListener('mousemove', function(e) {
  const reticle = document.getElementById('reticle');
  reticle.style.left = `${e.clientX}px`;
  reticle.style.top = `${e.clientY}px`;
});
function updateTimer() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
  document.getElementById('timer').innerText = `${hours}:${minutes}:${seconds}:${milliseconds}`;
}
setInterval(updateTimer, 10);
