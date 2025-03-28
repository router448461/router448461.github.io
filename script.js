// Initialize the Leaflet map
const map = L.map('map-container', {
    zoomControl: false, // Disable zoom buttons
    attributionControl: false, // Remove Leaflet attribution
    dragging: false, // Disable map dragging
    scrollWheelZoom: false, // Disable zooming with the scroll wheel
    doubleClickZoom: false, // Disable zooming with double click
    boxZoom: false, // Disable box zooming
    keyboard: false, // Disable keyboard navigation
    touchZoom: false // Disable pinch zooming on touch devices
}).setView([0, 0], 2); // Set initial view to show the whole world

// Add dark mode tiles without labels using Carto's Positron (no labels) tiles
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://carto.com/">Carto</a>',
    subdomains: 'abcd',
    maxZoom: 19
}).addTo(map);

// Function to center the red crosshair lines
const animateLinesToCenter = () => {
    const verticalLine = document.getElementById('vertical-line');
    const horizontalLine = document.getElementById('horizontal-line');

    // Start animations to bring lines to center
    verticalLine.style.animationPlayState = 'running';
    horizontalLine.style.animationPlayState = 'running';
};

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
