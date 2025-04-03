// Your Mapbox API key
mapboxgl.accessToken = 'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';

// Initialize the Mapbox map using the dark style
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [0, 0],
  zoom: 1,
  attributionControl: false
});

// Disable interactive controls for a static display
map.dragPan.disable();
map.dragRotate.disable();
map.scrollZoom.disable();
map.doubleClickZoom.disable();
map.boxZoom.disable();
map.keyboard.disable();
map.touchZoomRotate.disable();

/**
 * Hide all text labels on the map.
 * Iterates over style layers; for any layer of type "symbol" with a text-field,
 * we set its visibility to "none".
 */
function hideLabels() {
  const style = map.getStyle();
  if (!style || !style.layers) return;
  style.layers.forEach(layer => {
    if (layer.type === 'symbol' && layer.layout && layer.layout['text-field']) {
      map.setLayoutProperty(layer.id, 'visibility', 'none');
    }
  });
}

// Run label hiding after the map loads and on subsequent style updates
map.on('load', () => {
  hideLabels();
  console.log('Map loaded: overlay animations in progress.');
});
map.on('styledata', hideLabels);
