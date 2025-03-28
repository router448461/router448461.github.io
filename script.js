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
    updateWhenIdle: true // Optimize tile loading
}).addTo(map);

// Set bounds to prevent scrolling beyond the world
const bounds = [
    [-90, -180], // South-West corner
    [90, 180]    // North-East corner
];
map.setMaxBounds(bounds);
map.on('drag', () => {
    map.panInsideBounds(bounds, { animate: true });
});

// Function to center the red crosshair lines
const animateLinesToCenter = () => {
    const verticalLine = document.getElementById('vertical-line');
    const horizontalLine = document.getElementById('horizontal-line');
    verticalLine.style.left = `${window.innerWidth / 2}px`;
    horizontalLine.style.top = `${window.innerHeight / 2}px`;
};

// Trigger a flash effect on map click
map.on('click', (e) => {
    const mapContainer = document.getElementById('map-container');
    mapContainer.classList.add('flash');

    setTimeout(() => {
        mapContainer.classList.remove('flash');
    }, 200);

    // Show coordinates tooltip
    const { lat, lng } = e.latlng;
    L.popup()
        .setLatLng([lat, lng])
        .setContent(`Coordinates: ${lat.toFixed(2)}, ${lng.toFixed(2)}`)
        .openOn(map);
});

// Center the lines when the map is loaded
map.whenReady(() => {
    animateLinesToCenter();
});

// Optimize window resize events using a debounce function
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        animateLinesToCenter();
    }, 100);
});

// Optional: Add a dark/light mode toggle for tiles
const toggleTheme = (isDark) => {
    const tileURL = isDark
        ? 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png';
    L.tileLayer(tileURL, { maxZoom: 19 }).addTo(map);
};
// Example usage: toggleTheme(true); for dark mode
