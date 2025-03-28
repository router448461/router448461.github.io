// Initialize the Leaflet map
const map = L.map('map-container').setView([0, 0], 2); // Initial map view at [Lat, Lng]

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
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
