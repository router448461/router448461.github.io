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
    document.getElementById('target-coords').innerText = `TARGET: ${lat}, ${lng}`;
  });
});
document.addEventListener('mousemove', function(e) {
  const reticle = document.getElementById('reticle');
  reticle.style.left = `${e.clientX}px`;
  reticle.style.top = `${e.clientY}px`;
});
