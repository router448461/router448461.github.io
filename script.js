// Your Mapbox API key
mapboxgl.accessToken = 'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';

// Initialize the Mapbox map using the dark style (default Mercator projection)
const map = new mapboxgl.Map({
  container: 'map',                           // ID of the container element
  style: 'mapbox://styles/mapbox/dark-v10',     // Using Mapbox's built-in dark style
  center: [0, 0],                             // Center of the world
  zoom: 1,                                    // A zoom level showing almost the entire world
  attributionControl: false                   // Disable built-in attribution control
});

// Disable all interactive controls to create a static map display
map.dragPan.disable();
map.dragRotate.disable();
map.scrollZoom.disable();
map.doubleClickZoom.disable();
map.boxZoom.disable();
map.keyboard.disable();
map.touchZoomRotate.disable();

/**
 * Hide all text labels on the map. This loops through all style layers
 * and hides any layer that is a symbol with a defined text field.
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

// Hide labels both when the map loads and whenever its style data is updated.
map.on('load', () => {
  hideLabels();
  console.log('Map loaded: labels hidden; animated overlay in progress.');
});
map.on('styledata', hideLabels);
