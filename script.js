// Initialize the Leaflet map
const map = L.map('map-container', {
    zoomControl: false, // Disable zoom buttons
    attributionControl: false, // Remove Leaflet attribution
    worldCopyJump: true // Prevent infinite horizontal scrolling
}).setView([0, 0], 2); // Set initial map view

// Add dark mode tiles using Stadia Maps (no labels)
L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>',
    maxZoom: 19,
    noWrap: true // Prevent infinite horizontal wrapping
}).addTo(map);

// Force Leaflet to respect the container dimensions
map.whenReady(() => {
    map.invalidateSize(); // Ensures correct rendering after map loads
    animateLinesToCenter();
});

// Center the red crosshair lines
function animateLinesToCenter() {
    const verticalLine = document.getElementById('vertical-line');
    const horizontalLine = document.getElementById('horizontal-line');

    verticalLine.style.left = `${window.innerWidth / 2}px`;
    horizontalLine.style.top = `${window.innerHeight / 2}px`;
}

// Recalculate map size and center lines on window resize
window.addEventListener('resize', () => {
    map.invalidateSize(); // Fixes map size after resizing
    animateLinesToCenter();
});
