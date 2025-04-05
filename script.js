mapboxgl.accessToken = 'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';

try {
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    center: [0, 0],
    zoom: 1.5,
    attributionControl: false,
    interactive: false
  });

  map.on('load', () => {
    document.getElementById('loading').style.display = 'none';
    const mapContainer = map.getContainer();
    mapContainer.addEventListener('mousemove', (e) => {
      const rect = mapContainer.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const coords = map.unproject([mouseX, mouseY]);
      const lat = Math.max(-90, Math.min(90, coords.lat.toFixed(3)));
      const lng = coords.lng.toFixed(3);
      document.getElementById('target-coords').innerText = `TARGET: ${lat}, ${lng}`;
    });
  });

  map.on('error', () => {
    alert('Map failed to load');
  });
} catch (error) {
  console.error('Mapbox error:', error);
  alert('Failed to initialize map');
}

document.addEventListener('mousemove', function(e) {
  const x = (e.clientX / window.innerWidth - 0.5) * 10;
  const y = (e.clientY / window.innerHeight - 0.5) * 10;
  document.getElementById('overlay').style.transform = `translate(${x}px, ${y}px)`;
  document.getElementById('map').style.transform = `translate(${x/2}px, ${y/2}px)`;
  document.getElementById('hud').style.transform = `translate(${x/2}px, ${y/2}px)`;
});

document.addEventListener('mousemove', function(e) {
  const reticle = document.getElementById('reticle');
  reticle.style.left = `${e.clientX}px`;
  reticle.style.top = `${e.clientY}px`;
});
