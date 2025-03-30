// Initialize the Leaflet Map
const map = L.map('map-container', {
    zoomControl: false,
    attributionControl: false,
    dragging: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false,
    keyboard: false,
    touchZoom: false
}).setView([0, 0], 2);

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://carto.com/">Carto</a>',
    subdomains: 'abcd',
    maxZoom: 19
}).addTo(map);

// Capital City Coordinates
const capitals = [
    { name: "Washington D.C.", lat: 38.9072, lng: -77.0369 },
    { name: "Canberra", lat: -35.2809, lng: 149.1300 },
    { name: "Tokyo", lat: 35.6895, lng: 139.6917 }
];

// Create Blinking Dot Icon
const createBlinkingDot = (coordinates) => {
    return L.divIcon({
        html: `<div class="blinking-dot" data-coordinates="${coordinates}"></div>`,
        className: '',
        iconSize: [10, 10]
    });
};
