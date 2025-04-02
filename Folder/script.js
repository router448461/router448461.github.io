// Mapbox API key
mapboxgl.accessToken = 'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';

// Initialize the map
const map = new mapboxgl.Map({
    container: 'map', // ID of the container where the map is rendered
    style: 'mapbox://styles/router448461/cm8zh31z3005f01sradm3gkfg', // Verified Mapbox style ID
    center: [0, 0], // Center map at coordinates [longitude, latitude]
    zoom: 1,        // Default zoom level
    projection: 'equalEarth' // Set the map projection to Equal Earth
});

// Disable all mouse interactions for a static map experience
map.scrollZoom.disable();  // Disable scroll zoom
map.boxZoom.disable();     // Disable box zoom
map.dragRotate.disable();  // Disable drag rotation
map.dragPan.disable();     // Disable drag panning
map.keyboard.disable();    // Disable keyboard interactions
map.doubleClickZoom.disable(); // Disable double-click zoom
map.touchZoomRotate.disable(); // Disable touch gestures
