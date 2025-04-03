// Mapbox API key
mapboxgl.accessToken = 'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';

// Initialize the map with Mapbox Dark style
const map = new mapboxgl.Map({
  container: 'map',                     // ID of the container element
  style: 'mapbox://styles/mapbox/dark-v10', // Use Mapbox’s built-in dark style
  center: [0, 20],                      // Set initial center coordinates
  zoom: 2,                              // Set initial zoom level
  projection: 'equalEarth'              // Use Equal Earth projection (optional)
});

// Disable interactive controls for a static map experience
map.scrollZoom.disable();
map.boxZoom.disable();
map.dragRotate.disable();
map.dragPan.disable();
map.keyboard.disable();
map.doubleClickZoom.disable();
map.touchZoomRotate.disable();

// Debugging logs for successful load and style data
map.on('load', () => {
  console.log('Map has loaded successfully.');
  console.log('Active style:', map.getStyle());
});

// Error handling for Mapbox events
map.on('error', (error) => {
  console.error('Mapbox encountered an error:', error);
});

// Additional debugging for style and source data events
map.on('styledata', () => {
  console.log('Style data updated:', map.getStyle());
});

map.on('sourcedata', () => {
  console.log('Source data event fired.');
});

console.log('Mapbox map initialization complete.');
