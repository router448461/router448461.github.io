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

// Updated Landmark Coordinates
const capitals = [
    { name: "White House", lat: 38.8977, lng: -77.0365 },
    { name: "Eiffel Tower", lat: 48.8584, lng: 2.2945 },
    { name: "Brandenburg Gate", lat: 52.5163, lng: 13.3777 },
    { name: "Blenheim Palace", lat: 51.8418, lng: -1.3605 }
];

// Create Blinking Dot Icon
const createBlinkingDot = () => {
    return L.divIcon({
        html: `<div class="blinking-dot"></div>`,
        className: '',
        iconSize: [10, 10]
    });
};

// Add Markers
capitals.forEach(capital => {
    L.marker([capital.lat, capital.lng], {
        icon: createBlinkingDot()
    }).addTo(map);
});

// Synchronize Blinking Dots with the Clock
const syncDotsWithClock = () => {
    const now = new Date();
    document.querySelectorAll('.blinking-dot').forEach(dot => {
        dot.style.animation = `blink-animation 1s steps(1, start) infinite`;
    });
};
setInterval(syncDotsWithClock, 1000);

// Update Clock Panel
const updateClock = () => {
    const now = new Date();
    const timeWithNS = now.toLocaleTimeString('en-US', { hour12: false }) + ' ns';
    document.getElementById('time-panel').textContent = `Time: ${timeWithNS}`;
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
