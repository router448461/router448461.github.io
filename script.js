// Your Mapbox API key
mapboxgl.accessToken = 'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';

// Initialize the map using the built-in dark style (default Mercator projection)
const map = new mapboxgl.Map({
  container: 'map',                          // Container ID
  style: 'mapbox://styles/mapbox/dark-v10',    // Built-in dark style
  center: [0, 0],                            // Center at [longitude, latitude]
  zoom: 1,                                   // A zoom level that shows the entire world
  attributionControl: false                  // Disable built-in attribution
});

// Disable all interactive controls for a static display
map.dragPan.disable();
map.dragRotate.disable();
map.scrollZoom.disable();
map.doubleClickZoom.disable();
map.boxZoom.disable();
map.keyboard.disable();
map.touchZoomRotate.disable();

/**
 * Hide text labels (if any) on the map by disabling visibility for symbol layers with 'text-field'
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

// Hide labels when the map loads and whenever the style data updates
map.on('load', () => {
  hideLabels();
  console.log('Map loaded: full screen with arrow cursor, target overlay, and labels hidden.');
});
map.on('styledata', hideLabels);
