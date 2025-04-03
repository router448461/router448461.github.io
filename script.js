// Mapbox API key
mapboxgl.accessToken = 'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';

// Initialize the map without attribution
const map = new mapboxgl.Map({
  container: 'map',                         // Container ID
  style: 'mapbox://styles/mapbox/dark-v10',   // Use the Mapbox Dark style
  center: [0, 20],                          // Initial center coordinates
  zoom: 2,                                  // Initial zoom level
  attributionControl: false                 // Remove Mapbox logo & attribution
});

// Disable all interactive controls for a static display
map.scrollZoom.disable();
map.boxZoom.disable();
map.dragRotate.disable();
map.dragPan.disable();
map.keyboard.disable();
map.doubleClickZoom.disable();
map.touchZoomRotate.disable();

map.on('load', () => {
  // Iterate through each layer of the style
  const layers = map.getStyle().layers;
  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i];
    // Check if the layer is a symbol type with a text-field (i.e. labels)
    if (layer.type === 'symbol' && layer.layout && layer.layout['text-field']) {
      // Hide the layer to remove the label
      map.setLayoutProperty(layer.id, 'visibility', 'none');
    }
  }
  console.log('Map loaded: Map is full screen, attribution removed, and labels hidden.');
});
