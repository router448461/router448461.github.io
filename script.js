mapboxgl.accessToken = 'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [0, 0],
  zoom: 2,
  attributionControl: false
});
map.dragPan.disable();
map.dragRotate.disable();
map.scrollZoom.disable();
map.doubleClickZoom.disable();
map.boxZoom.disable();
map.keyboard.disable();
map.touchZoomRotate.disable();
document.addEventListener('mousemove', function(e) {
  const x = (e.clientX / window.innerWidth - 0.5) * 10;
  const y = (e.clientY / window.innerHeight - 0.5) * 10;
  document.getElementById('overlay').style.transform = `translate(${x}px, ${y}px)`;
  document.getElementById('map').style.transform = `translate(${x/2}px, ${y/2}px)`;
});
map.on('load', function() {
  map.addSource('blast-radius', {
    type: 'geojson',
    data: {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [0, 0]
      }
    }
  });
  map.addLayer({
    id: 'blast-radius-layer',
    type: 'circle',
    source: 'blast-radius',
    paint: {
      'circle-radius': 100,
      'circle-color': 'red',
      'circle-opacity': 0.3
    }
  });
});
