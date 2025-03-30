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

// Add Markers
capitals.forEach(capital => {
    L.marker([capital.lat, capital.lng], {
        icon: createBlinkingDot(`${capital.lat.toFixed(2)}, ${capital.lng.toFixed(2)}`)
    }).on('mouseover', (e) => {
        document.getElementById('coordinates-panel').textContent =
            `Coordinates: ${e.latlng.lat.toFixed(2)}, ${e.latlng.lng.toFixed(2)}`;
    }).addTo(map);
});

// Synchronize Blinking Dots with the Clock
const syncDotsWithClock = () => {
    const now = new Date();
    const seconds = now.getSeconds();
    document.querySelectorAll('.blinking-dot').forEach(dot => {
        dot.style.animationDuration = `${60 / seconds}s`;
    });
};
setInterval(syncDotsWithClock, 1000);

// Update Clock Panel
const updateClock = () => {
    const now = new Date();
    document.getElementById('time-panel').textContent = `Time: ${now.toLocaleTimeString('en-US', { hour12: false })}`;
};
setInterval(updateClock, 1000);

// Day/Night Mode Toggle
const updateDayNightMode = () => {
    const now = new Date();
    const hours = now.getHours();
    const mode = (hours >= 6 && hours < 18) ? 'Day' : 'Night';
    document.getElementById('day-night-panel').textContent = `Mode: ${mode}`;
    document.body.style.backgroundColor = mode === 'Day' ? 'var(--day-bg-color)' : 'var(--night-bg-color)';
};
setInterval(updateDayNightMode, 60000); // Check every minute

// Initialize Panels on Load
updateClock();
updateDayNightMode();
syncDotsWithClock();
