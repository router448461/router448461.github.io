const map = L.map('map-container', {
    zoomControl: false,
    attributionControl: false
}).setView([0, 0], 2);

const dayLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
});

const nightLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; Carto',
    maxZoom: 19
});

dayLayer.addTo(map);

const capitals = [
    { name: "White House", lat: 38.8977, lng: -77.0365 },
    { name: "Eiffel Tower", lat: 48.8584, lng: 2.2945 },
    { name: "Brandenburg Gate", lat: 52.5163, lng: 13.3777 },
    { name: "Blenheim Palace", lat: 51.8418, lng: -1.3605 }
];

capitals.forEach(capital => {
    L.marker([capital.lat, capital.lng], {
        icon: L.divIcon({
            html: `<div class="blinking-dot"></div>`,
            className: ''
        })
    }).addTo(map).bindTooltip(capital.name, { permanent: true });
});

document.getElementById('zoom-fit').addEventListener('click', () => {
    const bounds = capitals.map(c => [c.lat, c.lng]);
    map.fitBounds(bounds);
});

document.getElementById('toggle-mode').addEventListener('click', () => {
    const currentMode = map.hasLayer(dayLayer) ? 'Day' : 'Night';
    document.getElementById('day-night-panel').textContent = `Mode: ${currentMode === 'Day' ? 'Night' : 'Day'}`;
    map.removeLayer(currentMode === 'Day' ? dayLayer : nightLayer);
    (currentMode === 'Day' ? nightLayer : dayLayer).addTo(map);
});
