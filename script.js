// Your Mapbox API key
mapboxgl.accessToken = 'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';

// Initialize the map with the built-in dark style and disable attribution
const map = new mapboxgl.Map({
  container: 'map',                          // Container element
  style: 'mapbox://styles/mapbox/dark-v10',    // Mapbox Dark style (default Mercator projection)
  center: [0, 0],                            // Center of the world
  zoom: 1,                                   // A zoom level showing nearly the entire world
  attributionControl: false                  // Disable Mapbox's built-in attribution control
});

// Disable all interactive controls to make the map static
map.dragPan.disable();
map.dragRotate.disable();
map.scrollZoom.disable();
map.doubleClickZoom.disable();
map.boxZoom.disable();
map.keyboard.disable();
map.touchZoomRotate.disable();

/**
 * Hide all text labels in the map.
 * This function iterates through all the style layers and hides those
 * that are symbols with a defined text field.
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

// Hide labels when the map loads and on any style update
map.on('load', () => {
  hideLabels();
  console.log('Map loaded with animated target overlay. Labels and attribution hidden.');
});
map.on('styledata', hideLabels);
