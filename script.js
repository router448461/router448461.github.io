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

// Capital city coordinates
const capitals = [
    { name: "Washington D.C.", lat: 38.9072, lng: -77.0369 },
    { name: "Canberra", lat: -35.2809, lng: 149.1300 }
];

// Add blinking markers for each capital
capitals.forEach(capital => {
    const blinkingDot = document.createElement('div');
    blinkingDot.className = 'blinking-dot';
    blinkingDot.setAttribute('data-coordinates', `${capital.lat.toFixed(2)}, ${capital.lng.toFixed(2)}`);

    const marker = L.marker([capital.lat, capital.lng], {
        icon: L.divIcon({
            html: blinkingDot.outerHTML,
            className: '',
            iconSize: [10, 10]
        })
    }).addTo(map);
});

// Function to re-trigger the red line animations
const resetLineAnimations = () => {
    const verticalLine = document.getElementById('vertical-line');
    const horizontalLine = document.getElementById('horizontal-line');

    // Remove and re-add the animation classes to restart them
    verticalLine.style.animation = 'none';
    horizontalLine.style.animation = 'none';

    setTimeout(() => {
        verticalLine.style.animation = 'vertical-draw 1s ease-out forwards';
        horizontalLine.style.animation = 'horizontal-draw 1s ease-out forwards';
    }, 0);
};

// Trigger animations when the map is ready
map.whenReady(() => {
    resetLineAnimations();
});

// Optimize window resize events using a debounce function
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        resetLineAnimations();
    }, 100);
});
