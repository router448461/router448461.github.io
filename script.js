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

const capitals = [
    { name: "White House", lat: 38.8977, lng: -77.0365 },
    { name: "Eiffel Tower", lat: 48.8584, lng: 2.2945 },
    { name: "Brandenburg Gate", lat: 52.5163, lng: 13.3777 },
    { name: "Blenheim Palace", lat: 51.8418, lng: -1.3605 }
];

const createBlinkingDot = () => {
    return L.divIcon({
        html: `<div class="blinking-dot"></div>`,
        className: '',
        iconSize: [10, 10]
    });
};

capitals.forEach(capital => {
    L.marker([capital.lat, capital.lng], {
        icon: createBlinkingDot()
    }).addTo(map).on('mouseover', (e) => {
        document.getElementById('coordinates-panel').textContent =
            `Coordinates: ${e.latlng.lat.toFixed(2)}, ${e.latlng.lng.toFixed(2)}`;
    });
});

const syncDotsWithClock = () => {
    document.querySelectorAll('.blinking-dot').forEach(dot => {
        dot.style.animationDuration = "1s"; // Consistent blinking every second
    });
};
setInterval(syncDotsWithClock, 1000);

const updateClock = () => {
    const now = new Date();
    const milliseconds = now.getMilliseconds();
    const formattedMilliseconds = milliseconds.toString().padStart(3, '0');
    document.getElementById('time-panel').textContent =
        `Time: ${now.toLocaleTimeString('en-US', { hour12: false })}:${formattedMilliseconds}`;
};
setInterval(updateClock, 100);

const refreshPage = () => {
    window.location.reload(); // Refresh page every 30 seconds
};
setTimeout(refreshPage, 30000);
