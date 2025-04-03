// Mapbox API key
mapboxgl.accessToken = 'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';

// Initialize the map with attribution disabled and adjusted view parameters
const map = new mapboxgl.Map({
  container: 'map',                          // Container ID
  style: 'mapbox://styles/mapbox/dark-v10',    // Built-in Mapbox Dark style
  center: [0, 0],                            // Center the map at [longitude, latitude]
  zoom: 1,                                   // Lower zoom level to fit the entire world in view
  projection: 'equalEarth',                  // Optional: use the Equal Earth projection for a flat look
  attributionControl: false                  // Disable the built-in attribution control
});

// Disable interactive controls for a static map experience
map.scrollZoom.disable();
map.boxZoom.disable();
map.dragRotate.disable();
map.dragPan.disable();
map.keyboard.disable();
map.doubleClickZoom.disable();
map.touchZoomRotate.disable();

// Once the map loads, remove any attribution elements that might appear
map.on('load', () => {
  // Hide any Mapbox attribution element (should be hidden by CSS too)
  const attribs = document.getElementsByClassName('mapboxgl-ctrl-attrib');
  for (let i = 0; i < attribs.length; i++) {
    attribs[i].style.display = 'none';
  }
  console.log('Map loaded: full world view with attribution removed.');
});
