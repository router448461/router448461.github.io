// Initialize the Leaflet map
const map = L.map('map-container').setView([0, 0], 2); // Set initial view: [Latitude, Longitude]

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Animate the red crosshair lines to meet at the center of the screen
function animateLinesToCenter() {
    const verticalLine = document.getElementById('vertical-line');
    const horizontalLine = document.getElementById('horizontal-line');

    // Set lines to target the center of the viewport
    verticalLine.style.left = `${window.innerWidth / 2}px`;
    horizontalLine.style.top = `${window.innerHeight / 2}px`;
}

// Trigger the flash effect on map click
map.on('click', () => {
    const mapContainer = document.getElementById('map-container');
    mapContainer.classList.add('flash');

    // Remove the flash effect after the animation ends
    setTimeout(() => {
        mapContainer.classList.remove('flash');
    }, 200);
});

// Start the animation as the map initializes
map.on('load', () => {
    animateLinesToCenter();
});

// Recalculate lines on window resize
window.addEventListener('resize', () => {
    animateLinesToCenter();
});
