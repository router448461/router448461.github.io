mapboxgl.accessToken = 'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10', // using the default dark style that includes labels/titles
  center: [0, 0],
  zoom: 2,
  attributionControl: false,
});

// Disable interactive gestures.
map.dragPan.disable();
map.dragRotate.disable();
map.scrollZoom.disable();
map.doubleClickZoom.disable();
map.boxZoom.disable();
map.keyboard.disable();
map.touchZoomRotate.disable();

// No code is included to hide symbol layers—titles, labels, and boundaries remain.
// The red lines overlay (defined in CSS and HTML) will continue to animate on top of the map.
map.on('load', () => {
  // You might add additional map or overlay logic here if desired.
});
