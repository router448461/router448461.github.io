// Initialize the Leaflet map
const map = L.map('map-container', {
    zoomControl: false, // Disable zoom buttons
    attributionControl: false, // Remove Leaflet attribution
}).setView([0, 0], 2);

// Add dark mode tiles without labels using Carto's Positron (no labels) tiles
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://carto.com/">Carto</a>',
    subdomains: 'abcd',
    maxZoom: 19,
}).addTo(map);

// Function to center the red crosshair lines
const animateLinesToCenter = () => {
    document.getElementById('vertical-line').style.left = `${window.innerWidth / 2}px`;
    document.getElementById('horizontal-line').style.top = `${window.innerHeight / 2}px`;
};

// Trigger a flash effect on map click
map.on('click', () => {
    const mapContainer = document.getElementById('map-container');
    mapContainer.classList.add('flash');

    setTimeout(() => {
        mapContainer.classList.remove('flash');
    }, 200);
});

// Center the lines when the map is loaded
map.whenReady(animateLinesToCenter);

// Recalculate the lines on window resize
window.addEventListener('resize', animateLinesToCenter);
