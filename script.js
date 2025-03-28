// Initialize the Leaflet map
const map = L.map('map-container', {
    zoomControl: false, // Disable zoom buttons
    attributionControl: false, // Remove Leaflet attribution
    worldCopyJump: true // Ensure the world doesn't wrap infinitely
}).setView([0, 0], 2); // Initial map view at [Lat, Lng]

// Add dark mode tiles without labels using Carto's Positron (no labels) tiles
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://carto.com/">Carto</a>',
    subdomains: 'abcd',
    maxZoom: 19,
    noWrap: true // Prevent horizontal map wrapping
}).addTo(map);

// Function to center the red crosshair lines
function animateLinesToCenter() {
    const verticalLine = document.getElementById('vertical-line');
    const horizontalLine = document.getElementById('horizontal-line');

    verticalLine.style.left = `${window.innerWidth / 2}px`;
    horizontalLine.style.top = `${window.innerHeight / 2}px`;
}

// Trigger a flash effect on map click
map.on('click', () => {
    const mapContainer = document.getElementById('map-container');
    mapContainer.classList.add('flash');

    setTimeout(() => {
        mapContainer.classList.remove('flash');
    }, 200);
});

// Center the lines when the map is loaded
map.whenReady(() => {
    animateLinesToCenter();
});

// Recalculate the lines on window resize
window.addEventListener('resize', () => {
    animateLinesToCenter();
});
