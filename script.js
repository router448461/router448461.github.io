const map = L.map('map-container', {
    zoomControl: false,
    attributionControl: false,
    dragging: false, // Disabled
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
    }).addTo(map); // No hover interaction
});

const syncDotsWithClock = () => {
    document.querySelectorAll('.blinking-dot').forEach(dot => {
        dot.style.animationDuration = "1s"; // Consistent blinking every second
    });
};
setInterval(syncDotsWithClock, 1000);
