// Your Mapbox API key
mapboxgl.accessToken = 'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';

// Initialize the Mapbox map in the "dark" style
const map = new mapboxgl.Map({
  container: 'map', // ID of the container element
  style: 'mapbox://styles/mapbox/dark-v10', // Use the built-in dark style
  center: [0, 0], // Center the map at [0, 0]
  zoom: 1, // A low zoom for a nearly full-world view
  attributionControl: false, // Disable built-in attribution
});

// Disable interactive controls for a completely static display
map.dragPan.disable();
map.dragRotate.disable();
map.scrollZoom.disable();
map.doubleClickZoom.disable();
map.boxZoom.disable();
map.keyboard.disable();
map.touchZoomRotate.disable();

/**
 * Hide all text labels on the map.
 * Iterates over each style layer; if a layer is a symbol with a text field, it hides it.
 */
function hideLabels() {
  const style = map.getStyle();
  if (!style || !style.layers) return;
  style.layers.forEach((layer) => {
    if (layer.type === 'symbol' && layer.layout && layer.layout['text-field']) {
      map.setLayoutProperty(layer.id, 'visibility', 'none');
    }
  });
}

// Hide labels when the map loads and on style updates.
map.on('load', () => {
  hideLabels();
  console.log('Map loaded: overlay animations in progress.');
});
map.on('styledata', hideLabels);
