// Your Mapbox API key
mapboxgl.accessToken = 'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';

// Initialize the map
const map = new mapboxgl.Map({
  container: 'map',                          // The ID of the container to render the map into
  style: 'mapbox://styles/mapbox/dark-v10',    // Using the built-in dark style (Mercator projection by default)
  center: [0, 0],                            // Center of the world (longitude, latitude)
  zoom: 1,                                   // A zoom level that shows the entire world
  attributionControl: false                  // Disable the built-in attribution control
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
 * Hide all text labels.
 * Whenever the style data is loaded or updated,
 * loop through all layers. If a layer is of type 'symbol'
 * and defines a 'text-field', hide it.
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

// Hide labels once on load...
map.on('load', () => {
  hideLabels();
  console.log('Map loaded: full-screen, no labels, and no attribution.');
});

// ...and also whenever the style data is updated.
map.on('styledata', () => {
  hideLabels();
});
