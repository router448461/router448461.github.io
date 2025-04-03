// Mapbox API key
mapboxgl.accessToken = 'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';

// Initialize the map
const map = new mapboxgl.Map({
  container: 'map',                     // ID of the container element
  style: 'mapbox://styles/mapbox/dark-v10', // Use Mapbox’s built-in dark style
  center: [0, 20],                      // Set initial center coordinates
  zoom: 2,                              // Set initial zoom level
  projection: 'equalEarth',             // Use Equal Earth projection (optional)
  attributionControl: false             // Disable Mapbox logo and attribution
});

// Disable interactive controls
map.scrollZoom.disable();
map.boxZoom.disable();
map.dragRotate.disable();
map.dragPan.disable();
map.keyboard.disable();
map.doubleClickZoom.disable();
map.touchZoomRotate.disable();

// Debugging logs
map.on('load', () => {
  console.log('Map loaded successfully');
});
