// Initialize the Leaflet map
const map = L.map('map-container', {
    zoomControl: false, // Disable zoom buttons
    attributionControl: false, // Remove Leaflet attribution
}).setView([0, 0], 2); // Center on 0,0 (world view)

// Add OpenStreetMap tiles (free and reliable, no authentication needed)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
    noWrap: true // Prevent infinite map scrolling
}).addTo(map);

// Resize the map to fit the browser window
map.whenReady(() => {
    map.invalidateSize(); // Fix sizing issues after load
});

// Ensure the map resizes correctly on window resize
window.addEventListener('resize', () => {
    map.invalidateSize(); // Force Leaflet to re-calculate map size
});
