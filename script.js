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
    { name: "Canberra", lat: -35.2809, lng: 149.1300 },
    { name: "Tokyo", lat: 35.6895, lng: 139.6917 }
];

// Create blinking dot icon
const createBlinkingDot = (coordinates) => {
    return L.divIcon({
        html: `<div class="blinking-dot" data-coordinates="${coordinates}"></div>`,
        className: '',
        iconSize: [10, 10]
    });
};

// Add blinking markers for each capital and connect them with lines
capitals.forEach((capital, index) => {
    const marker = L.marker([capital.lat, capital.lng], {
        icon: createBlinkingDot(`${capital.lat.toFixed(2)}, ${capital.lng.toFixed(2)}`)
    }).on('mouseover', (e) => {
        const coordinatesPanel = document.getElementById('coordinates-panel');
        coordinatesPanel.textContent = `Coordinates: ${e.latlng.lat.toFixed(2)}, ${e.latlng.lng.toFixed(2)} (City: ${capital.name})`;
    }).on('click', (e) => {
        const verticalLine = document.getElementById('vertical-line');
        const horizontalLine = document.getElementById('horizontal-line');
        verticalLine.style.left = `${e.containerPoint.x}px`;
        horizontalLine.style.top = `${e.containerPoint.y}px`;
    }).addTo(map);

    if (index > 0) {
        const prevCapital = capitals[index - 1];
        L.polyline(
            [[capital.lat, capital.lng], [prevCapital.lat, prevCapital.lng]],
            { color: 'red', weight: 1 }
        ).addTo(map);
    }
});

// Function to re-trigger the red line animations
