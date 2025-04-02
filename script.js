// Mapbox API key
mapboxgl.accessToken = 'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';

// Initialize the map
const map = new mapboxgl.Map({
    container: 'map', // ID of the container where the map is rendered
    style: 'mapbox://styles/router448461/cm8zh31z3005f01sradm3gkfg', // Your verified Mapbox style URL
    center: [0, 20], // Adjusted center coordinates to focus on a populated area
    zoom: 2,         // Increased zoom level to ensure visible map details
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

// Add debugging tools
map.on('load', () => {
    console.log('Map has loaded successfully.');
    console.log(map.getStyle()); // Logs the active style to verify it

    // Ensure the map container is displayed
    if (!document.getElementById('map').style.height) {
        document.getElementById('map').style.height = '100%';
    }

    // Log sources and layers
    const style = map.getStyle();
    console.log('Style data:', style);

    // Check sources
    for (const source in style.sources) {
        console.log(`Source: ${source}`, style.sources[source]);
    }

    // Check layers
    style.layers.forEach(layer => {
        console.log(`Layer: ${layer.id}`, layer);
    });
});

// Error handling for debugging Mapbox issues
map.on('error', (e) => {
    console.error('Mapbox error:', e);
});

// Log initialization confirmation
console.log('Mapbox map initialized successfully');

// Additional logging to diagnose issues
map.on('styledata', () => {
    console.log('Style data loaded:', map.getStyle());
});

map.on('sourcedata', () => {
    console.log('Source data loaded:', map.getSource());
});
