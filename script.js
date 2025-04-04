mapboxgl.accessToken = 'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [0, 0],
  zoom: 2,
  attributionControl: false,
});

// Disable interactive gestures.
map.dragPan.disable();
map.dragRotate.disable();
map.scrollZoom.disable();
map.doubleClickZoom.disable();
map.boxZoom.disable();
map.keyboard.disable();
map.touchZoomRotate.disable();

// Hide unwanted map elements (labels/titles) as early as possible.
function hideMapElements() {
  const style = map.getStyle();
  if (!style || !style.layers) return;
  style.layers.forEach((layer) => {
    if (layer.type === 'symbol' && layer.layout && layer.layout.visibility !== 'none') {
      map.setLayoutProperty(layer.id, 'visibility', 'none');
    }
  });
}

// Run hideMapElements on every style data update.
map.on('styledata', hideMapElements);

map.on('load', () => {
  // Hide labels one more time on load...
  hideMapElements();
  // Reveal the map container immediately once the style data has been processed.
  document.getElementById('map').style.visibility = 'visible';
});
