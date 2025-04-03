// Your Mapbox API key
mapboxgl.accessToken = 'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';

// Initialize the map using Mapbox Dark style with a full-world view.
// Note: We disable attributionControl to remove the default attribution.
const map = new mapboxgl.Map({
  container: 'map',                          // Container element ID
  style: 'mapbox://styles/mapbox/dark-v10',    // Use the built-in Mapbox Dark style
  center: [0, 0],                            // Center the map at longitude 0, latitude 0
  zoom: 1,                                   // A zoom level that shows nearly the entire world
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
 * Hides all text labels on the map by iterating through the style layers.
 * For any layer of type "symbol" that has a text-field, we set its visibility to "none".
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

// Hide labels once when the map loads...
map.on('load', () => {
  hideLabels();
  console.log('Map loaded: overlay, labels hidden, and static view established.');
});

// ...and also whenever the style data is updated.
map.on('styledata', hideLabels);
